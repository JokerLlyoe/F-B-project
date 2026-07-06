import { Expose } from 'class-transformer';

export class OrderItemResponseDto {
  @Expose()
  id: string;

  @Expose()
  menuItemId: string;

  @Expose()
  menuItemName: string;

  @Expose()
  quantity: number;

  @Expose()
  unitPrice: string;

  @Expose()
  subtotal: string;

  @Expose()
  notes?: string;
}

export class OrderResponseDto {
  @Expose()
  id: string;

  @Expose()
  customerName: string;

  @Expose()
  customerPhone: string;

  @Expose()
  customerEmail?: string;

  @Expose()
  totalAmount: string;

  @Expose()
  orderType: string;

  @Expose()
  deliveryAddress?: string;

  @Expose()
  remarks?: string;

  @Expose()
  statusId: string;

  @Expose()
  status: string;

  @Expose()
  statusLabel: string;

  @Expose()
  orderItems: OrderItemResponseDto[];

  @Expose()
  createdAt: string;

  @Expose()
  updatedAt: string;
}
