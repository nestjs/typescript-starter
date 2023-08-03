// task.entity.ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 500 })
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({
    type: "enum",
    enum: TaskStatus,
    default: TaskStatus.TODO
  })
  status: TaskStatus;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
