import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { EventStatus } from '../events/entities/event-status.enum';
import { Event } from '../events/entities/event.entity';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<Repository<User>>;
  let eventsRepository: jest.Mocked<Repository<Event>>;
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    repository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    } as unknown as jest.Mocked<Repository<User>>;
    eventsRepository = {
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    } as unknown as jest.Mocked<Repository<Event>>;
    dataSource = {
      transaction: jest.fn(async (callback) =>
        callback({
          getRepository: (entity: object) => {
            if (entity === User) {
              return repository;
            }

            return eventsRepository;
          },
        }),
      ),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: repository,
        },
        {
          provide: DataSource,
          useValue: dataSource,
        },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
    repository = moduleRef.get(getRepositoryToken(User));
    dataSource = moduleRef.get(DataSource);
  });

  it('creates and saves a user', async () => {
    const dto = { name: 'Alice' };
    const createdUser = { id: 1, ...dto } as User;

    repository.create.mockReturnValue(createdUser);
    repository.save.mockResolvedValue(createdUser);

    await expect(service.create(dto)).resolves.toEqual(createdUser);
    expect(repository.create).toHaveBeenCalledWith(dto);
    expect(repository.save).toHaveBeenCalledWith(createdUser);
  });

  it('returns the user events unchanged when no overlap exists', async () => {
    const user = {
      id: 1,
      events: [
        createEvent({
          id: 1,
          title: 'Morning',
          status: EventStatus.TODO,
          startTime: '2026-03-13T10:00:00.000Z',
          endTime: '2026-03-13T11:00:00.000Z',
          invitees: [createUser(1, 'Alice')],
        }),
        createEvent({
          id: 2,
          title: 'Noon',
          status: EventStatus.COMPLETED,
          startTime: '2026-03-13T11:00:00.000Z',
          endTime: '2026-03-13T12:00:00.000Z',
          invitees: [createUser(1, 'Alice')],
        }),
      ],
    } as User;

    repository.findOne.mockResolvedValue(user);

    await expect(service.mergeAll(1)).resolves.toEqual(user.events);
    expect(eventsRepository.remove).not.toHaveBeenCalled();
    expect(eventsRepository.save).not.toHaveBeenCalled();
  });

  it('merges overlapping events with a strict overlap rule and status priority', async () => {
    const alice = createUser(1, 'Alice');
    const bob = createUser(2, 'Bob');
    const originalUser = {
      id: 1,
      events: [
        createEvent({
          id: 10,
          title: 'Design',
          description: 'Discuss UI',
          status: EventStatus.TODO,
          startTime: '2026-03-13T14:00:00.000Z',
          endTime: '2026-03-13T15:00:00.000Z',
          invitees: [alice],
        }),
        createEvent({
          id: 11,
          title: 'Build',
          description: 'Implement API',
          status: EventStatus.IN_PROGRESS,
          startTime: '2026-03-13T14:30:00.000Z',
          endTime: '2026-03-13T16:00:00.000Z',
          invitees: [alice, bob],
        }),
      ],
    } as User;
    const mergedEvent = createEvent({
      id: 99,
      title: 'Design | Build',
      description: 'Discuss UI\nImplement API',
      status: EventStatus.IN_PROGRESS,
      startTime: '2026-03-13T14:00:00.000Z',
      endTime: '2026-03-13T16:00:00.000Z',
      invitees: [alice, bob],
    });
    const updatedUser = {
      id: 1,
      events: [mergedEvent],
    } as User;

    repository.findOne
      .mockResolvedValueOnce(originalUser)
      .mockResolvedValueOnce(updatedUser);
    eventsRepository.create.mockReturnValue(mergedEvent);
    eventsRepository.save.mockResolvedValue(mergedEvent);

    await expect(service.mergeAll(1)).resolves.toEqual([mergedEvent]);
    expect(eventsRepository.remove).toHaveBeenCalledWith(originalUser.events);
    expect(eventsRepository.create).toHaveBeenCalledWith({
      title: 'Design | Build',
      description: 'Discuss UI\nImplement API',
      status: EventStatus.IN_PROGRESS,
      startTime: new Date('2026-03-13T14:00:00.000Z'),
      endTime: new Date('2026-03-13T16:00:00.000Z'),
      invitees: [alice, bob],
    });
  });

  it('merges a continuous overlap chain into one event and deduplicates invitees', async () => {
    const alice = createUser(1, 'Alice');
    const bob = createUser(2, 'Bob');
    const carol = createUser(3, 'Carol');
    const originalUser = {
      id: 1,
      events: [
        createEvent({
          id: 1,
          title: 'A',
          description: 'Alpha',
          status: EventStatus.COMPLETED,
          startTime: '2026-03-13T09:00:00.000Z',
          endTime: '2026-03-13T10:00:00.000Z',
          invitees: [alice, bob],
        }),
        createEvent({
          id: 2,
          title: 'B',
          description: 'Beta',
          status: EventStatus.TODO,
          startTime: '2026-03-13T09:30:00.000Z',
          endTime: '2026-03-13T10:30:00.000Z',
          invitees: [alice, carol],
        }),
        createEvent({
          id: 3,
          title: 'C',
          description: 'Gamma',
          status: EventStatus.IN_PROGRESS,
          startTime: '2026-03-13T10:15:00.000Z',
          endTime: '2026-03-13T11:00:00.000Z',
          invitees: [alice, bob, carol],
        }),
      ],
    } as User;
    const mergedEvent = createEvent({
      id: 50,
      title: 'A | B | C',
      description: 'Alpha\nBeta\nGamma',
      status: EventStatus.IN_PROGRESS,
      startTime: '2026-03-13T09:00:00.000Z',
      endTime: '2026-03-13T11:00:00.000Z',
      invitees: [alice, bob, carol],
    });

    repository.findOne
      .mockResolvedValueOnce(originalUser)
      .mockResolvedValueOnce({ id: 1, events: [mergedEvent] } as User);
    eventsRepository.create.mockReturnValue(mergedEvent);
    eventsRepository.save.mockResolvedValue(mergedEvent);

    await expect(service.mergeAll(1)).resolves.toEqual([mergedEvent]);
    expect(eventsRepository.create).toHaveBeenCalledWith({
      title: 'A | B | C',
      description: 'Alpha\nBeta\nGamma',
      status: EventStatus.IN_PROGRESS,
      startTime: new Date('2026-03-13T09:00:00.000Z'),
      endTime: new Date('2026-03-13T11:00:00.000Z'),
      invitees: [alice, bob, carol],
    });
  });

  it('throws when the user does not exist', async () => {
    repository.findOne.mockResolvedValue(null);

    await expect(service.mergeAll(999)).rejects.toThrow(
      'User with id 999 not found',
    );
    expect(eventsRepository.remove).not.toHaveBeenCalled();
  });

  it('returns an empty array when the user exists but has no events', async () => {
    repository.findOne.mockResolvedValue({ id: 1, events: [] } as User);

    await expect(service.mergeAll(1)).resolves.toEqual([]);
    expect(eventsRepository.remove).not.toHaveBeenCalled();
    expect(eventsRepository.save).not.toHaveBeenCalled();
  });

  it('merges multiple independent overlap groups without merging them together', async () => {
    const alice = createUser(1, 'Alice');
    const originalUser = {
      id: 1,
      events: [
        createEvent({
          id: 1,
          title: 'A',
          status: EventStatus.TODO,
          startTime: '2026-03-13T10:00:00.000Z',
          endTime: '2026-03-13T11:00:00.000Z',
          invitees: [alice],
        }),
        createEvent({
          id: 2,
          title: 'B',
          status: EventStatus.IN_PROGRESS,
          startTime: '2026-03-13T10:30:00.000Z',
          endTime: '2026-03-13T12:00:00.000Z',
          invitees: [alice],
        }),
        createEvent({
          id: 3,
          title: 'C',
          status: EventStatus.COMPLETED,
          startTime: '2026-03-13T14:00:00.000Z',
          endTime: '2026-03-13T15:00:00.000Z',
          invitees: [alice],
        }),
        createEvent({
          id: 4,
          title: 'D',
          status: EventStatus.TODO,
          startTime: '2026-03-13T14:30:00.000Z',
          endTime: '2026-03-13T16:00:00.000Z',
          invitees: [alice],
        }),
      ],
    } as User;
    const mergedFirstGroup = createEvent({
      id: 10,
      title: 'A | B',
      status: EventStatus.IN_PROGRESS,
      startTime: '2026-03-13T10:00:00.000Z',
      endTime: '2026-03-13T12:00:00.000Z',
      invitees: [alice],
    });
    const mergedSecondGroup = createEvent({
      id: 11,
      title: 'C | D',
      status: EventStatus.TODO,
      startTime: '2026-03-13T14:00:00.000Z',
      endTime: '2026-03-13T16:00:00.000Z',
      invitees: [alice],
    });

    repository.findOne
      .mockResolvedValueOnce(originalUser)
      .mockResolvedValueOnce({
        id: 1,
        events: [mergedFirstGroup, mergedSecondGroup],
      } as User);
    eventsRepository.create
      .mockReturnValueOnce(mergedFirstGroup)
      .mockReturnValueOnce(mergedSecondGroup);
    eventsRepository.save
      .mockResolvedValueOnce(mergedFirstGroup)
      .mockResolvedValueOnce(mergedSecondGroup);

    await expect(service.mergeAll(1)).resolves.toEqual([
      mergedFirstGroup,
      mergedSecondGroup,
    ]);
    expect(eventsRepository.create).toHaveBeenNthCalledWith(1, {
      title: 'A | B',
      description: undefined,
      status: EventStatus.IN_PROGRESS,
      startTime: new Date('2026-03-13T10:00:00.000Z'),
      endTime: new Date('2026-03-13T12:00:00.000Z'),
      invitees: [alice],
    });
    expect(eventsRepository.create).toHaveBeenNthCalledWith(2, {
      title: 'C | D',
      description: undefined,
      status: EventStatus.TODO,
      startTime: new Date('2026-03-13T14:00:00.000Z'),
      endTime: new Date('2026-03-13T16:00:00.000Z'),
      invitees: [alice],
    });
  });

  it('deduplicates repeated titles when merging', async () => {
    const alice = createUser(1, 'Alice');
    const originalUser = {
      id: 1,
      events: [
        createEvent({
          id: 1,
          title: 'Meeting',
          description: 'Alpha',
          status: EventStatus.TODO,
          startTime: '2026-03-13T10:00:00.000Z',
          endTime: '2026-03-13T11:00:00.000Z',
          invitees: [alice],
        }),
        createEvent({
          id: 2,
          title: 'Meeting',
          description: 'Beta',
          status: EventStatus.IN_PROGRESS,
          startTime: '2026-03-13T10:30:00.000Z',
          endTime: '2026-03-13T11:30:00.000Z',
          invitees: [alice],
        }),
        createEvent({
          id: 3,
          title: 'Review',
          description: 'Gamma',
          status: EventStatus.COMPLETED,
          startTime: '2026-03-13T10:45:00.000Z',
          endTime: '2026-03-13T12:00:00.000Z',
          invitees: [alice],
        }),
      ],
    } as User;
    const mergedEvent = createEvent({
      id: 20,
      title: 'Meeting | Review',
      description: 'Alpha\nBeta\nGamma',
      status: EventStatus.IN_PROGRESS,
      startTime: '2026-03-13T10:00:00.000Z',
      endTime: '2026-03-13T12:00:00.000Z',
      invitees: [alice],
    });

    repository.findOne
      .mockResolvedValueOnce(originalUser)
      .mockResolvedValueOnce({ id: 1, events: [mergedEvent] } as User);
    eventsRepository.create.mockReturnValue(mergedEvent);
    eventsRepository.save.mockResolvedValue(mergedEvent);

    await expect(service.mergeAll(1)).resolves.toEqual([mergedEvent]);
    expect(eventsRepository.create).toHaveBeenCalledWith({
      title: 'Meeting | Review',
      description: 'Alpha\nBeta\nGamma',
      status: EventStatus.IN_PROGRESS,
      startTime: new Date('2026-03-13T10:00:00.000Z'),
      endTime: new Date('2026-03-13T12:00:00.000Z'),
      invitees: [alice],
    });
  });
});

function createUser(id: number, name: string): User {
  return { id, name, events: [] };
}

function createEvent(input: {
  id: number;
  title: string;
  description?: string;
  status: EventStatus;
  startTime: string;
  endTime: string;
  invitees: User[];
}): Event {
  return {
    ...input,
    startTime: new Date(input.startTime),
    endTime: new Date(input.endTime),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Event;
}
