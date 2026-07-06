import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, ChannelModel, Channel } from 'amqplib';
import { getRabbitMQConfig } from './rabbitmq.config';

@Injectable()
export class RabbitMQConnection implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitMQConnection.name);
  private connection: ChannelModel;
  private channel: Channel;
  private config: ReturnType<typeof getRabbitMQConfig>;

  constructor(private readonly configService: ConfigService) {
    this.config = getRabbitMQConfig(configService);
  }

  async onModuleInit() {
    let retries = 5;
    while (retries > 0) {
      try {
        const connectionOptions = {
          protocol: 'amqp',
          hostname: this.config.host,
          port: this.config.port,
          username: this.config.user,
          password: this.config.password,
          locale: 'en_US',
          frameMax: 0,
          heartbeat: 60,
          vhost: '/',
        };

        this.connection = await connect(connectionOptions);
        this.channel = await this.connection.createChannel();

        await this.channel.assertExchange(this.config.exchange, 'fanout', { durable: true });
        await this.channel.assertQueue(this.config.queue, { durable: true });
        await this.channel.bindQueue(this.config.queue, this.config.exchange, '');

        this.logger.log('Successfully connected to RabbitMQ');
        return;
      } catch (error) {
        retries--;
        if (retries === 0) {
          this.logger.error('Failed to connect to RabbitMQ after retries', error);
          throw error;
        }
        this.logger.warn(`RabbitMQ connection failed. Retrying... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
  }

  async onModuleDestroy() {
    try {
      await this.channel.close();
      await this.connection.close();
      this.logger.log('Successfully disconnected from RabbitMQ');
    } catch (error) {
      this.logger.error('Error disconnecting from RabbitMQ', error);
    }
  }

  getChannel(): Channel {
    return this.channel;
  }

  async publishToExchange(routingKey: string, content: Buffer): Promise<boolean> {
    try {
      return this.channel.publish(this.config.exchange, routingKey, content, {
        contentType: 'application/json',
        deliveryMode: 2,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.logger.error('Failed to publish message', error);
      return false;
    }
  }
}
