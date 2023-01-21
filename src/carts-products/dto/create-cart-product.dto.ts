import { IsNumber } from 'class-validator';

export class CreateCartProductDto {
  @IsNumber()
  cartId: number;

  @IsNumber()
  productId: number;

  @IsNumber()
  numberOfProducts: number;
}
