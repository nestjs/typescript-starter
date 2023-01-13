import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Cart from './cart.entity';
import { CartNotFoundException } from './exception/cartNotFound.exception';
import { CreateCartDto } from './dto/createCart.dto';
import ProductsService from "../products/productsService";

@Injectable()
export default class CartsService {
  constructor(
    @InjectRepository(Cart)
    private cartsRepository: Repository<Cart>,
    private readonly productsService: ProductsService
  ) {}

  async createCart(cart: CreateCartDto, userId) {
    const cartToArchive = await this.getActiveCart(userId)
    if(cartToArchive) {
      cartToArchive.isArchived = true
    }
    const newCart = await this.cartsRepository.create({
      ...cart,
    ownerId: userId
    });
    await this.cartsRepository.save(newCart);
    return newCart;
  }

  async addProductsToCart(userId, productsIds: number[]) {
    const products = await this.productsService.getProductsByIds(productsIds)
    const cartToUpdate = await this.getActiveCart(userId)
    cartToUpdate.products = products
    await this.cartsRepository.save(cartToUpdate);
    return cartToUpdate;
  }

  async getActiveCart(user) {
    const activeCart = await this.cartsRepository.findOne({
      where: [{ isArchived: false }, { ownerId: user }],
      relations: ['owner'],
    });
    if (activeCart) {
      return activeCart;
    }
    throw new CartNotFoundException();
  }
}
