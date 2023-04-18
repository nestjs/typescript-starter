import { Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from '../typeorm/Task';
import { Repository } from 'typeorm';

@Injectable()
export class TasksService {
    constructor(
        @InjectRepository(Task)
        private readonly taskRepository: Repository<Task>,
    ) {}

    getTasks() {
        return this.taskRepository.find();
    }

    getTaskById(id: number) {
        return this.taskRepository.findOneBy({ id: id });
    }

    deleteTaskById(id: number) {
        return this.taskRepository.delete(id);
    }

    createTask(createTaskDto: CreateTaskDto) {
        const newTask = this.taskRepository.create(createTaskDto);
        return this.taskRepository.save(newTask);
    }
}
