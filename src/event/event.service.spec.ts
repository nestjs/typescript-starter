import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from './event';
import { User } from '../user/user';

describe('EventService', () => {
  let service: EventService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventService,
        {
          provide: getRepositoryToken(Event),
          useValue: {
            create: jest.fn().mockImplementation((data) => data),
            save: jest.fn().mockImplementation((event) => Promise.resolve({ id: 1, ...event })),
            find: jest.fn().mockResolvedValue([]),
            findOne: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<EventService>(EventService);
  });

  it('should create a new event', async () => {
    const result = await service.create({
      title: 'Test',
      status: 'TODO',
      startTime: new Date(),
      endTime: new Date(),
      invitees: [],
    });

    expect(result).toHaveProperty('id');
    expect(result.title).toBe('Test');
  });
});
