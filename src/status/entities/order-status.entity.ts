import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

@Entity('order_statuses')
export class OrderStatus extends BaseEntity {
  @Column({ unique: true })
  status: string;

  @Column()
  label: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 0 })
  order: number;

  @Column('text', { default: '[]' })
  allowedTransitions: string;
}
