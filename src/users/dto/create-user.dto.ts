import { IsString, IsArray } from 'class-validator';

export class CreateUserDto {
    @IsString()
    name: string;
}
