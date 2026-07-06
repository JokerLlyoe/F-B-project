import { ConfigService } from '@nestjs/config';

export interface RabbitMQConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  queue: string;
  exchange: string;
}

export const getRabbitMQConfig = (configService: ConfigService): RabbitMQConfig => ({
  host: configService.get('RABBITMQ_HOST', 'localhost'),
  port: configService.get<number>('RABBITMQ_PORT', 5672),
  user: configService.get('RABBITMQ_USER', 'guest'),
  password: configService.get('RABBITMQ_PASSWORD', 'guest'),
  queue: configService.get('RABBITMQ_QUEUE', 'order.events'),
  exchange: configService.get('RABBITMQ_EXCHANGE', 'orders.fanout'),
});
