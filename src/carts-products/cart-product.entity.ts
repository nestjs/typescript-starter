import {Column, Entity, ManyToOne, PrimaryColumn, PrimaryGeneratedColumn} from 'typeorm';
import Product from '../products/product.entity';
import Cart from '../carts/cart.entity';

@Entity()
class CartProduct {

  @PrimaryColumn()
  @ManyToOne(() => Product)
  public product: Product;

  @PrimaryColumn()
  @ManyToOne(() => Cart, (cart) => cart.cartProduct)
  public cart: Cart;

  @Column()
  public numberOfProducts: number;
}

export default CartProduct;
