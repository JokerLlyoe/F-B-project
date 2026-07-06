import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQConnection } from '../providers/rabbitmq.connection';
import { OrderStatusChangedEvent } from '../interfaces/event.interface';

@Injectable()
export class OrderStatusPublisher {
  private readonly logger = new Logger(OrderStatusPublisher.name);

  constructor(private readonly rabbitMQ: RabbitMQConnection) {}

  async publishStatusChanged(
    orderId: string,
    oldStatus: string,
    newStatus: string,
    orderSummary: OrderStatusChangedEvent['data']['orderSummary'],
  ): Promise<boolean> {
    const event: OrderStatusChangedEvent = {
      eventType: 'order.status.changed',
      eventId: this.generateUUID(),
      timestamp: new Date().toISOString(),
      data: {
        orderId,
        oldStatus,
        newStatus,
        changedAt: new Date().toISOString(),
        orderSummary,
      },
    };

    try {
      const content = Buffer.from(JSON.stringify(event));
      const published = await this.rabbitMQ.publishToExchange('', content);

      if (published) {
        this.logger.log(`Order status changed event published: ${event.eventId}`);
      } else {
        this.logger.warn(`Failed to publish order status changed event: ${event.eventId}`);
      }

      return published;
    } catch (error) {
      this.logger.error('Error publishing order status changed event', error);
      return false;
    }
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }
}
