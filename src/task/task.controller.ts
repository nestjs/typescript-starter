// task.controller.ts
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './task.entity';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  creatTask(
    @Body('title') title : string,
    @Body('description') desctiption: string,
  ): Task {
    return this.taskService.createTask(title, desctiption);
  }

  @Get(':id')
  findOne(@Param('id') id: number): Promise<Task> {
    return this.taskService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: number): Promise<void> {
    return this.taskService.remove(+id);
  }
}
