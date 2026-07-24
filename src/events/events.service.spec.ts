import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventsService } from './events.service';
import { Event } from './event.entity';
import { User } from '../users/user.entity';
import { EventStatus } from './event-status.enum';

// Small fake repository - just enough of the Repository<T> surface for
// these tests, not trying to fake the whole TypeORM API. Typed loosely on
// purpose so tests can pass in plain objects instead of full Event/User
// instances.
type FakeRepo<T> = {
  create: jest.Mock<T, [Partial<T>]>;
  save: jest.Mock<Promise<T>, [Partial<T>]>;
  find: jest.Mock<Promise<T[]>, []>;
  findOne: jest.Mock<Promise<T | null>, [unknown]>;
  findOneBy: jest.Mock<Promise<T | null>, [unknown]>;
  findBy: jest.Mock<Promise<T[]>, [unknown]>;
  remove: jest.Mock<Promise<T>, [T | T[]]>;
};

function fakeRepository<T>(): FakeRepo<T> {
  return {
    create: jest.fn<T, [Partial<T>]>((x) => x as T),
    save: jest.fn<Promise<T>, [Partial<T>]>(
      (x) => Promise.resolve({ id: 1, ...x }) as Promise<T>,
    ),
    find: jest.fn<Promise<T[]>, []>(() => Promise.resolve([] as T[])),
    findOne: jest.fn<Promise<T | null>, [unknown]>(() => Promise.resolve(null)),
    findOneBy: jest.fn<Promise<T | null>, [unknown]>(() =>
      Promise.resolve(null),
    ),
    findBy: jest.fn<Promise<T[]>, [unknown]>(() => Promise.resolve([] as T[])),
    remove: jest.fn<Promise<T>, [T | T[]]>(
      (x) => Promise.resolve(x) as Promise<T>,
    ),
  };
}

describe('EventsService', () => {
  let service: EventsService;
  let eventRepo: FakeRepo<Event>;
  let userRepo: FakeRepo<User>;
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    eventRepo = fakeRepository<Event>();
    userRepo = fakeRepository<User>();

    // The service runs mergeAllForUser inside dataSource.transaction(cb).
    // For unit tests we don't want a real transaction, so this just calls
    // the callback straight away with a fake "manager" that hands back our
    // same mocked event repo whenever asked for one.
    dataSource = {
      transaction: jest.fn((cb: (manager: unknown) => unknown) =>
        cb({ getRepository: () => eventRepo }),
      ),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: getRepositoryToken(Event), useValue: eventRepo },
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = moduleRef.get(EventsService);
  });

  describe('create', () => {
    it('creates an event with no invitees when none are given', async () => {
      await service.create({
        title: 'Standup',
        startTime: '2024-01-01T09:00:00.000Z',
        endTime: '2024-01-01T09:30:00.000Z',
      });

      expect(userRepo.findBy).not.toHaveBeenCalled();
      expect(eventRepo.save).toHaveBeenCalled();
    });

    it('looks up invitees by id when inviteeIds is passed', async () => {
      const alice = { id: 1, name: 'alice' } as User;
      userRepo.findBy.mockResolvedValue([alice]);

      await service.create({
        title: 'Standup',
        startTime: '2024-01-01T09:00:00.000Z',
        endTime: '2024-01-01T09:30:00.000Z',
        inviteeIds: [1],
      });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- expect.anything() is typed `any` in @types/jest, nothing to fix here
      expect(userRepo.findBy).toHaveBeenCalledWith({ id: expect.anything() });
      expect(eventRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ invitees: [alice] }),
      );
    });
  });

  describe('findOne', () => {
    it('returns the event when it exists', async () => {
      const event = { id: 1, title: 'Standup' } as Event;
      eventRepo.findOne.mockResolvedValue(event);

      await expect(service.findOne(1)).resolves.toBe(event);
    });

    it('throws NotFoundException when it does not exist', async () => {
      eventRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('removes an event that exists', async () => {
      const event = { id: 1, title: 'Standup' } as Event;
      eventRepo.findOne.mockResolvedValue(event);

      await service.remove(1);

      expect(eventRepo.remove).toHaveBeenCalledWith(event);
    });

    it('throws NotFoundException instead of trying to remove something missing', async () => {
      eventRepo.findOne.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
      expect(eventRepo.remove).not.toHaveBeenCalled();
    });
  });

  describe('mergeAllForUser', () => {
    it('throws NotFoundException if the user does not exist', async () => {
      userRepo.findOneBy.mockResolvedValue(null);

      await expect(service.mergeAllForUser(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('merges overlapping events for that user and leaves others untouched', async () => {
      userRepo.findOneBy.mockResolvedValue({ id: 1, name: 'alice' } as User);

      const alice = { id: 1, name: 'alice' } as User;
      const bob = { id: 2, name: 'bob' } as User;

      const overlapping1 = {
        id: 10,
        title: 'Standup',
        description: undefined,
        status: EventStatus.TODO,
        startTime: new Date(2024, 0, 1, 14, 0),
        endTime: new Date(2024, 0, 1, 15, 0),
        invitees: [alice],
      } as Event;
      const overlapping2 = {
        id: 11,
        title: 'Design review',
        description: undefined,
        status: EventStatus.TODO,
        startTime: new Date(2024, 0, 1, 14, 45),
        endTime: new Date(2024, 0, 1, 16, 0),
        invitees: [alice, bob],
      } as Event;
      const unrelated = {
        id: 12,
        title: 'Not alice',
        description: undefined,
        status: EventStatus.TODO,
        startTime: new Date(2024, 0, 1, 20, 0),
        endTime: new Date(2024, 0, 1, 21, 0),
        invitees: [bob], // alice isn't invited to this one
      } as Event;

      eventRepo.find.mockResolvedValue([overlapping1, overlapping2, unrelated]);

      const result = await service.mergeAllForUser(1);

      // unrelated event isn't in alice's list at all so it should never show up
      expect(result.find((e) => e.id === 12)).toBeUndefined();

      // the two overlapping ones should have produced one merged event, and
      // both originals should have been cleaned up
      expect(eventRepo.remove).toHaveBeenCalledWith([
        overlapping1,
        overlapping2,
      ]);
      expect(result.some((e) => e.title === 'Standup + Design review')).toBe(
        true,
      );
    });
  });
});
