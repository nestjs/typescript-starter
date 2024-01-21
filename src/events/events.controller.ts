import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Delete,
    HttpCode,
    HttpStatus,
    Res,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { Response } from 'express';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createEvent(@Body() createEventDto: CreateEventDto) {
        return this.eventsService.create(createEventDto);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getEventById(@Res() res: Response, @Param('id') id: number) {
        const event = await this.eventsService.getEventById(id);
        if (!event) {
            return res.status(404).send({
                message: 'Event not found',
            });
        }
        return res.status(200).send(event);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async deleteEventById(@Param('id') id: number) {
        return this.eventsService.deleteEventById(id);
    }
}
