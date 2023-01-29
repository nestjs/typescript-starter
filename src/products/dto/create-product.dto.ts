import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { productsCategory } from '../product.entity';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  priceInDollars: number;

  @IsEnum(productsCategory)
  @IsOptional()
  category?: productsCategory;
}
