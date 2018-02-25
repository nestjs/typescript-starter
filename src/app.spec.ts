import 'jest';
import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('App tests', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      controllers: [ AppController ]
    }).compile();
    controller = module.get<AppController>(AppController);
  });

  it('should say hello world', async () => {
    expect(controller.root()).toBe('Hello World!');
  });
});