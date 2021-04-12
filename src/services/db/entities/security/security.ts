import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user';

@Entity()
class Security {
  /**
   * Record id
   */
  @PrimaryGeneratedColumn()
  public id: number;

  @OneToOne(() => User, (user) => user.id)
  @JoinColumn()
  public user: User;

  /**
   * Hashed password
   */
  @Column()
  public password: string;

  /**
   * Password salt
   */
  @Column()
  public salt: string;
}

export { Security };
