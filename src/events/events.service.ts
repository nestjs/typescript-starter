import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { Event } from './entities/event.entity';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventsRepository: Repository<Event>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(createEventDto: CreateEventDto): Promise<Event> {
    if (createEventDto.startTime.getTime() >= createEventDto.endTime.getTime()) {
      throw new BadRequestException('startTime must be earlier than endTime');
    }

    const invitees = createEventDto.inviteeIds.length
      ? await this.usersRepository.findBy({ id: In(createEventDto.inviteeIds) })
      : [];

    if (invitees.length !== createEventDto.inviteeIds.length) {
      throw new NotFoundException('One or more invitees were not found');
    }

    const event = this.eventsRepository.create({
      title: createEventDto.title,
      description: createEventDto.description,
      status: createEventDto.status,
      startTime: createEventDto.startTime,
      endTime: createEventDto.endTime,
      invitees,
    });

    const savedEvent = await this.eventsRepository.save(event);
    return this.findOne(savedEvent.id);
  }

  async findOne(id: number): Promise<Event> {
    const event = await this.eventsRepository.findOne({
      where: { id },
      relations: { invitees: true },
    });

    if (!event) {
      throw new NotFoundException(`Event with id ${id} not found`);
    }

    return event;
  }

  async remove(id: number): Promise<void> {
    const event = await this.findOne(id);
    await this.eventsRepository.remove(event);
  }
}
