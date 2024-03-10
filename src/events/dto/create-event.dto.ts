import { IsDateString, IsEnum, IsOptional, IsArray, IsNotEmpty } from 'class-validator';

export class CreateEventDto {
  @IsNotEmpty()
  readonly title: string;

  @IsOptional()
  readonly description?: string;

  @IsEnum(['TODO', 'IN_PROGRESS', 'COMPLETED'])
  readonly status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';

  @IsDateString()
  readonly startTime: Date;

  @IsDateString()
  readonly endTime: Date;

  @IsArray()
  readonly invitees: number[];
}
