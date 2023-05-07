import { Injectable } from "@nestjs/common/decorators/core/injectable.decorator";
import { PrismaService } from "../prisma/prisma.service";
import { TaskDto, toTaskStatus } from "./dto";
import { ForbiddenException } from "@nestjs/common";

@Injectable({})
export class TaskService{
    constructor(private prisma: PrismaService) {}
    async create(dto: TaskDto) {
        var status_type = toTaskStatus(dto.status)
        
        try {
            const task = await this.prisma.task.create({
                data: {
                    title: dto.title,
                    description: dto.description,
                    status: status_type
                }
            })
            return task
        } catch(error) {
            console.log(error)
        }
    }

    async retrieve(id: string) {
        
        const idAsNumber = parseInt(id, 10);
        // find task by id

        const task = await this.prisma.task.findUnique({
            where: {
                id: idAsNumber,
            }
        })

        // if task does not exist throw exception
        if (!task) throw new ForbiddenException('task not found')
        
        // send back the user
        return task
    }
    
    async delete(id: string) {
        const idAsNumber = parseInt(id, 10);
        try {
            const task = await this.prisma.task.delete({
                where: {
                    id: idAsNumber
                }
            })
            return task
        } catch(error) {
            throw new ForbiddenException('task not found')
        }
    }
}