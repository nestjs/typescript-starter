/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { Item } from './entities/item.entity';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';
import { CreateItemDto } from './dto/create-item.dto';

describe('ItemController', () => {
  let controller: ItemController;
  let service: ItemService;

  const itemEntityList: Item[] = [
    new Item({
      id: 1,
      name: 'carbox',
      description: 'carboxiterapia',
      quantity: 3,
    }),
    new Item({
      id: 2,
      name: 'drenagem',
      description: 'drenagem linfática',
      quantity: 1,
    }),
    new Item({
      id: 3,
      name: 'depilação',
      description: 'depilação a laser',
      quantity: 10,
    }),
  ];

  const newItemEntity = new Item({
    id: 1,
    name: 'carbox',
    description: 'carboxiterapia',
    quantity: 3,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        {
          provide: ItemService,
          useValue: {
            create: jest.fn().mockResolvedValue(newItemEntity),
            findAll: jest.fn().mockResolvedValue(itemEntityList),
            findById: jest.fn().mockResolvedValue(newItemEntity),
            update: jest.fn(),
            remove: jest.fn().mockResolvedValue(newItemEntity),
          },
        },
      ],
    }).compile();

    controller = module.get<ItemController>(ItemController);
    service = module.get<ItemService>(ItemService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a item successfully', async () => {
      //Arrange
      const body: CreateItemDto = {
        name: 'drenagem',
        description: 'drenagem linfática',
        quantity: 2,
      };

      //Act
      const result = await controller.create(body);
      //Assert
      expect(result).toEqual(newItemEntity);
      expect(service.create).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', () => {
      //Arrange
      jest.spyOn(controller, 'create').mockRejectedValueOnce(new Error());

      //Assert
      expect(controller.create).rejects.toThrowError();
    });
  });

  describe('findAll', () => {
    it('should return a array list successfully', async () => {
      //Act
      const result = await controller.findAll();
      //Assert
      expect(result).toEqual(itemEntityList);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', () => {
      //Arrange
      jest.spyOn(controller, 'findAll').mockRejectedValueOnce(new Error());

      //Assert
      expect(controller.findAll()).rejects.toThrowError();
    });
  });

  describe('findById', () => {
    it('should return a item by id successfully', async () => {
      //Act
      const result = await controller.findById(1);
      //Assert
      expect(result).toEqual(newItemEntity);
      expect(service.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', () => {
      //Arrange
      jest.spyOn(controller, 'findById').mockRejectedValueOnce(new Error());

      //Assert
      expect(controller.findById(1)).rejects.toThrowError();
    });
  });

  describe('update', () => {
    it('should return a item by id successfully', async () => {
      //Arrange
      //Act
      //Assert
    });
    it('should throw an exception', async () => {
      //Arrange
      //Act
      //Assert
    });
  });

  describe('remove', () => {
    it('should delete a item by id successfully', async () => {
      //Act
      const result = await controller.remove(1);
      //Assert
      expect(result).toEqual(newItemEntity);
      expect(service.remove).toHaveBeenCalledTimes(1);
    });

    it('should throw an exception', () => {
      //Arrange
      jest.spyOn(controller, 'remove').mockRejectedValueOnce(new Error());

      //Assert
      expect(controller.remove(1)).rejects.toThrowError();
    });
  });
});
