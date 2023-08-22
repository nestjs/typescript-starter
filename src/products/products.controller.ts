import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { taskStatusEnum } from './products.model';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  addProduct(
    @Body('title') prodTitle: string,
    @Body('description') prodDesc: string,
    @Body('status') prodStatus: taskStatusEnum,
  ) {
    const generatedID = this.productsService.insertProduct(
      prodTitle,
      prodDesc,
      prodStatus,
    );
    return { id: generatedID };
  }

  @Get()
  getAllProducts() {
    return this.productsService.getProducts();
  }

  @Get(':id')
  getProduct(@Param('id') prodID: string) {
    return this.productsService.getSingleProduct(prodID);
  }

  @Delete(':id')
  removeProduct(@Param('id') prodID: string) {
    return this.productsService.deleteProduct(prodID);
  }
}
