import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Cart from '../carts/cart.entity';

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public paymentFinished: boolean;

  @Column()
  public finishedAt: string;

  @Column()
  public cartId: number;

  @OneToOne(() => Cart, {
    cascade: true,
    eager: true,
  })
  @JoinColumn()
  public cart: Cart;
}
