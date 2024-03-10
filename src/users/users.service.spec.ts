import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';

describe('UsersService', () => {
  let service: UsersService;
  let mockUsersRepository: Partial<Repository<User>>;
  let mockEventsRepository: Partial<Repository<Event>>;

  beforeEach(async () => {
    mockUsersRepository = {}
    mockEventsRepository = {}

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(Event), useValue: mockEventsRepository },
        { provide: getRepositoryToken(User), useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should successfully create a user with events', async () => {
      const createUserDto = {
        name: 'Test User',
        eventIds: [1, 2],
      };
    
      const events = [{ id: 1 }, { id: 2 }];
      mockEventsRepository.findBy = jest.fn().mockResolvedValue(events);
    
      const expectedUserData = {
        name: 'Test User',
        events: events,
      };
      
      mockUsersRepository.create = jest.fn().mockImplementation((user) => user);
      mockUsersRepository.save = jest.fn().mockResolvedValue({ id: 3, ...expectedUserData });
    
      const result = await service.create(createUserDto);
    
      expect(mockUsersRepository.create).toHaveBeenCalledWith(expectedUserData);
      expect(mockUsersRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ id: 3, ...expectedUserData });
    });
    it('should successfully create a user with no events', async () => {
      const createUserDto = {
        name: 'Test User',
      };
    
      const events = [];
      mockEventsRepository.findBy = jest.fn().mockResolvedValue(events);
    
      const expectedUserData = {
        name: 'Test User',
        events: events,
      };
      
      mockUsersRepository.create = jest.fn().mockImplementation((user) => user);
      mockUsersRepository.save = jest.fn().mockResolvedValue({ id: 3, ...expectedUserData });
    
      const result = await service.create(createUserDto);
    
      expect(mockUsersRepository.create).toHaveBeenCalledWith(expectedUserData);
      expect(mockUsersRepository.save).toHaveBeenCalled();
      expect(result).toEqual({ id: 3, ...expectedUserData });
    });
    it('should throw no such event error', async () => {    
      const createUserDto = {
        name: 'Test User',
        eventIds: [1, 2]
      };
    
      const events = [{ id: 1 }];
      mockEventsRepository.findBy = jest.fn().mockResolvedValue(events);
    
      mockUsersRepository.create = jest.fn();
      mockUsersRepository.save = jest.fn();
    
      try {
        await service.create(createUserDto);
      } catch (error) {
        expect(error.message).toEqual('One or more events do not exist.');
      }
    
      expect(mockUsersRepository.create).not.toHaveBeenCalled();
      expect(mockUsersRepository.save).not.toHaveBeenCalled();
    });
    
  });

  describe('findAll', () => {
    it('should successfully find all users', async () => {
      mockUsersRepository.find = jest.fn().mockResolvedValue([]);

      const result = await service.findAll();
      expect(result).toBeInstanceOf(Array);
      expect(mockUsersRepository.find).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should successfully delete an user', async () => {
      const userId = 1;

      const eventsWithUser = [{
        invitees: [{ id: 1, name: 'Test User' }, { id: 2, name: 'Other User' }]
      }];
  
      mockEventsRepository.createQueryBuilder = jest.fn(() => {
        const mockQueryBuilder: Partial<SelectQueryBuilder<Event>> = {
          leftJoin: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          getMany: jest.fn().mockResolvedValue(eventsWithUser),
        }
        return mockQueryBuilder as SelectQueryBuilder<Event>
      });

      mockUsersRepository.delete = jest.fn().mockResolvedValue({ affected: 1 });
      mockEventsRepository.save = jest.fn().mockImplementation(event => Promise.resolve(event));

      await service.deleteUser(userId);

      expect(mockEventsRepository.createQueryBuilder).toHaveBeenCalled();
      expect(mockEventsRepository.save).toHaveBeenCalled();
      expect(mockUsersRepository.delete).toHaveBeenCalledWith(userId);
    });
  });
  
});
