import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('ProductsController', () => {
  let app: TestingModule;
  let service: ProductsService;

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [ProductsService],
    }).compile();

    service = app.get<ProductsService>(ProductsService);
  });

  describe('getAllProducts', () => {
    it('should return Empty "[]"', () => {
      const appController = app.get(ProductsController);
      expect(appController.getAllProducts()).toStrictEqual([]);
    });
  });

  describe('createProduct', () => {
    it('should create 1 product', () => {
      service.products = [];

      // Act
      service.insertProduct('title', 'description', 'TODO');
      expect(service.products).toHaveLength(1);
    });
  });

  describe('getAllProducts', () => {
    it('should return 1 added task', () => {
      const appController = app.get(ProductsController);
      expect(appController.getAllProducts()).toHaveLength(1);
    });
  });

  describe('createProduct', () => {
    it('should NOT create invalid Status', () => {
      // Act
      expect(() =>
        service.insertProduct('title', 'description', 'INVALID_STATUS'),
      ).toThrow(TypeError);
    });
  });

  describe('getProduct', () => {
    it('should find valid ID', () => {
      const firstID = service.products[0].id;
      const firstItemTitle = service.products[0].title;

      const appController = app.get(ProductsController);
      expect(appController.getProduct(firstID).title).toBe(firstItemTitle);
    });
  });

  describe('getProduct', () => {
    // Pick first item's ID
    it('should NOT find invalid ID', () => {
      const appController = app.get(ProductsController);
      expect(() => appController.getProduct('randomID')).toThrowError();
    });
  });

  describe('deleteProduct', () => {
    it('should NOT find to Delete invalid Id', () => {
      const appController = app.get(ProductsController);
      expect(() => appController.removeProduct('randomID')).toThrowError();
    });
  });

  describe('deleteProduct', () => {
    it('should Delete Task, Returning Empty []', () => {
      const firstID = service.products[0].id;
      const appController = app.get(ProductsController);
      // Action
      appController.removeProduct(firstID);
      // Check for item in the list
      expect(() => appController.getProduct('randomID')).toThrowError();
      // Check length of list
      expect(appController.getAllProducts()).toHaveLength(0);
    });
  });
});
