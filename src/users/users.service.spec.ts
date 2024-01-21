import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';
import { In, Repository } from 'typeorm';
import { EventsService } from '../events/events.service';

describe('UsersService', () => {
    let service: UsersService;
    let mockUsersRepository: Partial<Repository<User>>;
    let mockEventsService: Partial<EventsService>;

    beforeEach(async () => {
        mockUsersRepository = {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
        };
        mockEventsService = {
            getEventInvitees: jest.fn(),
            create: jest.fn(),
            deleteEventById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UsersService,
                {
                    provide: getRepositoryToken(User),
                    useValue: mockUsersRepository,
                },
                {
                    provide: EventsService,
                    useValue: mockEventsService,
                },
            ],
        }).compile();

        service = module.get<UsersService>(UsersService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create and return a user', async () => {
            const createUserDto = { name: 'Test User', events: [] };
            const savedUser = { id: 1, ...createUserDto };
            (mockUsersRepository.create as jest.Mock).mockReturnValue(
                createUserDto,
            );
            (mockUsersRepository.save as jest.Mock).mockResolvedValue(
                savedUser,
            );
            const result = await service.create(createUserDto);
            expect(result).toEqual(savedUser);
            expect(mockUsersRepository.create).toHaveBeenCalledWith(
                createUserDto,
            );
            expect(mockUsersRepository.save).toHaveBeenCalledWith(
                createUserDto,
            );
        });
    });

    describe('getUserById', () => {
        it('should return a user', async () => {
            const user = { id: 1, name: 'Test User', events: [] };

            (mockUsersRepository.findOne as jest.Mock).mockResolvedValue(user);
            const result = await service.getUserById(1);
            expect(result).toEqual(user);
            expect(mockUsersRepository.findOne).toHaveBeenCalledWith({
                where: { id: 1 },
                relations: ['events'],
            });
        });
    });

    describe('findUsersByIds', () => {
        it('should return an array of users', async () => {
            const users = [
                { id: 1, name: 'Test User 1', events: [] },
                { id: 2, name: 'Test User 2', events: [] },
            ];
            (mockUsersRepository.find as jest.Mock).mockResolvedValue(users);
            const result = await service.findUsersByIds([1, 2]);
            expect(result).toEqual(users);
            expect(mockUsersRepository.find).toHaveBeenCalledWith({
                where: { id: In([1, 2]) },
            });
        });
    });

    describe('mergeAllEvents', () => {
        it('should merge overlapping events and return merged events', async () => {
            const events = [
                {
                    id: 1,
                    title: 'Test Event 1',
                    description: 'Test Event 1 Description',
                    status: 'IN_PROGRESS', // Example status, adjust according to your Event type
                    startTime: new Date('2021-01-01T00:00:00.000Z'),
                    endTime: new Date('2021-01-01T01:00:00.000Z'),
                    createdAt: new Date('2021-01-01T00:00:00.000Z'), // Corrected property name
                    updatedAt: new Date('2021-01-01T00:00:00.000Z'),
                    invitees: [
                        { id: 1, name: 'Test User', events: [] },
                        { id: 2, name: 'Test User 2', events: [] },
                    ],
                },
                {
                    id: 2,
                    title: 'Test Event 2',
                    description: 'Test Event 2 Description',
                    status: 'IN_PROGRESS', // Example status, adjust according to your Event type
                    startTime: new Date('2021-01-01T00:30:00.000Z'),
                    endTime: new Date('2021-01-01T01:30:00.000Z'),
                    createdAt: new Date('2021-01-01T00:00:00.000Z'), // Corrected property name
                    updatedAt: new Date('2021-01-01T00:00:00.000Z'),
                    invitees: [
                        { id: 1, name: 'Test User', events: [] },
                        { id: 3, name: 'Test User 3', events: [] },
                    ],
                },
            ];

            (
                mockEventsService.getEventInvitees as jest.Mock
            ).mockImplementation(async (eventId: number) => {
                const event = events.find((event) => event.id === eventId);
                if (!event) {
                    throw new Error('Event not found');
                }
                return event.invitees;
            });

            jest.spyOn(service, 'getEventsForUser').mockResolvedValue(events);

            (mockEventsService.deleteEventById as jest.Mock).mockResolvedValue(
                {},
            );

            const mergedEvents = await service.mergeAllEvents(1);

            expect(mergedEvents).toHaveLength(1);
            expect(mockEventsService.create).toHaveBeenCalledTimes(1);
            expect(mockEventsService.deleteEventById).toHaveBeenCalledTimes(2);
        });
        it('should return an empty array if user does not have any overlapping events', async () => {
            const events = [
                {
                    id: 1,
                    title: 'Test Event 1',
                    description: 'Test Event 1 Description',
                    status: 'IN_PROGRESS', // Example status, adjust according to your Event type
                    startTime: new Date('2021-01-01T00:00:00.000Z'),
                    endTime: new Date('2021-01-01T01:00:00.000Z'),
                    createdAt: new Date('2021-01-01T00:00:00.000Z'), // Corrected property name
                    updatedAt: new Date('2021-01-01T00:00:00.000Z'),
                    invitees: [
                        { id: 1, name: 'Test User', events: [] },
                        { id: 2, name: 'Test User 2', events: [] },
                    ],
                },
                {
                    id: 2,
                    title: 'Test Event 2',
                    description: 'Test Event 2 Description',
                    status: 'IN_PROGRESS', // Example status, adjust according to your Event type
                    startTime: new Date('2021-01-01T01:30:00.000Z'),
                    endTime: new Date('2021-01-01T02:00:00.000Z'),
                    createdAt: new Date('2021-01-01T00:00:00.000Z'), // Corrected property name
                    updatedAt: new Date('2021-01-01T00:00:00.000Z'),
                    invitees: [
                        { id: 1, name: 'Test User', events: [] },
                        { id: 3, name: 'Test User 3', events: [] },
                    ],
                },
            ];

            (
                mockEventsService.getEventInvitees as jest.Mock
            ).mockImplementation(async (eventId: number) => {
                const event = events.find((event) => event.id === eventId);
                if (!event) {
                    throw new Error('Event not found');
                }
                return event.invitees;
            });

            jest.spyOn(service, 'getEventsForUser').mockResolvedValue(events);

            (mockEventsService.deleteEventById as jest.Mock).mockResolvedValue(
                {},
            );

            const mergedEvents = await service.mergeAllEvents(1);

            expect(mergedEvents).toHaveLength(0);
            expect(mockEventsService.create).toHaveBeenCalledTimes(0);
            expect(mockEventsService.deleteEventById).toHaveBeenCalledTimes(0);
        });
    });

    describe('getEventsForUser', () => {
        it('should return an array of events', async () => {
            const events = [
                {
                    id: 1,
                    title: 'Test Event 1',
                    description: 'Test Event 1 Description',
                    status: 'IN_PROGRESS', // Example status, adjust according to your Event type
                    startTime: new Date('2021-01-01T00:00:00.000Z'),
                    endTime: new Date('2021-01-01T01:00:00.000Z'),
                    createdAt: new Date('2021-01-01T00:00:00.000Z'), // Corrected property name
                    updatedAt: new Date('2021-01-01T00:00:00.000Z'),
                    invitees: [
                        { id: 1, name: 'Test User', events: [] },
                        { id: 2, name: 'Test User 2', events: [] },
                    ],
                },
                {
                    id: 2,
                    title: 'Test Event 2',
                    description: 'Test Event 2 Description',
                    status: 'IN_PROGRESS', // Example status, adjust according to your Event type
                    startTime: new Date('2021-01-01T00:30:00.000Z'),
                    endTime: new Date('2021-01-01T01:30:00.000Z'),
                    createdAt: new Date('2021-01-01T00:00:00.000Z'), // Corrected property name
                    updatedAt: new Date('2021-01-01T00:00:00.000Z'),
                    invitees: [
                        { id: 1, name: 'Test User', events: [] },
                        { id: 3, name: 'Test User 3', events: [] },
                    ],
                },
            ];

            mockUsersRepository.findOne = jest.fn().mockResolvedValue({
                id: 1,
                name: 'Test User',
                events,
            });

            const result = await service.getEventsForUser(1);

            expect(result).toEqual(events);
        });
        it('should throw an error if user not found', async () => {
            mockUsersRepository.findOne = jest.fn().mockResolvedValue(null);

            await expect(service.getEventsForUser(1)).rejects.toThrow(
                'User not found',
            );
        });
    });
});
