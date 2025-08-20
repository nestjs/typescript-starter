import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: 'The name of the user',
    example: 'John Doe',
    minLength: 1,
  })
  name: string;

  @ApiProperty({
    description: 'The email address of the user',
    example: 'john.doe@example.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'Whether the user has admin privileges',
    example: false,
    default: false,
    required: false,
  })
  isAdmin?: boolean;
}
