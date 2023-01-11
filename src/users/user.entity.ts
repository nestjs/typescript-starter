import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  //ustawić żeby był expose tylko na aktywnym carcie
  @Expose()
  @OneToMany(() => Cart, (cart: Cart) => cart.owner)
  public carts: Cart[];
}

export default User;
