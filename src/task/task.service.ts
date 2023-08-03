// task.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus } from './task.model';
import {v4 as uuid} from 'uuid'

@Injectable()
export class TaskService {
    private tasks = []

  create(title: string, description?: string): Task {
    const task: Task = {
        id: uuid(),
        title, 
        description,
        status: TaskStatus.OPEN,
    }
    this.tasks.push(task);
    return task;
  }
}
