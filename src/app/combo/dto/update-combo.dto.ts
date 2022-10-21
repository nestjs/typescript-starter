import { IsNotEmpty } from 'class-validator';

export class UpdateCombo {
  @IsNotEmpty()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  description: string;

  @IsNotEmpty()
  cost: number;

  //@IsNotEmpty()
  //picture: any;

  @IsNotEmpty()
  installment: number;

  @IsNotEmpty()
  pack: string;
}
