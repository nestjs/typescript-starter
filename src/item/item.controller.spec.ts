/* eslint-disable prettier/prettier */
import { Test, TestingModule } from '@nestjs/testing';
import { Item } from './entities/item.entity';
import { ItemController } from './item.controller';
import { ItemService } from './item.service';

describe('ItemController', () => {
  let controller: ItemController;
  let service: ItemService;

  const itemEntityList: Item[]= [
    new Item({id: 1, name:"carbox", description:"carboxiterapia", quantity:3}),
    new Item({id: 2, name:"drenagem", description:"drenagem linfática", quantity:1}),
    new Item({id: 3, name:"depilação", description:"depilação a laser", quantity:10}),
  ];
  
  const newItem = new Item({id: 1, name:"carbox", description:"carboxiterapia", quantity:3});

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemController],
      providers: [
        {
          provide: ItemService,
          useValue:{
            create: jest.fn(),
            findAll: jest.fn().mockResolvedValue(itemEntityList),
            findById: jest.fn().mockResolvedValue(newItem),
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
  
  describe('findById', () => {
    it('should return a item by id successfully', async () => {
      //Act
      const result = await controller.findById(1);
      //Assert
      expect(result).toEqual(itemEntityList[0]);
      expect(service.findById).toHaveBeenCalledTimes(1);
    })

    it('should throw an exception', () => {
      //Arrange 
      jest.spyOn(controller, 'findById').mockRejectedValueOnce(new Error());
      
      //Assert
      expect(controller.findById(1)).rejects.toThrowError();
    })
  })

  

  describe('update', () => {
    it('should return a item by id successfully', async () => {
      //Arrange 
      //Act
      //Assert
    })
    it('should throw an exception', async () => {
      //Arrange 
      //Act
      //Assert
    })
  })

});
