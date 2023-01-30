import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Cart from './cart.entity';
import { CartNotFoundException } from './exception/cart-not-found.exception';
import { CreateCartDto } from './dto/create-cart.dto';
import ProductsService from '../products/products.service';
import OrdersService from '../orders/orders.service';
import CartsProductsService from '../carts-products/carts-products.service';
import { transactionStatus } from '../orders/order.entity';
import UserEntity from "../users/user.entity";

@Injectable()
export default class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartsRepository: Repository<Cart>,
    private readonly productsService: ProductsService,
    private readonly ordersService: OrdersService,
    private readonly cartsProductsService: CartsProductsService,
  ) {}

  async createCart(cart: CreateCartDto, user: UserEntity) {
    const cartToArchive = await this.cartsRepository.findOne({
      where: { isArchived: false, owner: user },
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

  async emptyActiveCart(user: UserEntity) {
    const cartToEmpty = await this.getActiveCart(user);
    return this.cartsProductsService.emptyActiveCart(cartToEmpty);
  }

  async addProductsToCart(user: UserEntity, productsIds: number[]) {
    const products = await this.productsService.getProductsByIds(productsIds);
    const cartToUpdate = await this.getActiveCart(user);
    if (products) {
      return await Promise.allSettled(
        products.map((product) =>
          this.cartsProductsService.createCartProduct(cartToUpdate, product),
        ),
      );
    }
    throw new HttpException(
      'Provided products dont exist',
      HttpStatus.BAD_REQUEST,
    );
  }

  async getActiveCart(user: UserEntity) {
    const activeCart = await this.cartsRepository.findOne({
      where: { isArchived: false, owner: user },
      relations: ['owner'],
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
    throw new CartNotFoundException(user.id);
  }

  async finishTransaction(user: number) {
    const activeCart = await this.cartsRepository.findOne({
      where: { isArchived: false, owner: { id: user } },
      select: {
        owner: {
          id: true,
          name: true,
        },
      },
      relations: ['owner'],
    });
    if (activeCart) {
      activeCart.isArchived = true;
      await this.cartsRepository.save(activeCart);
      const orderBody = {
        paymentFinished: transactionStatus.FINISHED,
        cart: activeCart,
      };
      return this.ordersService.createOrder(orderBody);
    }
    return;
  }
}
