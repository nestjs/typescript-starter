import { IsNotEmpty, IsString, IsArray, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  readonly name: string;

  @IsArray()
  @IsOptional()
  readonly eventIds?: number[];
}
