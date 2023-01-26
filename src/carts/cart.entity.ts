import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import User from '../users/user.entity';
import CartProduct from '../carts-products/cart-product.entity';

@Entity()
class Cart {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column({ default: false })
  public isArchived: boolean;

  @ManyToOne(() => User, (owner: User) => owner.carts)
  public owner: User;

  @OneToMany(
    () => CartProduct,
    (cartProduct: CartProduct) => cartProduct.cart,
    { onDelete: 'CASCADE' },
  )
  public cartProduct: CartProduct[];
}

export default Cart;
