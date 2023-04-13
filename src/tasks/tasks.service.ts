/**
 * This service module provides methods for the controller to 
 * fulfill requests. It handles errors and may throw exceptions.
 */

import { Injectable, NotFoundException, HttpException, HttpStatus} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Task } from './task.model';

@Injectable()
export class TasksService{

    constructor(@InjectModel('Task') private readonly taskModel:Model<Task>){}

    /**
     * Add a task to the model with title, status, and description (optional)
     * If title or status are null, it throws bad request exceptions. 
     * If status is not "TODO,COMPLETED,IN_PROGRESS", it throws bad request exceptions.
     * @param title Title
     * @param status Status
     * @param description Description (optional)
     * @returns _id of new task as string
     */
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
            }else{
                throw new HttpException('Unknown isssue', HttpStatus.SERVICE_UNAVAILABLE);
            }
        }
        return result._id as string;
    }

    /**
     * Find task by id and update its status.
     * If id is null or invalid, it throws bad request exceptions.
     * If task is not found, it throws not found exceptions.
     * @param id Id of target task
     * @param status New status
     * @returns task before modification
     */
    async updateTask(id:string,status:string){
        let result;
        if(!id){
            throw new HttpException('Null id',HttpStatus.BAD_REQUEST);
        }
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
            }else{
                throw new HttpException('Unknown isssue', HttpStatus.SERVICE_UNAVAILABLE);
            }
        }
        if(!result){
            throw new NotFoundException('Could not find task.');
        }
        return 'succeed' as string;
    }

    /**
     * Find task by id.
     * If id is null or invalid, it throws bad request exceptions.
     * If task is not found, it throws not found exceptions.
     * @param id Id of target task 
     * @returns target task
     */
    async getTask(id:string): Promise<Task>{
        if(!id){
            throw new HttpException('Null id',HttpStatus.BAD_REQUEST);
        }
        let task;
        try{
            task=await this.taskModel.findById(id).exec();
        }catch(error){
            if(error.name === 'ValidationError'){
                throw new HttpException('Invalid id',HttpStatus.BAD_REQUEST);
            }else{
                throw new HttpException('Unknown isssue', HttpStatus.SERVICE_UNAVAILABLE);
            }
        }
        if(!task){
            throw new NotFoundException('Could not find task.');
        }
        return task as Task;
    }

    /**
     * Find and delete a task by id
     * If id is null or invalid, it throws bad request exceptions.
     * If task is not found, it throws not found exceptions.
     * @param id Id of target task
     * @returns task before deletion
     */
    async deleteTask(id:string): Promise<Task>{
        if(!id){
            throw new HttpException('Null id',HttpStatus.BAD_REQUEST);
        }
        let task;
        try{
            task=await this.taskModel.findByIdAndDelete(id).exec()
        }catch(error){
            if(error.name === 'ValidationError'){
                throw new HttpException('Invalid id',HttpStatus.BAD_REQUEST);
            }else{
                throw new HttpException('Unknown isssue', HttpStatus.SERVICE_UNAVAILABLE);
            }
        }
        if(!task){
            throw new NotFoundException('Could not find task.');
        }
        return task as Task;
    }
}
