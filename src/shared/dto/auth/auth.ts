import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

class SignupDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  public password: string;
}

class SigninDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @MinLength(6)
  @IsNotEmpty()
  public password: string;
}

export { SignupDto, SigninDto };
