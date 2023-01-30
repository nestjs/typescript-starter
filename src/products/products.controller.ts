import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import ProductsService from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FindOneParams } from '../shared/types/find-one-params';
import { FileInterceptor } from '@nestjs/platform-express';
import 'multer';

@Controller('products')
export default class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  getAllProducts() {
    return this.productsService.getAllProducts();
  }

  @Get(':id')
  getProductById(@Param() { id }: FindOneParams) {
    return this.productsService.getProductById(Number(id));
  }

  @Post()
  async createProduct(@Body() product: CreateProductDto) {
    return this.productsService.createProduct(product);
  }

  @Put(':id')
  async updateProduct(
    @Param('id') id: string,
    @Body() product: UpdateProductDto,
  ) {
    return this.productsService.updateProduct(Number(id), product);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(Number(id));
  }

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async addImage(
    @Body() productId: { productId: number },
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.productsService.addProductImage(
      productId.productId,
      file.buffer,
      file.originalname,
    );
  }
  @Delete('image')
  async deleteImage(productId: number) {
    return this.productsService.deleteProductImage(productId);
  }
}
