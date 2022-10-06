/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';

describe('ItemController', () => {
  let controller: ItemController;
  let service: ItemService;
  
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        {
          provide: ItemService,
          useValue:{
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ItemController>(ItemController);
    service = module.get<ItemService>(ItemService)
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
  
  describe('findOne', () => {
    it('should return a item by id successfully', async () => {
      //Arrange 
      //Act
      //Assert
    })
  })

  describe('findOne', () => {
    it('should return a item by id fail', async () => {
      //Arrange 
      //Act
      //Assert
    })
  })

  describe('update', () => {
    it('should return a item by id successfully', async () => {
      //Arrange 
      //Act
      //Assert
    })
  })

  describe('findOne', () => {
    it('should return a item by id fail', async () => {
      //Arrange 
      //Act
      //Assert
    })
  })
});
