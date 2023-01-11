import { Module } from '@nestjs/common';
import ProductsController from './products.controller';
import ProductsService from './productsService';
import Product from './product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Product])],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
