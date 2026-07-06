export const ORDER_STATUSES = {
  RECEIVED: 'received',
  PREPARING: 'preparing',
  READY: 'ready',
  COMPLETED: 'completed',
} as const;

export const ORDER_STATUS_LABELS = {
  received: 'Order Received',
  preparing: 'Preparing',
  ready: 'Ready',
  completed: 'Completed',
} as const;

export const VALID_STATUS_TRANSITIONS = {
  received: ['preparing'],
  preparing: ['ready'],
  ready: ['completed'],
  completed: [],
} as const;

export type OrderStatusType = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];
