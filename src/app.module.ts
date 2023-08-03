import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TaskModule } from './task/task.module';
import { Task } from './task/task.entity';

@Module({
    imports: [
        TypeOrmModule.forRoot({
            type: 'mysql',
            host: 'localhost',
            port: 3306,
            username: 'root',
            password: '213213213sb',
            database: 'test',
            entities: [Task],
            synchronize: true,
        }),
        TaskModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
