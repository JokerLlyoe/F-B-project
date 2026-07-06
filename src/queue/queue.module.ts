import { Module, Global } from '@nestjs/common';
import { RabbitMQConnection } from './providers/rabbitmq.connection';
import { OrderPublisher } from './publishers/order.publisher';
import { OrderStatusPublisher } from './publishers/order-status.publisher';

@Global()
@Module({
  providers: [RabbitMQConnection, OrderPublisher, OrderStatusPublisher],
  exports: [RabbitMQConnection, OrderPublisher, OrderStatusPublisher],
})
export class QueueModule {}
