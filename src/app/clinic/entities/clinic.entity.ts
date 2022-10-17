import { User } from 'src/app/user/entities/user.entity';
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn,
  } from 'typeorm';
@Entity({ name: 'clinic' })  
export class Clinic {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'name' })
    name: string;

    @Column({ name: 'insta', nullable: true })
    insta: string;

    @Column({ name: 'face', nullable: true })
    face: string;

    @Column({ name: 'linkedin', nullable: true })
    linkedin: string;

    @Column({ name: 'phone' })
    phone: string;

    @Column({ name: 'place', nullable: true })
    place: string;

    @Column({ name: 'neighborhood' })
    neighborhood: string;

    @Column({ name: 'number', nullable: true })
    number: string;

    @Column({ name: 'state' })
    state: string;

    @Column({ name: 'city' })
    city: string;

    @CreateDateColumn({ name: 'created_at'})
    createdAt: string;

    @UpdateDateColumn({ name: 'updated_at', nullable: true })
    updatedAt: string;

    @DeleteDateColumn({ name: 'deleted_at', nullable: true })
    deletedAt: string;

    @OneToOne(() => User)
    @JoinColumn()
    @Column({ name: 'userId' })
    user: User;
}
