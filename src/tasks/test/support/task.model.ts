import { promises } from 'dns';
import {taskStub} from '../stubs/task.stub'
import { Task } from 'src/tasks/task.model'

export class TaskModel {
  
  protected entityStub=taskStub();

  constructor(createEntityData: Task) {
    this.constructorSpy(createEntityData);
  }

  constructorSpy(_createEntityData: Task): void {}

  async save(): Promise<Task> {
    return this.entityStub;
  }


  findById(): { exec: () => Task } {
    return {
      exec: (): Task => this.entityStub
    }
  }

  findByIdAndDelete(): { exec: () => Task } {
    return {
      exec: (): Task => this.entityStub
    }
  }

  findByIdAndUpdate(): { exec: () => Task } {
    return {
      exec: (): Task => this.entityStub
    }
  }
}