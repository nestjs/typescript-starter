import {
  Column,
  Entity,
  JoinTable,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Expose } from 'class-transformer';
import Cart from '../carts/cart.entity';

@Entity()
class User {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true })
  @Expose()
  public email: string;

  @Column()
  @Expose()
  public name: string;

  @Column()
  public password: string;

  @Expose()
  @OneToMany(() => Cart, (cart: Cart) => cart.owner)
  @JoinTable()
  public carts: Cart[];
}

export default User;
