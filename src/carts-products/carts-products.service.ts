import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import CartProduct from './cart-product.entity';

@Injectable()
export default class CartsProductsService {
  constructor(
    @InjectRepository(CartProduct)
    private cartsProductsRepository: Repository<CartProduct>,
  ) {}

  async createCartProduct(cart, product) {
    const checkIfRelationExists = await this.cartsProductsRepository.findOne({
      where: {
        cart: {
          id: cart.id,
        },
        product: {
          id: product.id,
        },
      },
    });
    if (checkIfRelationExists) {
      checkIfRelationExists.numberOfProducts++;
      return this.cartsProductsRepository.save(checkIfRelationExists);
    }
    const newCartProductBody = {
      cart: cart,
      product: product,
      numberOfProducts: 1,
    };
    const cartProductToSave = await this.cartsProductsRepository.create(
      newCartProductBody,
    );
    return this.cartsProductsRepository.save(cartProductToSave);
  }

  async emptyActiveCart(cart) {
    const findAllCartsRelations = await this.cartsProductsRepository.find({
      where: { cart: { id: cart.id } },
    });
    findAllCartsRelations.forEach(relation => this.cartsProductsRepository.delete(relation))
    return;
  }
}
