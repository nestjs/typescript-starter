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
    constructor(private readonly tasksService: TasksService) {}

    // get request to display all tasks
    @Get('')
    getTasks() {
        return this.tasksService.getTasks();
    }

    // get task by id
    @Get(':id')
    getTaskById(@Param('id', ParseIntPipe) id: number) {
        try {
            return this.tasksService.getTaskById(id);
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
        return this.tasksService.createTask(createTaskDto);
    }
}
