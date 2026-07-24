import {
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
} from 'class-validator';
import { EventStatus } from '../event-status.enum';

export class CreateEventDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  // optional on create, defaults to TODO on the entity if not passed
  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;

  @IsDateString()
  startTime: string;

  @IsDateString()
  endTime: string;

  // ids of users to invite, easier than expecting the client to send full
  // user objects
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  inviteeIds?: number[];
}
