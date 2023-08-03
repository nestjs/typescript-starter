// task.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  create(title: string, description?: string): Promise<Task> {
    const task = new Task();
    task.title = title;
    task.description = description;

    return this.taskRepository.save(task);
  }

  findOne(id: number): Promise<Task> {
    return this.taskRepository.findOne({where: {id: id}});
  }

  remove(id: number): Promise<void> {
    return this.taskRepository.delete(id).then(() => {});
  }
}
