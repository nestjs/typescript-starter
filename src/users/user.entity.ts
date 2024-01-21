import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Event } from '../events/event.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => Event, (event) => event.invitees)
    events: Event[];
}
