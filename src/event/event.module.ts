import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event, EventService, EventController } from './event';
import { User } from '../user/user';

@Module({
  imports: [TypeOrmModule.forFeature([Event, User])],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
