import { getModelToken } from "@nestjs/mongoose"
import { Test } from "@nestjs/testing"
import { TasksService } from '../tasks.service';
import { taskStub } from "./stubs/task.stub";
import { TaskModel } from './support/task.model';
import { Task } from '../task.model'

describe('TasksService', () => {
    let tasksService: TasksService;
    let taskModel: TaskModel;

    it('should be defined', ()=>{
        expect(tasksService).toBeDefined();
    })

    describe('insertTask', () =>{

        describe('when insertTask is called', ()=>{
            let id: string;
            let saveSpy: jest.SpyInstance;
            let constructorSpy: jest.SpyInstance;
            const task=taskStub();

            beforeEach(async () => {
                const moduleRef = await Test.createTestingModule({
                  providers: [
                    TasksService,
                    {
                      provide: getModelToken(Task.name),
                      useClass: TaskModel
                    }
                  ]
                }).compile();
        
                tasksService = moduleRef.get<TasksService>(TasksService);
                taskModel = moduleRef.get<TaskModel>(getModelToken(Task.name));

                saveSpy = jest.spyOn(TaskModel.prototype, 'save');
                constructorSpy = jest.spyOn(TaskModel.prototype, 'constructorSpy');
                id=await tasksService.insertTask(task.title,task.status,task.description);

                jest.clearAllMocks();
            })

            test('then it should call  the taskModel', () => {
                expect(saveSpy).toHaveBeenCalled();
                expect(constructorSpy).toHaveBeenCalledWith(taskStub());
            })

            test('then it should return an id', () =>{
                expect(id).toEqual(taskStub()._id);
            })
        })

    })

    describe('getTaskById',()=>{

        describe('when getTask is called', () => {
            let task: Task;
    
            beforeEach(async () => {
                const moduleRef = await Test.createTestingModule({
                    providers: [
                      TasksService,
                      {
                        provide: getModelToken(Task.name),
                        useClass: TaskModel
                      }
                    ]
                  }).compile();
          
                tasksService = moduleRef.get<TasksService>(TasksService);
                taskModel = moduleRef.get<TaskModel>(getModelToken(Task.name));

                jest.spyOn(taskModel, 'findById');
                task = await tasksService.getTask(taskStub()._id);
            })
    
            test('then it should call the taskModel', () => {
              expect(taskModel.findById).toHaveBeenCalledWith(taskStub()._id);
            })
    
            test('then it should return a task', () => {
              expect(task).toEqual(taskStub());
            })
          })
    })

    describe('deleteTaskById',()=>{

        describe('when deleteTask is called', () => {
            let task: Task;
    
            beforeEach(async () => {

                const moduleRef = await Test.createTestingModule({
                    providers: [
                      TasksService,
                      {
                        provide: getModelToken(Task.name),
                        useClass: TaskModel
                      }
                    ]
                  }).compile();
          
                tasksService = moduleRef.get<TasksService>(TasksService);
                taskModel = moduleRef.get<TaskModel>(getModelToken(Task.name));

                jest.spyOn(taskModel, 'findByIdAndDelete');
                task = await tasksService.deleteTask(taskStub()._id);
            })
    
            test('then it should call the taskModel', () => {
              expect(taskModel.findByIdAndDelete).toHaveBeenCalledWith(taskStub()._id);
            })
    
            test('then it should return a task', () => {
              expect(task).toEqual(taskStub());
            })
          })
    })

})