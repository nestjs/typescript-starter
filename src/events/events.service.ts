import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { User } from '../users/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class EventsService {
    constructor(
        @InjectRepository(Event)
        private eventsRepository: Repository<Event>,
        @Inject(forwardRef(() => UsersService))
        private usersService: UsersService,
    ) {}

    async create(createEventDto: CreateEventDto): Promise<Event> {
        const newEvent = new Event();
        newEvent.title = createEventDto.title;
        newEvent.description = createEventDto.description;
        newEvent.status = createEventDto.status;
        newEvent.startTime = new Date(createEventDto.startTime);
        newEvent.endTime = new Date(createEventDto.endTime);
        if (createEventDto.invitees && createEventDto.invitees.length > 0) {
            const inviteeUsers = await this.usersService.findUsersByIds(
                createEventDto.invitees,
            );
            newEvent.invitees = inviteeUsers;
        }
        return this.eventsRepository.save(newEvent);
    }

    async getEventById(id: number): Promise<Event> {
        return this.eventsRepository.findOne({ where: { id } });
    }

    async deleteEventById(id: number): Promise<void> {
        await this.eventsRepository.delete({ id });
    }

    async getEventInvitees(eventId: number): Promise<User[]> {
        const event = await this.eventsRepository.findOne({
            where: { id: eventId },
            relations: ['invitees'],
        });
        if (!event) {
            throw new Error('Event not found');
        }
        return event.invitees;
    }
}
