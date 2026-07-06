import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';
import { MenuCategory } from './menu-category.entity';

@Entity('menu_items')
export class MenuItem extends BaseEntity {
  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: string;

  @Column({ default: 0 })
  stockCount: number;

  @Column('uuid')
  categoryId: string;

  @ManyToOne(() => MenuCategory)
  @JoinColumn({ name: 'categoryId' })
  category: MenuCategory;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ default: true })
  isAvailable: boolean;
}
