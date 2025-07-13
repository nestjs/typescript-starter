import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event';
import { User } from '../user/user';
import { EventModule } from './event.module';

describe('EventController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [Event, User],
          synchronize: true,
        }),
        EventModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/POST events', async () => {
    const response = await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Test Event',
        status: 'TODO',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        invitees: [],
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('Test Event');
  });

  it('/GET events should return list with at least 1 event', async () => {
    const response = await request(app.getHttpServer()).get('/events');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it('/GET events/:id should return the event', async () => {
    const created = await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Second Event',
        status: 'IN_PROGRESS',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        invitees: [],
      });

    const response = await request(app.getHttpServer()).get(`/events/${created.body.id}`);
    expect(response.status).toBe(200);
    expect(response.body.title).toBe('Second Event');
  });
});
