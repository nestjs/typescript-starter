//tasks.service.ts
import { Injectable } from '@nestjs/common';
import { Task, TaskStatus } from './tasks.model';
import {v4 as uuid} from 'uuid';

@Injectable()
export class TasksService {
    private tasks: Task[] = [];

    createTask(title:string, description:string): Task{
        const task: Task = {
            id: uuid(),
            title,
            description,
            status: TaskStatus.TODO,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        this.tasks.push(task);
        return task;
    }

    getById(id: string): Task{
        return this.tasks.find((task) => task.id === id);
    }

    deleteTask(id: string): void{
        //filter task to only contain those with different id that the input one
        this.tasks = this.tasks.filter((task) => task.id !== id);
    }

    updateStatus(id: string, status: TaskStatus){
        const task = this.tasks.find((task) => task.id === id);
        task.status = status;
        task.updatedAt = new Date();
        return task;
    }
}