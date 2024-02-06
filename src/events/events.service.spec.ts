import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' }),
              update: jest.fn(),
            },
            event: {
              findMany: jest.fn().mockResolvedValue([
                {
                  id: 1,
                  title: 'Event 1',
                  description: 'First Event',
                  startTime: new Date('2023-01-01T09:00:00.000Z'),
                  endTime: new Date('2023-02-01T11:00:00.000Z'),
                  invitees: [{ id: 1 }, { id: 2 }],
                },
                {
                  id: 2,
                  title: 'Event 2',
                  description: 'Second Event',
                  startTime: new Date('2023-01-30T10:00:00.000Z'),
                  endTime: new Date('2023-03-01T12:00:00.000Z'),
                  invitees: [{ id: 1 }, { id: 3 }],
                },
                {
                  id: 3,
                  title: 'Event 3',
                  description: 'Third Event',
                  startTime: new Date('2023-05-02T09:00:00.000Z'), // Different day
                  endTime: new Date('2023-05-03T11:00:00.000Z'),
                  invitees: [{ id: 1 }, { id: 5 }],
                },
              ]),
              delete: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Test for undefuned user
  it("throws NotFoundException if user doesn't exist", async () => {
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);
    await expect(service.mergeAllEventsForUser(99)).rejects.toThrow(NotFoundException);
  });

  // Test for mergeAll method in overlapping scenerio
  it('merges overlapping events and updates invitees', async () => {
    await service.mergeAllEventsForUser(1);

    // Expect the event update method to be called with merged data
    expect(prismaService.event.update).toHaveBeenCalledWith({
      where: { id: 1 }, 
      data: expect.objectContaining({
        title: expect.stringContaining('Event 1 / Event 2'),
        description: expect.stringContaining('First Event / Second Event'),
        endTime: new Date('2023-03-01T12:00:00.000Z'), 
        invitees: {
          set: [],
          connect: expect.arrayContaining([{ id: 1 }, { id: 2 }, { id: 3 }]), // Combined invitees
        },
      }),
    });

    // Expect the delete method to be called for the second event (overlapping event)
    expect(prismaService.event.delete).toHaveBeenCalledWith({ where: { id: 2 } });

    // Expect the delete method not being called for the non-overlapping event
    expect(prismaService.event.delete).not.toHaveBeenCalledWith({ where: { id: 3 } });
  });
});
