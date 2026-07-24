import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventStatus } from './event-status.enum';
import { User } from '../users/user.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  // optional per the spec, so nullable
  @Column({ nullable: true })
  description?: string;

  @Column({
    type: 'simple-enum',
    enum: EventStatus,
    default: EventStatus.TODO,
  })
  status: EventStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  startTime: Date;

  @Column()
  endTime: Date;

  // Event is the owning side of the relation, so this is where the join
  // table lives. Didn't bother with cascade inserts here on purpose - when
  // you create an event you pass invitee ids, not brand new User objects, so
  // there's nothing to cascade-create.
  @ManyToMany(() => User, (user) => user.events)
  @JoinTable()
  invitees: User[];
}
