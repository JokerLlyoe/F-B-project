import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Big from 'big.js';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { MenuService } from '../../menu/services/menu.service';
import { StatusService } from '../../status/services/status.service';
import { OrderPublisher } from '../../queue/publishers/order.publisher';
import { OrderStatusPublisher } from '../../queue/publishers/order-status.publisher';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemsRepository: Repository<OrderItem>,
    private readonly menuService: MenuService,
    private readonly statusService: StatusService,
    private readonly orderPublisher: OrderPublisher,
    private readonly orderStatusPublisher: OrderStatusPublisher,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    if (createOrderDto.orderType === 'delivery' && !createOrderDto.deliveryAddress) {
      throw new BadRequestException('Delivery address is required for delivery orders');
    }

    const receivedStatus = await this.statusService.findByStatus('received');

    const menuItemIds = createOrderDto.items.map(item => item.menuItemId);
    const menuItems = await Promise.all(
      menuItemIds.map(id => this.menuService.findOne(String(id)))
    );

    for (const item of menuItems) {
      if (!item.isAvailable) {
        throw new BadRequestException(`Menu item #${item.id} is currently unavailable`);
      }
    }

    const orderItems: OrderItem[] = [];
    let totalAmount = Big('0');

    for (const itemDto of createOrderDto.items) {
      const menuItem = menuItems.find(mi => mi.id === String(itemDto.menuItemId));
      const unitPrice = Big(menuItem.price);
      const subtotal = unitPrice.times(itemDto.quantity);

      const orderItem = this.orderItemsRepository.create({
        menuItemId: String(itemDto.menuItemId),
        quantity: itemDto.quantity,
        unitPrice: unitPrice.toString(),
        subtotal: subtotal.toString(),
        notes: itemDto.notes || null,
      });

      orderItems.push(orderItem);
      totalAmount = totalAmount.plus(subtotal);
    }

    const order = this.ordersRepository.create({
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      customerEmail: createOrderDto.customerEmail || null,
      totalAmount: totalAmount.toString(),
      orderType: createOrderDto.orderType,
      deliveryAddress: createOrderDto.deliveryAddress || null,
      remarks: createOrderDto.remarks || null,
      statusId: receivedStatus.id,
      orderItems,
    });

    const savedOrder = await this.ordersRepository.save(order);

    await this.publishOrderCreatedEvent(savedOrder, menuItems);

    return this.findOne(savedOrder.id);
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.ordersRepository.findOne({
      where: { id },
      relations: ['status', 'orderItems', 'orderItems.menuItem'],
    });

    if (!order) {
      throw new NotFoundException(`Order #${id} not found`);
    }

    return order;
  }

  async findAll(filters?: {
    active?: boolean;
    search?: string;
  }): Promise<Order[]> {
    // ponytail: Disable TypeORM auto-sorting by using raw query approach
    let orders = await this.ordersRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.status', 'status')
      .addOrderBy('order.createdAt', 'DESC')
      .getMany();

    // Manually load order items for each order
    for (const order of orders) {
      order.orderItems = await this.orderItemsRepository.find({
        where: { orderId: order.id },
        relations: ['menuItem'],
      });
    }

    // Filter by active/past (active = has allowed transitions)
    if (filters?.active !== undefined) {
      orders = orders.filter(order => {
        const hasTransitions = order.status?.allowedTransitions &&
                              JSON.parse(order.status.allowedTransitions).length > 0;
        return filters.active ? hasTransitions : !hasTransitions;
      });
    }

    // Search by customer name or phone
    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      orders = orders.filter(order =>
        order.customerName.toLowerCase().includes(searchLower) ||
        order.customerPhone.includes(searchLower)
      );
    }

    return orders;
  }

  async updateStatus(id: string, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    const oldStatus = order.status.status;
    const newStatus = updateOrderStatusDto.status;

    // Get allowed transitions from database
    const validTransitions = await this.statusService.getAllowedTransitions(oldStatus);
    if (!validTransitions.includes(newStatus)) {
      throw new ConflictException(
        `Invalid status transition from '${oldStatus}' to '${newStatus}'`
      );
    }

    const newOrderStatus = await this.statusService.findByStatus(newStatus);
    order.statusId = newOrderStatus.id;
    const updatedOrder = await this.ordersRepository.save(order);

    await this.publishStatusChangedEvent(updatedOrder, oldStatus, newStatus);

    return this.findOne(id);
  }

  private async publishOrderCreatedEvent(order: Order, menuItems: any[]): Promise<void> {
    try {
      await this.orderPublisher.publishOrderCreated({
        orderId: order.id,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerEmail: order.customerEmail || undefined,
        orderType: order.orderType,
        deliveryAddress: order.deliveryAddress || undefined,
        totalAmount: order.totalAmount,
        orderItems: order.orderItems.map(oi => ({
          menuItemId: oi.menuItemId,
          menuItemName: menuItems.find(mi => mi.id === oi.menuItemId)?.name || '',
          quantity: oi.quantity,
          unitPrice: oi.unitPrice,
          subtotal: oi.subtotal,
          notes: oi.notes || undefined,
        })),
        status: order.status.status,
        createdAt: order.createdAt.toISOString(),
      });
    } catch (error) {
      console.error('Failed to publish order created event:', error);
    }
  }

  private async publishStatusChangedEvent(order: Order, oldStatus: string, newStatus: string): Promise<void> {
    try {
      await this.orderStatusPublisher.publishStatusChanged(
        order.id,
        oldStatus,
        newStatus,
        {
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          totalAmount: order.totalAmount,
          orderType: order.orderType,
        }
      );
    } catch (error) {
      console.error('Failed to publish status changed event:', error);
    }
  }
}
