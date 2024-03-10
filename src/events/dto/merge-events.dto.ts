import { IsNotEmpty } from 'class-validator';

export class MergeEventsDto {
  @IsNotEmpty()
  userId: number;
}
