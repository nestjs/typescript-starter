import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Status } from '../enums/status';

// Task entity model, with the required columns, PK: id; title: not null; description: optional; status: enum, string; dates: auto generated.
@Entity()
export class Task {
    @PrimaryGeneratedColumn({
        name: 'TASK_ID_PK',
        type: 'int',
    })
    id: number;

    @Column({
        name: 'TITLE',
        nullable: false,
        default: 'Ra labs',
    })
    title: string;

    @Column({
        name: 'DESCRIPTION',
        nullable: true,
        default: '',
    })
    description: string;

    @Column({
        name: 'STATUS',
        type: 'enum',
        enum: Status,
        nullable: false,
    })
    status: string;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
