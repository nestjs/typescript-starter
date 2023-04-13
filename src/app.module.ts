/**
 * Set up connection to MongoDB for tasks.module
 */

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';

import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    TasksModule,
    MongooseModule.forRoot('mongodb://ralabs:ralabs12345@ac-itetvwv-shard-00-02.ggwtpnj.mongodb.net:27017,ac-itetvwv-shard-00-01.ggwtpnj.mongodb.net:27017,ac-itetvwv-shard-00-00.ggwtpnj.mongodb.net:27017/RALabs?w=majority&retryWrites=true&tls=true&authMechanism=SCRAM-SHA-1')
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
