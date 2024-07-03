import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Put,
  Delete,
} from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { CreateEventDto, EventService } from './event.service';

@ApiTags('events')
@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Post()
  @ApiOperation({ summary: 'Create an event' })
  @ApiResponse({
    status: 201,
    description: 'The event has been successfully created.',
  })
  async create(@Body() createEventDto: CreateEventDto) {
    return this.eventService.create(createEventDto);
  }

  @Get()
  @ApiOperation({ summary: 'Find all events' })
  @ApiResponse({
    status: 200,
    description: 'Returns all events.',
  })
  async findAll() {
    return this.eventService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find one event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Returns the event with the given ID.',
  })
  async findOne(@Param('id') id: string) {
    return this.eventService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an event by ID' })
  @ApiResponse({
    status: 200,
    description: 'The event was updated successfully.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateEventDto: Partial<CreateEventDto>,
  ) {
    return this.eventService.update(id, updateEventDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an event by ID' })
  @ApiResponse({
    status: 204,
    description: 'The event was deleted successfully.',
  })
  async delete(@Param('id') id: string) {
    return this.eventService.delete(id);
  }
}
