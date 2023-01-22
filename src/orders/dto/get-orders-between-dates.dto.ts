import { IsDateString } from 'class-validator';

export class GetOrdersBetweenDatesDto {
  @IsDateString()
  public startDate: Date;

  @IsDateString()
  public endDate: Date;
}
