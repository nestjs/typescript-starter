import { IsNotEmpty } from 'class-validator';

export class UpdateProcedimentDto {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  cust: number;

  @IsNotEmpty()
  price: number;
}
