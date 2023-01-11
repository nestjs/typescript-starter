import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import CartEntity from './cart.entity';
import { CartNotFoundException } from './exception/cartNotFound.exception';
import { CreateCartDto } from './dto/createCart.dto';
import ProductsService from "../products/productsService";

@Injectable()
export default class CartsService {
  constructor(
    @InjectRepository(CartEntity)
    private cartsRepository: Repository<CartEntity>,
    private readonly productsService: ProductsService
  ) {}

  async createCart(cart: CreateCartDto) {
    const newCart = await this.cartsRepository.create(cart);
    await this.cartsRepository.save(newCart);
    return newCart;
  }

  async addProductsToCart(cartId: number, productsIds: number[]) {
    const products = await this.productsService.getProductsByIds(productsIds)
    const cart = await this.cartsRepository.findOne({
      where: {id: cartId}
    })
    cart.products = products
    await this.cartsRepository.save(cart);
    return cart;
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
