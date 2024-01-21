import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './event.entity';
import { UsersService } from '../users/users.service';

describe('EventsService', () => {
    let service: EventsService;
    let mockRepsitory: Partial<Repository<Event>>;
    let mockUsersService: Partial<UsersService>;

    beforeEach(async () => {
        mockRepsitory = {
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
        };
        mockUsersService = {
            findUsersByIds: jest.fn(),
        };
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                EventsService,
                {
                    provide: getRepositoryToken(Event),
                    useValue: mockRepsitory,
                },
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
            ],
        }).compile();

        service = module.get<EventsService>(EventsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create a new event', async () => {
            const newEvent = {
                id: 1,
                title: 'Test Event',
                description: 'Test Description',
                status: 'CREATED',
                startTime: new Date(),
                endTime: new Date(),
                invitees: [1],
            };
            mockRepsitory.create = jest.fn().mockReturnValue(newEvent);
            mockUsersService.findUsersByIds = jest.fn().mockResolvedValue([
                {
                    id: 1,
                    name: 'Test User',
                    events: [],
                },
            ]);
            mockRepsitory.save = jest.fn().mockResolvedValue(newEvent);
            const result = await service.create(newEvent);
            expect(result).toEqual(newEvent);
        });
    });

    describe('getEventById', () => {
        it('should return an event by id', async () => {
            const eventId = 1;
            const event = {
                id: eventId,
                title: 'Test Event',
                description: 'Test Description',
                status: 'CREATED',
                startTime: new Date(),
                endTime: new Date(),
                invitees: [],
            };
            mockRepsitory.findOne = jest.fn().mockResolvedValue(event);
            const result = await service.getEventById(eventId);
            expect(result).toEqual(event);
        });
    });

    describe('deleteEventById', () => {
        it('should delete an event by id', async () => {
            const eventId = 1;
            mockRepsitory.delete = jest.fn();
            await service.deleteEventById(eventId);
            expect(mockRepsitory.delete).toHaveBeenCalledWith({ id: eventId });
        });
    });

    describe('getEventInvitees', () => {
        it('should return invitees for an event', async () => {
            const eventId = 1;
            const event = {
                id: eventId,
                title: 'Test Event',
                description: 'Test Description',
                status: 'CREATED',
                startTime: new Date(),
                endTime: new Date(),
                invitees: [],
            };
            mockRepsitory.findOne = jest.fn().mockResolvedValue(event);
            const result = await service.getEventInvitees(eventId);
            expect(result).toEqual(event.invitees);
        });
        it('should throw an error if event not found', async () => {
            const eventId = 1;
            mockRepsitory.findOne = jest.fn().mockResolvedValue(null);
            await expect(service.getEventInvitees(eventId)).rejects.toThrow(
                'Event not found',
            );
        });
    });
});
