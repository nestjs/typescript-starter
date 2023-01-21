import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import Product from '../products/product.entity';
import Cart from '../carts/cart.entity';

@Entity()
class CartProduct {
  @PrimaryGeneratedColumn()
  public id: number;

  @ManyToOne(() => Product)
  public product: Product;

  @ManyToOne(() => Cart, (cart) => cart.cartProduct)
  public cart: Cart;

  @Column()
  public numberOfProducts: number;
}

export default CartProduct;
