import { Injectable, forwardRef, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import { Event } from '../events/event.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { EventsService } from '../events/events.service';
import { CreateEventDto } from '../events/dto/create-event.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @Inject(forwardRef(() => EventsService))
        private eventsService: EventsService,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const newUser = this.usersRepository.create(createUserDto);
        return this.usersRepository.save(newUser);
    }

    async getUserById(userId: number): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['events'],
        });
        return user;
    }

    async findUsersByIds(userIds: number[]): Promise<User[]> {
        const users = await this.usersRepository.find({
            where: { id: In(userIds) },
        });
        return users;
    }

    async mergeAllEvents(userId: number): Promise<Event[]> {
        const events = await this.getEventsForUser(userId);
        events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
        let mergedEvents = [];
        let tempEvent = null;
        let eventsToBeDeleted = new Set<number>();
        for (const event of events) {
            const invitees = await this.eventsService.getEventInvitees(
                event.id,
            );
            if (!tempEvent) {
                tempEvent = {
                    ...event,
                    invitees: new Set([
                        ...invitees.map((invitee) => invitee.id),
                    ]),
                    isMerged: false,
                };
            } else if (
                tempEvent.endTime.getTime() >= event.startTime.getTime()
            ) {
                tempEvent.title = `${tempEvent.title} & ${event.title}`;
                tempEvent.description = `${tempEvent.description} & ${event.description}`;
                tempEvent.endTime = new Date(
                    Math.max(
                        tempEvent.endTime.getTime(),
                        event.endTime.getTime(),
                    ),
                );
                invitees.forEach((invitee) =>
                    tempEvent.invitees.add(invitee.id),
                );
                tempEvent.isMerged = true;
                eventsToBeDeleted.add(event.id);
            } else {
                mergedEvents.push(tempEvent);
                tempEvent = {
                    ...event,
                    invitees: new Set([
                        ...invitees.map((invitee) => invitee.id),
                    ]),
                    isMerged: false,
                };
            }
        }
        if (tempEvent) {
            if (tempEvent.isMerged) {
                eventsToBeDeleted.add(tempEvent.id);
            }
            mergedEvents.push(tempEvent);
        }
        const savedMergeEvents = [];
        for (const mergedEvent of mergedEvents) {
            if (mergedEvent.isMerged) {
                const newEventDto = new CreateEventDto();
                newEventDto.title = mergedEvent.title;
                newEventDto.description = mergedEvent.description;
                newEventDto.status = mergedEvent.status;
                newEventDto.startTime = mergedEvent.startTime;
                newEventDto.endTime = mergedEvent.endTime;
                newEventDto.invitees = Array.from(mergedEvent.invitees);
                const savedEvent = await this.eventsService.create(newEventDto);
                savedMergeEvents.push(savedEvent);
            }
        }
        for (const eventId of eventsToBeDeleted) {
            await this.eventsService.deleteEventById(eventId);
        }
        return savedMergeEvents;
    }

    async getEventsForUser(userId: number): Promise<Event[]> {
        const user = await this.usersRepository.findOne({
            where: { id: userId },
            relations: ['events'],
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user.events;
    }
}
