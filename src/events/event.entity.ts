import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ManyToMany,
    JoinTable,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('events')
export class Event {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: ['TODO', 'IN_PROGRESS', 'COMPLETED'],
        default: 'TODO',
    })
    status: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column()
    startTime: Date;

    @Column()
    endTime: Date;

    @ManyToMany(() => User, (user) => user.events)
    @JoinTable()
    invitees: User[];
}
