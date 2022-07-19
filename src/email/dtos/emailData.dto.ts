import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';

export default class EmailData {
  @IsNotEmpty()
  @IsEmail()
  to: string;

  @IsNotEmpty()
  subject: string;

  @IsNotEmpty({ message: 'Template not provided' })
  template?: string;

  @IsOptional()
  templateVars?: any;
}
