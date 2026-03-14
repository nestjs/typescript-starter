import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { CreateEventDto } from './dto/create-event.dto';
import { EventStatus } from './entities/event-status.enum';
import { Event } from './entities/event.entity';
import { EventsService } from './events.service';

describe('EventsService', () => {
  let service: EventsService;
  let eventsRepository: jest.Mocked<Repository<Event>>;
  let usersRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findBy: jest.fn(),
          },
        },
      ],
    }).compile();

    service = moduleRef.get(EventsService);
    eventsRepository = moduleRef.get(getRepositoryToken(Event));
    usersRepository = moduleRef.get(getRepositoryToken(User));
  });

  it('creates an event with invitees and returns the hydrated entity', async () => {
    const dto: CreateEventDto = {
      title: 'Planning',
      description: 'Sprint planning',
      status: EventStatus.TODO,
      startTime: new Date('2026-03-13T14:00:00.000Z'),
      endTime: new Date('2026-03-13T15:00:00.000Z'),
      inviteeIds: [1, 2],
    };
    const invitees = [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ] as User[];
    const createdEvent = {
      id: 10,
      title: dto.title,
      description: dto.description,
      status: dto.status,
      startTime: dto.startTime,
      endTime: dto.endTime,
      invitees,
    } as Event;

    usersRepository.findBy.mockResolvedValue(invitees);
    eventsRepository.create.mockReturnValue(createdEvent);
    eventsRepository.save.mockResolvedValue(createdEvent);
    eventsRepository.findOne.mockResolvedValue(createdEvent);

    await expect(service.create(dto)).resolves.toEqual(createdEvent);
    expect(usersRepository.findBy).toHaveBeenCalled();
    expect(eventsRepository.create).toHaveBeenCalledWith({
      title: dto.title,
      description: dto.description,
      status: dto.status,
      startTime: dto.startTime,
      endTime: dto.endTime,
      invitees,
    });
  });

  it('throws when some invitees do not exist', async () => {
    const dto: CreateEventDto = {
      title: 'Planning',
      status: EventStatus.TODO,
      startTime: new Date('2026-03-13T14:00:00.000Z'),
      endTime: new Date('2026-03-13T15:00:00.000Z'),
      inviteeIds: [1, 2],
    };

    usersRepository.findBy.mockResolvedValue([{ id: 1, name: 'Alice' } as User]);

    await expect(service.create(dto)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('throws when startTime is not earlier than endTime', async () => {
    const dto: CreateEventDto = {
      title: 'Invalid',
      status: EventStatus.TODO,
      startTime: new Date('2026-03-13T16:00:00.000Z'),
      endTime: new Date('2026-03-13T14:00:00.000Z'),
      inviteeIds: [1],
    };

    await expect(service.create(dto)).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(usersRepository.findBy).not.toHaveBeenCalled();
  });

  it('returns an event with invitees by id', async () => {
    const event = { id: 10, invitees: [] } as Event;
    eventsRepository.findOne.mockResolvedValue(event);

    await expect(service.findOne(10)).resolves.toEqual(event);
    expect(eventsRepository.findOne).toHaveBeenCalledWith({
      where: { id: 10 },
      relations: { invitees: true },
    });
  });

  it('throws when an event cannot be found', async () => {
    eventsRepository.findOne.mockResolvedValue(null);

    await expect(service.findOne(10)).rejects.toBeInstanceOf(NotFoundException);
  });

  it('removes an existing event', async () => {
    const event = { id: 10, invitees: [] } as Event;
    eventsRepository.findOne.mockResolvedValue(event);
    eventsRepository.remove.mockResolvedValue(event);

    await expect(service.remove(10)).resolves.toBeUndefined();
    expect(eventsRepository.remove).toHaveBeenCalledWith(event);
  });
});
