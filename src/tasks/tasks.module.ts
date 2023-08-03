//tasks.module.ts
import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';


@Module({
    controllers: [TasksController],
    providers: [TasksService],
})
export class TasksModule {}