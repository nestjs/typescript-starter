import {
    Body,
    Controller,
    Delete,
    Get,
    HttpException,
    HttpStatus,
    Param,
    ParseIntPipe,
    Post,
    UsePipes,
    ValidationPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('tasks')
export class TasksController {
    constructor(private tasksService: TasksService) {}

    // get request to display all tasks
    @Get('')
    getTask() {
        return this.tasksService.getTasks();
    }

    // get task by id
    @Get(':id')
    async getTaskById(@Param('id', ParseIntPipe) id: number) {
        try {
            await this.tasksService.getTaskById(id);
        } catch (err) {
            throw new HttpException(
                {
                    message: err.message,
                },
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // delete selected task
    @Delete(':id')
    deleteTaskById(@Param('id', ParseIntPipe) id: number) {
        if (this.getTaskById(id)) {
            return this.tasksService.deleteTaskById(id);
        } else {
            throw new HttpException(
                'Task is not found',
                HttpStatus.BAD_REQUEST,
            );
        }
    }

    // create new task, use validationpipe to validate the request before
    @Post('')
    @UsePipes(ValidationPipe)
    createTask(@Body() createTaskDto: CreateTaskDto) {
        this.tasksService.createTask(createTaskDto);
    }
}
