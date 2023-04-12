import { Injectable, NotFoundException, HttpException, HttpStatus} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Task } from './task.model';

@Injectable()
export class TasksService{

    constructor(@InjectModel('Task') private readonly taskModel:Model<Task>){}

    async insertTask(title:string,status:string,description:string){
        let result;
        try{
            const newTask=new this.taskModel({
                title:title,
                description:description,
                status:status
            });
            result=await newTask.save();
        }catch(error){
            if(!title){
                throw new HttpException('Null title',HttpStatus.BAD_REQUEST);
            }else if(!status){
                throw new HttpException('Null status',HttpStatus.BAD_REQUEST);
            }else if(error.name === 'ValidationError'){
                throw new HttpException('Invalid status',HttpStatus.BAD_REQUEST);
            }
        }
        return result._id as string;
    }

    async updateTask(id:string,status:string){
        let result;
        try{
            result=await this.taskModel.findByIdAndUpdate(
                id,
                {
                    status: status, 
                    updatedAt: Date.now()
                },
                {runValidators: true}
                ).exec();
        }catch(error){
            if(error.name === 'ValidationError'){
                throw new HttpException('Invalid status',HttpStatus.BAD_REQUEST);
            }
        }
        if(!result){
            throw new NotFoundException('Could not find task.');
        }
        return 'succeed' as string;
    }

    async getTask(id:string): Promise<Task>{
        const task=await this.taskModel.findById(id).exec().catch(()=>{
            throw new HttpException('Invalid id',HttpStatus.BAD_REQUEST);
        });
        if(!task){
            throw new NotFoundException('Could not find task.');
        }
        return task as Task;
    }

    async deleteTask(id:string){
        const result=await this.taskModel.findByIdAndDelete(id).exec().catch(()=>{
            throw new HttpException('Invalid id',HttpStatus.BAD_REQUEST);
        });
        return result;
    }
}
