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

  create(task: Task): Promise<Task> {
    return this.taskRepository.save(task);
  }

  findOne(id: string): Promise<Task> {
    return this.taskRepository.findOne({ where: { id } });
}

  async remove(id: string): Promise<void> {
    await this.taskRepository.delete(id);
  }
}
