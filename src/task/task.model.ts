import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export interface Task{
  id: string
  title: string
  description: string
  status: TaskStatus
}

export enum TaskStatus{
  OPEN = "OPEN",
  IN_PROGRESS = "IN_PROGRESS",
  DONE = "DONE"
}