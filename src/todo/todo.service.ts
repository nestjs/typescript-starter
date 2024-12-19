// todo.service.ts
import { Injectable } from '@nestjs/common';

import { PrismaService } from 'prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  async create(createTodoDto: CreateTodoDto, userId: number) {
    return this.prisma.todo.create({
      data: {
        title: createTodoDto.title,
        description: createTodoDto.description,
        completed: createTodoDto.completed,
        userId,
      },
    });
  }

  async getAllForUser(userId: number) {
    return this.prisma.todo.findMany({
      where: {
        userId,
      },
    });
  }
}
