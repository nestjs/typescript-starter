import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    // Mock UsersService
    const mockUsersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      deleteUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call userService.create and return the result', async () => {
      const dto: CreateUserDto = {
        name: 'John Doe',
        eventIds: [1, 2]
      };
  
      await controller.create(dto);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should call userService.findAll and return the result', async () => {
      const expectedResult = [
        { id: 1, name: 'Test User 1' },
        { id: 2, name: 'Test User 2' },
      ];
      service.findAll = jest.fn().mockResolvedValue(expectedResult);
  
      const result = await controller.findAll();
      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });
  
  describe('deleteUser', () => {
    it('should call userService.deleteUser', async () => {
      const userId = 1;
      service.deleteUser = jest.fn().mockResolvedValue(undefined);

      await controller.deleteUser(userId.toString());
      expect(service.deleteUser).toHaveBeenCalledWith(userId);
    });
  });
  
  
});
