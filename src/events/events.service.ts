import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { merge } from 'rxjs';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private eventsRepository: Repository<Event>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    const { invitees: userIds, ...eventDetails } = createEventDto;

    const users = await this.usersRepository.find({
      where: {
        id: In(userIds)
      }
    });

    const event = this.eventsRepository.create({
        ...eventDetails,
        invitees: users.map(user => ({
          id: user.id,
          name: user.name
        }))
    });

    const savedEvent = await this.eventsRepository.save(event);

    for (const user of users) {
        if (!user.events) {
            user.events = [];
        }
        user.events.push(savedEvent);
        await this.usersRepository.save(user);
    }
    
    return savedEvent;
}

  async findAll() {
    return this.eventsRepository.find();
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id }
    });

    if (!event) {
        throw new NotFoundException(`Event with ID ${id} not found`);
    }
    return event;
  }

  async remove(id: number): Promise<void> {
    const result = await this.eventsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }
  }


  async mergeOverlappingEvents(userId: number): Promise<Event[]> {
    const userWithEvents = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['events', 'events.invitees'],
    });
  
    if (userWithEvents.events.length <= 1) return userWithEvents.events;
  
    const events = userWithEvents.events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    const mergedEvents = [];
    let tempEvent = { 
      ...events[0], 
      invitees: new Map(events[0].invitees.map(invitee => [invitee.id, invitee])) 
    };
  
    for (let i = 1; i < events.length; i++) {
      const currentEvent = events[i];
      if (currentEvent.startTime <= tempEvent.endTime) {
        tempEvent.endTime = new Date(Math.max(tempEvent.endTime.getTime(), currentEvent.endTime.getTime()));
        tempEvent.title += ` / ${currentEvent.title}`;
        tempEvent.description += ` / ${currentEvent.description}`;
        currentEvent.invitees.forEach(invitee => tempEvent.invitees.set(invitee.id, invitee));
        
        await this.eventsRepository.delete({ id: currentEvent.id });
      } else {
        mergedEvents.push({ 
          ...tempEvent, 
          invitees: Array.from(tempEvent.invitees.values())
        });
        tempEvent = { 
          ...currentEvent, 
          invitees: new Map(currentEvent.invitees.map(invitee => [invitee.id, invitee])) 
        };
      }
    }
    mergedEvents.push({ ...tempEvent, invitees: Array.from(tempEvent.invitees.values()) });
    for (const event of mergedEvents) {
      await this.eventsRepository.save({
        ...event,
        invitees: event.invitees.map(invitee => ({ id: invitee.id, name: invitee.name })),
      });
    }
  
    return mergedEvents.map(event => ({
      ...event,
      invitees: event.invitees.map(invitee => ({ id: invitee.id, name: invitee.name })),
    }));
  }
  
  
}