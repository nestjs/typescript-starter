import express from 'express';
import request from 'supertest';
import { Test } from '@nestjs/testing';
import { ApplicationModule } from './app.module';

describe('Basic E2E Test', () => {
  const server = express();

  beforeAll(async () => {
    const module = await Test.createTestingModule({
            modules: [ApplicationModule]
          })
          .compile();

    const app = module.createNestApplication(server);
    await app.init();
  });

  it('/GET /', () => {
    return request(server)
            .get('/')
            .expect(200)
            .expect('Hello World!');
  });
});
