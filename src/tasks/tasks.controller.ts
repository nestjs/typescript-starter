//tasks.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from './tasks.model';

@Controller('tasks')
export class TasksController {
    constructor(private tasksService: TasksService) {}

    @Post()
    createTask(
        @Body('title') title:string,
        @Body('description') description: string,
    ): Task {
        return this.tasksService.createTask(title, description);
    }

    @Get('/:id')
    getById(@Param('id') id: string): Task{
        return this.tasksService.getById(id);
    }

    @Delete('/:id')
    deleteTask(@Param('id') id: string): void {
        return this.tasksService.deleteTask(id);
    }

    @Patch('/:id/status')
    updateStatus(
        @Param('id') id:string,
        @Body('status') status:TaskStatus,
    ): Task {
        return this.tasksService.updateStatus(id, status);
    }
}