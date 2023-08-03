import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from './task.entity';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let repo: Repository<Task>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(Task),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    repo = module.get<Repository<Task>>(getRepositoryToken(Task));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a task', async () => {
    const testTask = new Task();
    testTask.title = 'Test task';
    jest.spyOn(repo, 'save').mockResolvedValue(testTask);

    const result = await service.create(testTask.title);
    expect(result).toEqual(testTask);
  });

  // similar tests for findOne and remove
});
