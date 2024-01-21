import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([Event]), forwardRef(() => UsersModule)],
    providers: [EventsService],
    controllers: [EventsController],
    exports: [EventsService],
})
export class EventsModule {}
