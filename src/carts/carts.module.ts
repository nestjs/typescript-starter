import { Module } from '@nestjs/common';
import CartsController from './carts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import CartsService from './carts.service';
import Cart from './cart.entity';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';
import { CartsProductsModule } from '../carts-products/carts-products.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart]),
    ProductsModule,
    OrdersModule,
    CartsModule,
    CartsProductsModule,
  ],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
