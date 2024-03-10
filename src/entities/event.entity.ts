import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { User } from './user.entity';

export type EventStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'],
    default: 'TODO'
  })
  status: EventStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  @ManyToMany(() => User, user => user.events)
  @JoinTable()
  invitees: User[];
  
}
