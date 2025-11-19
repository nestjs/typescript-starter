import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
} from 'typeorm';
import { Raffle } from '../../raffle/entities/raffle.entity';
import { RaffleNumbers } from '../../raffle-numbers/entities/raffle-numbers.entity';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  phone: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToMany(() => Raffle, (raffle: Raffle) => raffle.clients)
  raffles: Raffle[];

  @OneToMany(
    () => RaffleNumbers,
    (raffleNumber: RaffleNumbers) => raffleNumber.client,
  )
  raffleNumbers: RaffleNumbers[];
}
