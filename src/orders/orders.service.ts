import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { Between, Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';

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

  async getAllUsersOrdersWithProducts(user) {
    return this.ordersRepository.find({
      where: {
        cart: {
          owner: {
            id: user,
          },
        },
      },
      select: {
        cart: {
          id: true,
          owner: {
            id: true,
            name: true,
          },
        },
      },
      relations: ['cart', 'cart.cartProduct', 'cart.owner'],
      withDeleted: true,
    });
  }

  async getAllUsersOrders(user) {
    return this.ordersRepository.find({
      where: {
        cart: {
          owner: {
            id: user,
          },
        },
      },
    });
  }

  async getAllUsersOrdersBetweenDates(user, startDate: Date, endDate: Date) {
    return this.ordersRepository.find({
      where: {
        cart: {
          owner: {
            id: user,
          },
        },
        createdDate: Between(startDate, endDate),
      },
    });
  }
}
