import { Module } from '@nestjs/common';
import CartsController from './carts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import CartsService from './carts.service';
import Cart from './cart.entity';
import { ProductsModule } from "../products/products.module";

@Module({
  imports: [TypeOrmModule.forFeature([Cart]), ProductsModule],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
