import { Body, Controller, Delete, Get, NotFoundException, Param, Post } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  // Endpoint for creating a new event
  @Post()
  async create(@Body() createEventData: CreateEventDto) {
    return await this.eventsService.createEvent(createEventData);
  }

  // Endpoint for querying an event with its id
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const event = await this.eventsService.event(+id);
    // If the event is not found, throw NotFoundException
    if (!event) {
      throw new NotFoundException(`Could not find event with ID ${id}.`);
    }
    return event;
  }

  // Endpoint for deleting an event with its id
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.eventsService.deleteEvent(+id);
  }

  @Post('/merge-all')
  async mergeAllEvents(@Body() data: { userId: number }) {
    return await this.eventsService.mergeAllEventsForUser(data.userId);
  }
}