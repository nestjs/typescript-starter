import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GetUser } from 'src/auth/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateTodoDto } from './dto/create-todo.dto';
import { TodoService } from './todo.service';

@ApiTags('Todos')
@Controller('todos')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new Todo' })
  @ApiResponse({ status: 201, description: 'The Todo has been created.' })
  async create(
    @Body() createTodoDto: CreateTodoDto,
    @GetUser() userId: number,
  ) {
    return this.todoService.create(createTodoDto, userId);
  }

  @Get()
  @ApiOperation({ summary: 'Get all Todos for the authenticated user' })
  @ApiResponse({
    status: 200,
    description: 'List of Todos for the authenticated user.',
    type: [CreateTodoDto],
  })
  async getAll(@GetUser() userId: number) {
    return this.todoService.getAllForUser(userId);
  }
}
