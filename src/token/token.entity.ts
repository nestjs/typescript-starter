import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class Token {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    value: string;

    @CreateDateColumn()
    createdAt: Date;
}
