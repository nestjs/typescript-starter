import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from './products.model';
import { taskStatusEnum } from './products.model';

@Injectable()
export class ProductsService {
  // Init empty Products Array
  products: Product[] = [];

  insertProduct(title: string, description: string, status: string) {
    // Generate Random ID Here (Would use a Crypto and Hash Algorithm in real use)
    const prodID = Math.random().toString(26).slice(2);
    const generatedDate = new Date();

    // Process Status (Make sure that Status is Legal in Enum)
    if (!Object.values(taskStatusEnum).includes(status as taskStatusEnum)) {
      // Validation for invalid status
      throw new TypeError(
        'Invalid task status. Status Must Be "TODO", ""COMPLETED" or "IN_PROGRESS"',
      );
    }

    const newProduct: Product = {
      id: prodID,
      title: title,
      status: status as taskStatusEnum,
      createdAt: generatedDate.toString(),
      updatedAt: generatedDate.toString(), // Updated Date Default to Generated Date
      description: description,
    };
    this.products.push(newProduct);

    return prodID;
  }

  getProducts() {
    // Return a NEW list of all products
    return [...this.products];
  }

  getSingleProduct(prodID: string) {
    const product = this.products.find((prod) => prod.id == prodID);
    if (!product) {
      throw new NotFoundException("Couln't find product with ID: " + prodID);
    }
    return { ...product };
  }

  deleteProduct(prodID: string) {
    const productIndex = this.findProduct(prodID)[1];
    this.products.splice(productIndex, 1);
  }

  private findProduct(prodID: string): [Product, number] {
    const productIndex = this.products.findIndex((prod) => prod.id == prodID);
    const product = this.products[productIndex];

    if (!product) {
      throw new NotFoundException("Couln't find product with ID: " + prodID);
    }

    return [product, productIndex];
  }
}
