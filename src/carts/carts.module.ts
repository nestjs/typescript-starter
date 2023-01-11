import { Module } from '@nestjs/common';
import CartsController from './carts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import CartsService from './carts.service';
import Cart from './cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Cart])],
  controllers: [CartsController],
  providers: [CartsService],
})
export class CartsModule {}
