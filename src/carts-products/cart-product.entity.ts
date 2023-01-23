import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import Product from '../products/product.entity';
import Cart from '../carts/cart.entity';

@Entity()
class CartProduct {
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  public product: Product;

  @PrimaryColumn()
  public productId: number;

  @JoinColumn({ name: 'cartId' })
  @ManyToOne(() => Cart, (cart) => cart.cartProduct)
  public cart: Cart;

  @PrimaryColumn()
  public cartId: number;

  @Column()
  public numberOfProducts: number;
}

export default CartProduct;
