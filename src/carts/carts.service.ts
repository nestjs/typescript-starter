import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Cart from './cart.entity';
import { CartNotFoundException } from './exception/cartNotFound.exception';
import { CreateCartDto } from './dto/createCart.dto';
import ProductsService from '../products/products-service';
import OrdersService from '../orders/orders.service';

@Injectable()
export default class CartsService {
  constructor(
      @InjectRepository(Cart)
      private cartsRepository: Repository<Cart>,
      private readonly productsService: ProductsService,
      private readonly ordersService: OrdersService,
  ) {
  }

  async createCart(cart: CreateCartDto, user) {
    const cartToArchive = await this.cartsRepository.findOne({
      where: [{isArchived: false}, {owner: {id: user}}],
      relations: ['owner'],
    });
    if (cartToArchive) {
      cartToArchive.isArchived = true;
      await this.cartsRepository.save(cartToArchive);
    }
    const newCart = await this.cartsRepository.create({
      ...cart,
      owner: user,
    });
    return this.cartsRepository.save(newCart);
  }

  async addProductsToCart(user, productsIds: number[]) {
    const products = await this.productsService.getProductsByIds(productsIds);
    const cartToUpdate = await this.getActiveCart(user);
    products.forEach((product) => cartToUpdate.products.push(product));
    return this.cartsRepository.save(cartToUpdate);
  }

  async getActiveCart(user) {
    const activeCart = await this.cartsRepository.findOne({
      where: [{isArchived: false}, {owner: {id: user}}],
      relations: ['owner', 'products'],
      select: {
        owner: {
          id: true,
          name: true,
        },
      },
    });
    if (activeCart) {
      return activeCart;
    }
    throw new CartNotFoundException();
  }

  async finishTransaction(user) {
    const activeCart = await this.cartsRepository.findOne({
      where: [{isArchived: false}, {owner: {id: user}}],
      select: {
        owner: {
          id: true,
          name: true,
        },
      },
      relations: ['owner', 'products'],
    });
    if (activeCart) {
      activeCart.isArchived = true;
      await this.cartsRepository.save(activeCart);
      const orderBody = {
        paymentFinished: true,
        finishedAt: new Date(Date.now()).toString(),
        cart: activeCart,
      };
      return this.ordersService.createOrder(orderBody);
    }
    return;
  }

}
