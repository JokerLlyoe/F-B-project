import { Entity, Column, OneToMany, ManyToOne, JoinColumn, Index } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../../status/entities/order-status.entity';

@Entity('orders')
@Index(['customerPhone'])
@Index(['createdAt'])
@Index(['statusId'])
export class Order extends BaseEntity {
  @Column()
  customerName: string;

  @Column()
  customerPhone: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: string;

  @Column()
  orderType: 'delivery' | 'pickup';

  @Column({ nullable: true })
  deliveryAddress: string;

  @Column({ nullable: true })
  remarks: string;

  @Column('uuid')
  statusId: string;

  @ManyToOne(() => OrderStatus)
  @JoinColumn({ name: 'statusId' })
  status: OrderStatus;

  @OneToMany(() => OrderItem, orderItem => orderItem.order, { cascade: true })
  orderItems: OrderItem[];
}
