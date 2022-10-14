//import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty } from 'class-validator';
//import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto /* extends PartialType(CreateUserDto) */ {
  @IsNotEmpty()
  firstName: string;

  @IsNotEmpty()
  lastName: string;
}
