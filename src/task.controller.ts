import { Body, Controller, Delete, Get, Param, Post, Res } from '@nestjs/common';
import { TaskService } from './task.service';
import { Task } from './task.entity';

@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(@Body() task: Task, @Res() res) {
    const createdTask = await this.taskService.create(task);
    return res.status(201).json(createdTask);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res) {
    const task = await this.taskService.findOne(id);
    if (!task) {
      return res.status(404).json({message: 'Task not found'});
    }
    return res.status(200).json(task);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Res() res) {
    await this.taskService.remove(id);
    return res.status(204).send();
  }
}
