import { Module } from '@nestjs/common';
import ProductsController from './products.controller';
import ProductsService from './products.service';
import Product from './product.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FilesModule } from '../files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), FilesModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
