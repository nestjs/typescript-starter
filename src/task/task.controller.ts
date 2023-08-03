// task.controller.ts
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './task.model';

@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Post()
  creatTask(
    @Body('title') title : string,
    @Body('description') desctiption: string,
  ): Task {
    return this.taskService.create(title, desctiption);
  }

}
