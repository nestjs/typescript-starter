import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty({
    example: 'john_doe',
    description: 'The username of the user.',
  })
  @IsString()
  username: string;

  @ApiProperty({
    example: 'Password123!',
    description: 'The password of the user.',
  })
  @IsString()
  password: string;
}
