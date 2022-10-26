import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  UpdateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { hashSync } from 'bcrypt';
import { User } from '../../user/entities/user.entity';

@Entity({ name: 'procediment' })
export class Procediment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'cust' })
  cust: number;

  @Column({ name: 'price' })
  price: number;

  @ManyToOne((type) => User, (user) => user.procediments)
  user: User;

  setUser(user: User) {
    this.user = user;
  }
}
