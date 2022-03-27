import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Bet {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    date: Date;
    @Column()
    course_name: string;
    @Column()
    number: number;
    @Column()
    url: string;
    @Column()
    odds: number;
    @Column()
    ev: number;
    @Column({
        default: false
    })
    placed: boolean;
}