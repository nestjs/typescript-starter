import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Raffle } from '../../raffle/entities/raffle.entity';
import { RaffleNumbersStatus } from '../../raffle-numbers-status/entities/raffle-numbers-status.entity';
import { Client } from '../../client/entities/client.entity';

@Entity()
export class RaffleNumbers {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  number: number;

  @ManyToOne(() => Raffle, (raffle: Raffle) => raffle.id)
  @JoinColumn({ name: 'raffleId' })
  raffle: Raffle;

  @Column()
  raffleId: number;

  @ManyToOne(
    () => RaffleNumbersStatus,
    (raffleNumbersStatus: RaffleNumbersStatus) => raffleNumbersStatus.id,
  )
  @JoinColumn({ name: 'raffleNumbersStatusId' })
  raffleNumbersStatus: RaffleNumbersStatus;

  @Column()
  raffleNumbersStatusId: number;

  @ManyToOne(() => Client, (client: Client) => client.raffleNumbers, {
    nullable: true,
  })
  @JoinColumn({ name: 'clientId' })
  client: Client | null;

  @Column({ nullable: true })
  clientId: number | null;
}
