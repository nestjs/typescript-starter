import { ApiProperty } from '@nestjs/swagger';

export class CatDto {
  @ApiProperty({
    description: 'The name of the cat',
    example: 'Whiskers',
  })
  name: string;

  @ApiProperty({
    description: 'The age of the cat in years',
    example: 3,
    minimum: 0,
  })
  age: number;

  @ApiProperty({
    description: 'Whether the cat is a purebred',
    example: true,
  })
  breed: boolean;
}
