import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import CartProduct from './cart-product.entity';
import Cart from "../carts/cart.entity";
import Product from "../products/product.entity";

@Injectable()
export default class CartsProductsService {
  constructor(
    @InjectRepository(CartProduct)
    private cartsProductsRepository: Repository<CartProduct>,
  ) {}

  async createCartProduct(cart: Cart, product: Product) {
    const checkIfRelationExists = await this.cartsProductsRepository.findOne({
      where: {
        cartId: cart.id,
        productId: product.id,
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

  async emptyActiveCart(cart: Cart) {
    const findAllCartsRelations = await this.cartsProductsRepository.find({
      where: { cartId: cart.id },
    });
    findAllCartsRelations.forEach((relation) =>
      this.cartsProductsRepository.delete(relation),
    );
    return;
  }
}
