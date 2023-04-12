import {
    Controller,
    Post,
    Body,
    Get,
    Delete,
    Put,
} from '@nestjs/common';

import { TasksService } from './tasks.service';

@Controller('tasks')
export class TasksController{
    constructor(private readonly tasksService: TasksService) {}

    @Post()
    async addTask(
        @Body('title') prodTitle: string,
        @Body('description') prodDescription: string,
        @Body('status') prodStatus: string
    ){
        const generatedId=await this.tasksService.insertTask(prodTitle,prodStatus,prodDescription);
        return {id:generatedId};
    }

    @Put()
    async updateTask(
        @Body('id') id: string,
        @Body('status') newStatus:string
    ){
        const result=await this.tasksService.updateTask(id,newStatus);
        return result;
    }

    @Get()
    async getTask(
        @Body('id') id: string
    ){
        const task=await this.tasksService.getTask(id);
        return task;
    }

    @Delete()
    async deleteTask(
        @Body('id') id: string
    ){
        const result=await this.tasksService.deleteTask(id);
        return result;
    }
}

