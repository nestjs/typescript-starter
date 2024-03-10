import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { NotFoundException } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';

describe('EventsService', () => {
  let service: EventsService;
  let mockEventsRepository: Partial<Repository<Event>>;
  let mockUsersRepository: Partial<Repository<User>>;

  beforeEach(async () => {
    mockEventsRepository = {};
    mockUsersRepository = {};

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getRepositoryToken(Event), useValue: mockEventsRepository },
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });
  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create an event, associate it with users, and update users\' events', async () => {
      const createEventDto: CreateEventDto = {
        title: "Sample Event Title",
        description: "Sample event description here.",
        status: "TODO",
        startTime: new Date('2024-03-10T10:00:00Z'),
        endTime: new Date('2024-03-10T12:00:00Z'),
        invitees: [1, 2]
      };
  
      const mockUsers = [
        { id: 1, name: "User One", events: [] },
        { id: 2, name: "User Two" }
      ];
  
      const resultEvent: Event = {
        id: 1,
        title: "Test Event",
        description: "Test Event 1",
        status: "TODO",
        startTime: new Date('2024-03-10T10:00:00Z'),
        endTime: new Date('2024-03-10T12:00:00Z'),
        invitees: [
          { id: 1, name: "User One", events: [] },
          { id: 2, name: "User Two", events: [] }
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      mockUsersRepository.find = jest.fn().mockResolvedValue(mockUsers);
      mockEventsRepository.create = jest.fn().mockReturnValue(resultEvent);
      mockEventsRepository.save = jest.fn().mockResolvedValue(resultEvent);
  
      mockUsersRepository.save = jest.fn().mockImplementation(user => Promise.resolve({ ...user, events: [resultEvent] }));
  
      const result = await service.create(createEventDto);
  
      expect(mockEventsRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        ...createEventDto,
        invitees: expect.arrayContaining([
          expect.objectContaining({ id: expect.any(Number), name: expect.any(String) }),
          expect.objectContaining({ id: expect.any(Number), name: expect.any(String) })
        ])
      }));
      expect(mockEventsRepository.save).toHaveBeenCalledWith(resultEvent);
      expect(mockUsersRepository.find).toHaveBeenCalledWith({
        where: { id: In([1, 2]) },
      });
  
      for (const user of mockUsers) {
        expect(mockUsersRepository.save).toHaveBeenCalledWith({
          ...user,
          events: [expect.objectContaining({ id: resultEvent.id })],
        });
      }
    });
  });

  describe('findAll', () => {
    it('should return an array of events', async () => {
      const expectedResult = [
        { id: 1, name: 'Test Event 1' },
        { id: 2, name: 'Test Event 2' },
      ];
      mockEventsRepository.find = jest.fn().mockResolvedValue(expectedResult);
  
      const result = await service.findAll();
      expect(result).toBeInstanceOf(Array);
      expect(result).toEqual(expectedResult);
      expect(mockEventsRepository.find).toHaveBeenCalled();
    });
  });
  
  describe('findOne', () => {
    it('should return a single event', async () => {
      const eventId = 1;
      const expectedEvent = {
        id: eventId,
        title: "Event Title",
      };
  
      mockEventsRepository.findOne = jest.fn().mockResolvedValue(expectedEvent);
  
      const result = await service.findOne(eventId);
      expect(result).toEqual(expectedEvent);
    });
  
    it('should throw NotFoundException if event not found', async () => {
      const eventId = 999;
      mockEventsRepository.findOne = jest.fn().mockResolvedValue(undefined);
    
      await expect(service.findOne(eventId)).rejects.toThrow(NotFoundException);
    });
    
  });
  
  describe('remove', () => {
    it('should successfully remove an event', async () => {
      const eventId = 1;
      mockEventsRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });
  
      await service.remove(eventId);
      expect(mockEventsRepository.delete).toHaveBeenCalledWith(eventId);
    });
  
    it('should throw NotFoundException if no event was found to remove', async () => {
      const eventId = 999;
      mockEventsRepository.delete = jest.fn().mockResolvedValue({ affected: 0 });
  
      await expect(service.remove(eventId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('mergeOverlappingEvents', () => {
    it('should merge overlapping events for a user', async () => {
      const userId = 1;
      const events = [
        { id: 1, title: "Event 1", description: "Description 1", startTime: new Date('2022-01-01T09:00:00.000Z'), endTime: new Date('2022-01-01T11:00:00.000Z'), invitees: [{ id: 1, name: 'User 1' }] },
        { id: 2, title: "Event 2", description: "Description 2", startTime: new Date('2022-01-01T10:30:00.000Z'), endTime: new Date('2022-01-01T12:00:00.000Z'), invitees: [{ id: 1, name: 'User 1' }] },
      ];

      mockEventsRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });
      mockEventsRepository.save = jest.fn().mockImplementation(event => Promise.resolve(event));
      mockUsersRepository.findOne = jest.fn().mockResolvedValue({
        id: userId,
        name: 'User 1',
        events: events,
      });
  
      const mergedEvents = await service.mergeOverlappingEvents(userId);
  
      expect(mergedEvents.length).toBe(1);
      expect(mergedEvents[0].title).toContain('Event 1 / Event 2');
      expect(mergedEvents[0].invitees[0]).toEqual({ id: userId, name: 'User 1'});
      expect(mockEventsRepository.delete).toHaveBeenCalledTimes(1);
      expect(mockEventsRepository.save).toHaveBeenCalled();
    });

    it('should not merge non-overlapping events for a user', async () => {
      const userId = 1;
      const events = [
        { id: 1, title: "Event 1", description: "Description 1", startTime: new Date('2022-01-01T09:00:00.000Z'), endTime: new Date('2022-01-01T10:00:00.000Z'), invitees: [{ id: 1, name: 'User 1' }] },
        { id: 2, title: "Event 2", description: "Description 2", startTime: new Date('2022-01-01T11:00:00.000Z'), endTime: new Date('2022-01-01T12:00:00.000Z'), invitees: [{ id: 1, name: 'User 1' }] },
      ];
  
      mockEventsRepository.save = jest.fn().mockImplementation(event => Promise.resolve(event));
  
      mockUsersRepository.findOne = jest.fn().mockResolvedValue({
        id: userId,
        name: 'User 1',
        events: events,
      });
    
      const mergedEvents = await service.mergeOverlappingEvents(userId);
  
      expect(mergedEvents.length).toBe(2);
      expect(mockEventsRepository.save).toHaveBeenCalled();
    });
    it('should return the single event only', async () => {
      const userId = 1;
      const event = [
        { id: 1, title: "Event 1", description: "Description 1", startTime: new Date('2022-01-01T09:00:00.000Z'), endTime: new Date('2022-01-01T10:00:00.000Z'), invitees: [{ id: 1, name: 'User 1' }] },
      ];

      mockUsersRepository.findOne = jest.fn().mockResolvedValue({
        id: userId,
        name: 'User 1',
        events: event,
      });
    
      const mergedEvents = await service.mergeOverlappingEvents(userId);
  
      expect(mergedEvents.length).toBe(1);
      expect(mergedEvents).toEqual(expect.arrayContaining(event));
    });
  });
});
