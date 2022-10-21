import { IsEmail, isNotEmpty, IsNotEmpty, Matches } from 'class-validator';
import { MessagesHelper } from '../../helpers/messages.helper';
import { RegExHelper } from '../../helpers/regex.helper';

export class CreateCombo {
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
