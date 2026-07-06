import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderStatus } from '../entities/order-status.entity';

@Injectable()
export class StatusService {
  constructor(
    @InjectRepository(OrderStatus)
    private readonly statusRepository: Repository<OrderStatus>,
  ) {}

  async findAll(): Promise<OrderStatus[]> {
    return await this.statusRepository.find({
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<OrderStatus> {
    const status = await this.statusRepository.findOne({ where: { id } });
    if (!status) {
      throw new NotFoundException(`Status #${id} not found`);
    }
    return status;
  }

  async findByStatus(status: string): Promise<OrderStatus> {
    const orderStatus = await this.statusRepository.findOne({ where: { status } });
    if (!orderStatus) {
      throw new NotFoundException(`Status '${status}' not found`);
    }
    return orderStatus;
  }

  async getAllowedTransitions(status: string): Promise<string[]> {
    const orderStatus = await this.findByStatus(status);
    return JSON.parse(orderStatus.allowedTransitions);
  }
}
