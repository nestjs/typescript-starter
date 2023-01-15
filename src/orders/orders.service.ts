import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/createOrder.dto';

@Injectable()
export default class OrdersService {
  constructor(
    @InjectRepository(Order)
    private ordersRepository: Repository<Order>,
  ) {}

  async createOrder(order: CreateOrderDto) {
    const newOrder = await this.ordersRepository.create(order);
    return this.ordersRepository.save(newOrder);
  }

  async getAllUsersOrders(user) {
    return this.ordersRepository.find({
      where: {
        cart: {
          owner: user,
        },
      },
      relations: ['cart', 'cart.products', 'cart.owner'],
    });
  }
}
