import { Controller, Post, Get, Patch, Param, Body, UseInterceptors, Query } from '@nestjs/common';
import { ClassSerializerInterceptor } from '@nestjs/common/serializer/class-serializer.interceptor';
import { OrdersService } from '../services/orders.service';
import { CreateOrderDto } from '../dto/create-order.dto';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { OrderResponseDto, OrderItemResponseDto } from '../dto/order-response.dto';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

@Controller('api/v1/orders')
@UseInterceptors(ClassSerializerInterceptor)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto): Promise<ApiResponseDto<OrderResponseDto>> {
    const order = await this.ordersService.create(createOrderDto);
    const response = this.mapToResponseDto(order);
    return ApiResponseDto.success(response);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ApiResponseDto<OrderResponseDto>> {
    const order = await this.ordersService.findOne(id);
    const response = this.mapToResponseDto(order);
    return ApiResponseDto.success(response);
  }

  @Get()
  async findAll(
    @Query('active') active?: string,
    @Query('search') search?: string,
  ): Promise<ApiResponseDto<OrderResponseDto[]>> {
    const orders = await this.ordersService.findAll({
      active: active === 'true' ? true : active === 'false' ? false : undefined,
      search,
    });
    const response = orders.map(order => this.mapToResponseDto(order));
    return ApiResponseDto.success(response);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ): Promise<ApiResponseDto<OrderResponseDto>> {
    const order = await this.ordersService.updateStatus(id, updateOrderStatusDto);
    const response = this.mapToResponseDto(order);
    return ApiResponseDto.success(response);
  }

  private mapToResponseDto(order: any): OrderResponseDto {
    const orderItems: OrderItemResponseDto[] = order.orderItems.map((oi: any) => ({
      id: oi.id,
      menuItemId: oi.menuItemId,
      menuItemName: oi.menuItem?.name || '',
      quantity: oi.quantity,
      unitPrice: oi.unitPrice,
      subtotal: oi.subtotal,
      notes: oi.notes || undefined,
    }));

    return {
      id: order.id,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail || undefined,
      totalAmount: order.totalAmount,
      orderType: order.orderType,
      deliveryAddress: order.deliveryAddress || undefined,
      remarks: order.remarks || undefined,
      statusId: order.statusId,
      status: order.status?.status || '',
      statusLabel: order.status?.label || '',
      orderItems,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}
