import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './event.entity';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Post()
  create(@Body() dto: CreateEventDto): Promise<Event> {
    return this.eventsService.create(dto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Event> {
    return this.eventsService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.eventsService.remove(id);
  }

  // Put this under /events/merge-all/:userId rather than nesting it under
  // /users, since it's really an events operation (it mutates Event rows)
  // that happens to be scoped by a user.
  @Post('merge-all/:userId')
  mergeAll(@Param('userId', ParseIntPipe) userId: number): Promise<Event[]> {
    return this.eventsService.mergeAllForUser(userId);
  }
}
