import { IsBoolean, IsString } from 'class-validator';

export class CreateOrderDto {
  @IsBoolean()
  public paymentFinished: boolean;

  @IsString()
  public finishedAt: string;
}
