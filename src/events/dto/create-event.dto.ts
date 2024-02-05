import { IsDateString, IsEnum, IsOptional, IsString, ValidateNested, IsArray, IsNumber } from 'class-validator';
import { Type } from 'class-transformer'; 

// Dto for users
export class CreateUserDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsOptional()
  name?: string;
}

// Dto for events
export class CreateEventDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  // Validate the invitees in the given invitees array
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateUserDto)
  invitees: CreateUserDto[];
}