import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from '../tasks.controller';
import { TasksService } from '../tasks.service';
import { taskStub } from "./stubs/task.stub";
import { Task } from '../task.model';

jest.mock('../tasks.service');

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  beforeEach(async () => {
    const module: TestingModule= await Test.createTestingModule({
      controllers: [TasksController],
      providers: [TasksService],
    })
    .compile();
    
    service=module.get<TasksService>(TasksService);
    controller=module.get<TasksController>(TasksController);
    
    jest.clearAllMocks();
  });
  

  /* Test addTask() */
  describe('addTask', () => {
    describe('when addTask is called with correct inputs', () => {

      let title:string;
      let status:string;
      let description:string;
      let id:string;

      beforeEach(async () => {
        title=taskStub().title;
        status=taskStub().status;
        description=taskStub().description;

        id=(await controller.addTask(title, description, status)).id;
      })

      test('then it should call tasksService', () => {
        expect(service.insertTask).toHaveBeenCalledWith(title, status, description);
      })

      test('then it should return an id', () => {
        expect(id).toEqual(taskStub()._id);
      })
    })
  })

  /* Test getTask() */
  describe('getTask', () =>{
    let task: Task;

    beforeEach(async () => {
      task = await controller.getTask(taskStub()._id)  
    })

    describe('when getUser is called', () => {

      test('then it should call taskService', () => {
        expect(service.getTask).toBeCalledWith(taskStub()._id);
      })

      test('then is should return a task', () => {
        expect(task).toEqual(taskStub());
      })
    })
  })

  /* Test deleteTask() */
  describe('deleteTask', () =>{
    let task: Task;

    beforeEach(async () => {
      task = await controller.deleteTask(taskStub()._id)  
    })

    describe('when deleteUser is called', () => {

      test('then it should call taskService', () => {
        expect(service.deleteTask).toBeCalledWith(taskStub()._id);
      })

      test('then is should return a task', () => {
        expect(task).toEqual(taskStub());
      })
    })
  })

    /* Test updateTask() */
    describe('updateTask', () =>{
      let result: string;
  
      beforeEach(async () => {
        result = await controller.updateTask(taskStub()._id, 'TODO');
      })
  
      describe('when deleteUser is called', () => {
  
        test('then it should call taskService', () => {
          expect(service.updateTask).toBeCalledWith(taskStub()._id,'TODO');
        })
  
        test('then is should return a task', () => {
          expect(result).toEqual('success');
        })
      })
    })

});