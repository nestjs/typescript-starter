import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Client } from '../../client/entities/client.entity';

@Entity()
export class Raffle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  quantity: number;

  @Column()
  price: number;

  @Column()
  prize: string;

  @Column()
  startDate: Date;

  @Column()
  lottery: string;

  @Column()
  endDate: Date;

  @ManyToMany(() => Client, (client: Client) => client.raffles)
  @JoinTable({
    name: 'client_raffle',
    joinColumn: { name: 'raffleId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'clientId', referencedColumnName: 'id' },
  })
  clients: Client[];
}
