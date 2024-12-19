import { Module } from '@nestjs/common';
import { TodoService } from './todo.service';
import { TodoController } from './todo.controller';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [TodoService, PrismaService],
  controllers: [TodoController],
})
export class TodoModule {}
