import { Injectable, Logger } from '@nestjs/common';
import { RabbitMQConnection } from '../providers/rabbitmq.connection';
import { OrderCreatedEvent } from '../interfaces/event.interface';

@Injectable()
export class OrderPublisher {
  private readonly logger = new Logger(OrderPublisher.name);

  constructor(private readonly rabbitMQ: RabbitMQConnection) {}

  async publishOrderCreated(orderData: OrderCreatedEvent['data']): Promise<boolean> {
    const event: OrderCreatedEvent = {
      eventType: 'order.created',
      eventId: this.generateUUID(),
      timestamp: new Date().toISOString(),
      data: orderData,
    };

    try {
      const content = Buffer.from(JSON.stringify(event));
      const published = await this.rabbitMQ.publishToExchange('', content);

      if (published) {
        this.logger.log(`Order created event published: ${event.eventId}`);
      } else {
        this.logger.warn(`Failed to publish order created event: ${event.eventId}`);
      }

      return published;
    } catch (error) {
      this.logger.error('Error publishing order created event', error);
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
