import { IsNotEmpty, IsOptional, ValidateNested } from 'class-validator';

export class Subscriber {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  email: string;
}

export default class SubscribersDto {
  @ValidateNested()
  subscribers: Array<Subscriber>;

  @IsOptional()
  tag?: string;
}
