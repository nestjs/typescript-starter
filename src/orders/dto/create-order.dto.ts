import { IsEnum } from 'class-validator';
import { transactionStatus } from '../order.entity';

export class CreateOrderDto {
  @IsEnum(transactionStatus)
  public paymentFinished: transactionStatus;
}
