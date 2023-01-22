import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import Cart from '../carts/cart.entity';

export enum transactionStatus {
  FINISHED = 'finished',
  IN_PROGRESS = 'in progress',
}

@Entity()
export class Order {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column({
    type: 'enum',
    enum: transactionStatus,
  })
  public paymentFinished: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdDate: Date;

  @OneToOne(() => Cart, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  public cart: Cart;
}
