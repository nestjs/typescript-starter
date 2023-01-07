import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import {CreateProductDto} from './dto/createProduct.dto';
import {UpdateProductDto} from './dto/updateproduct.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {Product} from './product.interface'
import ProductEntity from './product.entity'

@Injectable()
export default class productsService {

    constructor(
        @InjectRepository(ProductEntity)
        private productsRepository: Repository<ProductEntity>
    ) {}

    getAllProducts() {
        return this.productsRepository.find();
    }

    async getProductById(id: number) {
        const product = await this.productsRepository.findOne({where: {id}});
        if (product) {
            return product;
        }
        throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    async updateProduct(id: number, post: UpdateProductDto) {
        await this.productsRepository.update(id, post);
        const updatedProduct = await this.productsRepository.findOne({where: {id}});
        if (updatedProduct) {
            return updatedProduct
        }
        throw new HttpException('Post not found', HttpStatus.NOT_FOUND);
    }

    async createProduct(product: CreateProductDto) {
        const newProduct = await this.productsRepository.create(product);
        await this.productsRepository.save(newProduct);
        return newProduct;
    }


    async deleteProduct(id: number) {
        const deleteResponse = await this.productsRepository.delete(id);
        if (!deleteResponse.affected) {
            throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
        }
    }
}