import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import User from '../users/user.entity';
import Product from '../products/product.entity';

@Entity()
class Cart {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column({ default: false })
  public isArchived: boolean;

  @ManyToOne(() => User, (owner: User) => owner.carts, { onDelete: 'CASCADE' })
  public owner: User;

  @ManyToMany(() => Product, { cascade: true })
  @JoinTable()
  public products: Product[];
}

export default Cart;
