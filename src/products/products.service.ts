import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import Product from './product.entity';
import { ProductNotFoundException } from './exception/product-not-found.exception';
import { FilesService } from '../files/files.service';

@Injectable()
export default class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    private readonly filesService: FilesService,
  ) {}

  getAllProducts() {
    return this.productsRepository.find();
  }

  async getProductsByIds(productsIds: number[]) {
    return this.productsRepository.find({ where: { id: In(productsIds) } });
  }
  async getProductById(id: number) {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (product) {
      return product;
    }
    throw new ProductNotFoundException(id);
  }

  async addProductImage(
    productId: number,
    imageBuffer: Buffer,
    filename: string,
  ) {
    const image = await this.filesService.uploadPublicFile(
      imageBuffer,
      filename,
    );
    const product = await this.getProductById(productId);
    await this.productsRepository.update(productId, {
      ...product,
      image,
    });
    return image;
  }

  async deleteProductImage(productId: number) {
    const product = await this.getProductById(productId);
    const fileId = product.image?.id;
    if (fileId) {
      await this.productsRepository.update(productId, {
        ...product,
        image: null,
      });
      await this.filesService.deletePublicFile(fileId);
    }
  }

  async updateProduct(id: number, product: UpdateProductDto) {
    await this.productsRepository.update(id, product);
    const updatedProduct = await this.productsRepository.findOne({
      where: { id },
    });
    if (updatedProduct) {
      return updatedProduct;
    }
    throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
  }

  async createProduct(product: CreateProductDto) {
    const newProduct = await this.productsRepository.create(product);
    return this.productsRepository.save(newProduct);
  }

  async deleteProduct(id: number) {
    const deleteResponse = await this.productsRepository.softDelete(id);
    if (!deleteResponse.affected) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
  }
}
