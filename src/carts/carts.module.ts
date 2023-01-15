import { Module } from '@nestjs/common';
import CartsController from './carts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import CartsService from './carts.service';
import Cart from './cart.entity';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [TypeOrmModule.forFeature([Cart]), ProductsModule, OrdersModule],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
