import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    const expected = {
      zipcode: '00501',
      city: 'Holtsville',
      state: 'New York',
      stateAbbreviation: 'NY',
      county: 'Suffolk',
      latitude: 40.8154,
      longitude: -73.0451,
    };
    return request(app.getHttpServer())
      .get('/zipcodes/00501')
      .expect(200)
      .expect(JSON.stringify(expected));
  });
});
