import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import CartProduct from './cart-product.entity';
import CartsProductsService from './carts-products.service';

@Module({
  imports: [TypeOrmModule.forFeature([CartProduct])],
  providers: [CartsProductsService],
  exports: [CartsProductsService],
})
export class CartsProductsModule {}
