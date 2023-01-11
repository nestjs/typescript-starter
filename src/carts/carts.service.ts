import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import CartEntity from './cart.entity';
import { CartNotFoundException } from './exception/cartNotFound.exception';
import { CreateCartDto } from './dto/createCart.dto';

@Injectable()
export default class CartsService {
  constructor(
    @InjectRepository(CartEntity)
    private cartsRepository: Repository<CartEntity>,
  ) {}

  async createCart(product: CreateCartDto) {
    const newCart = await this.cartsRepository.create(product);
    await this.cartsRepository.save(newCart);
    return newCart;
  }

  async getActiveCart(user) {
    const activeCart = await this.cartsRepository.findOne({
      where: [{ isArchived: false }, { owner: user }],
      relations: ['owner'],
    });
    if (activeCart) {
      return activeCart;
    }
    throw new CartNotFoundException(user);
  }
}
