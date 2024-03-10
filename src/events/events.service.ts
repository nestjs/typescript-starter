import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';

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
    const event = await this.eventsRepository.createQueryBuilder('event')
        .leftJoin('event.invitees', 'user') // Setup the join, but don't select any fields from `user` yet
        .addSelect(['user.id', 'user.name']) // Explicitly select only `id` and `name` fields of `user`
        .where('event.id = :id', { id })
        .getOne();

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
    const events = await this.eventsRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.invitees', 'user')
      .where('user.id = :userId', { userId })
      .orderBy('event.startTime', 'ASC')
      .getMany();
  
    if (events.length <= 1) return events;
  
    let mergedEvents: Event[] = [];
    let tempEvent = events[0];
    let inviteesSet = new Set(tempEvent.invitees.map(invitee => invitee.id));

    for (let i = 1; i < events.length; i++) {
      let currentEvent = events[i];
      currentEvent.invitees.forEach(invitee => inviteesSet.add(invitee.id));

      if (currentEvent.startTime <= tempEvent.endTime) {
        tempEvent.endTime = new Date(Math.max(tempEvent.endTime.getTime(), currentEvent.endTime.getTime()));
        tempEvent.title += ` / ${currentEvent.title}`;
        tempEvent.description += ` / ${currentEvent.description}`;

        await this.eventsRepository.delete(currentEvent.id);
      } else {
        mergedEvents.push(tempEvent);
        tempEvent = currentEvent;
      }
    }
    mergedEvents.push(tempEvent);

    for (let userId of inviteesSet) {
      let user = await this.usersRepository.findOne({ where: { id: userId }, relations: ['events'] });
      if (user) {
          user.events = mergedEvents;
          await this.usersRepository.save(user);
      }
    }

    await this.eventsRepository.save(mergedEvents);

    return mergedEvents;
}

}