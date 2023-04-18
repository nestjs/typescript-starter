import { IsNotEmpty, IsOptional, IsEnum, IsString } from 'class-validator';
import { Status } from 'src/enums/status';

// use DTO to check if the data is consistent before inserting into the database
export class CreateTaskDto {
    @IsNotEmpty()
    @IsString()
    title: string;
    @IsOptional()
    @IsString()
    description: string;
    @IsEnum(Status)
    @IsNotEmpty()
    status: string;
}
