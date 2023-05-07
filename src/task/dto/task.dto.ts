import { IsString, IsNotEmpty, IsOptional } from "class-validator"
import { statusType } from '@prisma/client' 

export class TaskDto {
    @IsString()
    @IsNotEmpty()
    title: string

    @IsOptional()
    @IsString()
    description: string
    
    @IsNotEmpty()
    @IsString()
    status: string
}   

export function toTaskStatus(status: string): statusType | undefined {
    // console.log(status as keyof typeof statusType, statusType.IN_PROGRESS)
    console.log(status == "TODO")
    if (status == "TODO") {
        return statusType.TODO
    } else if (status == "IN_PROGRESS") {
        return statusType.IN_PROGRESS
    } else if (status == "COMPLETED") {
        return statusType.COMPLETED
    } else {
        return undefined
    }
}
