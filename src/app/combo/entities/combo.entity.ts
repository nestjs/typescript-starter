import { User } from '../../user/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';

@Entity({ name: 'combo' })
export class Combo {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'name' })
  name: string;

  @Column({ name: 'description' })
  description: string;

  @Column({ name: 'cost' })
  cost: number;

  //@Column({ name: 'picture' })
  //picture: any;

  @Column({ name: 'installment' })
  installment: number;

  @Column({ name: 'pack' })
  pack: string;

  @ManyToOne((type) => User, (user) => user.combo)
  user: User;

  setUser(user: User) {
    this.user = user;
  }
}
