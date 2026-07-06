export interface OrderCreatedEvent {
  eventType: 'order.created';
  eventId: string;
  timestamp: string;
  data: {
    orderId: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    orderType: 'delivery' | 'pickup';
    deliveryAddress?: string;
    totalAmount: string;
    orderItems: {
      menuItemId: string;
      menuItemName: string;
      quantity: number;
      unitPrice: string;
      subtotal: string;
      notes?: string;
    }[];
    status: string;
    createdAt: string;
  };
}

export interface OrderStatusChangedEvent {
  eventType: 'order.status.changed';
  eventId: string;
  timestamp: string;
  data: {
    orderId: string;
    oldStatus: string;
    newStatus: string;
    changedAt: string;
    orderSummary: {
      customerName: string;
      customerPhone: string;
      totalAmount: string;
      orderType: 'delivery' | 'pickup';
    };
  };
}

export type OrderEvent = OrderCreatedEvent | OrderStatusChangedEvent;
