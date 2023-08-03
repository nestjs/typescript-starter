import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskStatus } from './tasks.model';

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('createTask() should return a task', () => {
    const task = service.createTask('Task 1', 'Test task 1');
    expect(task.title).toBe('Task 1');
    expect(task.description).toBe('Test task 1');
    expect(task.status).toBe(TaskStatus.TODO);
  });

  it('getById() should return a task', () => {
    const task = service.createTask('Task 1', 'Test task 1');
    const found = service.getById(task.id);
    expect(found).toEqual(task);
  });

  it('deleteTask() should remove a task', () => {
    const task = service.createTask('Task 1', 'Test task 1');
    service.deleteTask(task.id);
    expect(service.getById(task.id)).toBeUndefined();
  });

  it('updateStatus() should change the task status', () => {
    const task = service.createTask('Task 1', 'Test task 1');
    const updatedTask = service.updateStatus(task.id, TaskStatus.IN_PROGRESS);
    expect(updatedTask.status).toBe(TaskStatus.IN_PROGRESS);
  });
});
