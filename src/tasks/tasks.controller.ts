/**
 * This controller module receives inputs from request and calls functions.
 * It handles get, delete, update, and post requests.
 * The get and delete requests will be returned with the tasks before modification.
 * The post requests will be returned with the new task id.
 * The update requests will simply be returned with a success response if successful.
 * Note: the update requests only update status of the target task.
 * 
 * @author Yuting Wu
 */

import {
    Controller,
    Post,
    Body,
    Get,
    Delete,
    Put,
} from '@nestjs/common';

import { TasksService } from './tasks.service';
import { Task } from './task.model';

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
        @Body('_id') _id: string,
        @Body('status') newStatus:string
    ){
        const result=await this.tasksService.updateTask(_id,newStatus);
        return result as string;
    }

    @Get()
    async getTask(
        @Body('_id') _id: string
    ):Promise<Task>{
        const task=await this.tasksService.getTask(_id);
        return task as Task;
    }

    @Delete()
    async deleteTask(
        @Body('_id') _id: string
    ):Promise<Task>{
        const task=await this.tasksService.deleteTask(_id);
        return task as Task;
    }
}

