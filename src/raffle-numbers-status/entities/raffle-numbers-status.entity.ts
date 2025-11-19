import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class RaffleNumbersStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: string;
}
