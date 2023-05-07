import { Controller, Post, Req, Body, Get, Param, Delete } from "@nestjs/common";
import { Request } from "express";
import { TaskService } from "./task.service";
import { TaskDto } from "./dto";

@Controller('task')
export class TaskController{
    constructor(private taskService: TaskService) {}

    @Post('create')
    create(@Body() dto: TaskDto) {
        console.log({
            dto,
        })
        return this.taskService.create(dto)
    }
    
    @Get(':id')
    retrieve(@Param('id') id: string) {
        return this.taskService.retrieve(id)
    }   

    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.taskService.delete(id)
    }



}