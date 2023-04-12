import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { getModelToken } from '@nestjs/mongoose';


describe('TasksController', () => {
  let controller: TasksController;

  const mockTasksService={};

  beforeEach(async () => {
    const module: TestingModule= await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        TasksService,
        {provide: getModelToken('Task'),
        useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            findByIdAndRemove: jest.fn(),
            save: jest.fn()}
        }
        ],
    })
    .overrideProvider(TasksService)
    .useValue(mockTasksService)
    .compile();
    
    controller=module.get<TasksController>(TasksController);
  });
  
  it('should be defined',()=>{
    expect(controller).toBeDefined();
  });
});