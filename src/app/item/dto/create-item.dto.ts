/* eslint-disable prettier/prettier */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateItemDto {
  @ApiProperty({ example: 'Drenagem linfática' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Drenagem ',
    description: 'Massoterapia e drenagem local',
  })
  @IsOptional()
  @IsString()
  description: string;

  @ApiProperty({ example: 5, description: 'Needed quantity' })
  @IsInt()
  @Min(0)
  quantity: number;
}
