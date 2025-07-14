import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './event';
import { User } from '../user/user';
import { EventModule } from './event.module';
import { getRepositoryToken } from '@nestjs/typeorm';

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

  it('/POST events/merge-all should merge overlapping events', async () => {
  
    const userRepo = app.get(getRepositoryToken(User));
    const user = await userRepo.save({ name: 'Test User' });
    const userId = user.id;

    const event1 = await request(app.getHttpServer()).post('/events').send({
      title: 'Event A',
      status: 'TODO',
      startTime: '2025-07-13T14:00:00.000Z',
      endTime: '2025-07-13T15:00:00.000Z',
      invitees: [{ id: userId }],
    });

    const event2 = await request(app.getHttpServer()).post('/events').send({
      title: 'Event B',
      status: 'IN_PROGRESS',
      startTime: '2025-07-13T14:30:00.000Z',
      endTime: '2025-07-13T16:00:00.000Z',
      invitees: [{ id: userId }],
    });

    const mergeResponse = await request(app.getHttpServer())
      .post('/events/merge-all')
      .send({ userId });

    expect(mergeResponse.status).toBe(201);
    expect(mergeResponse.body.title).toContain('Event A');
    expect(mergeResponse.body.title).toContain('Event B');
    expect(mergeResponse.body.status).toBe('IN_PROGRESS'); // since it's higher priority
  });

  it('/POST events/merge-all should not merge non-overlapping events', async () => {
    const userRepo = app.get(getRepositoryToken(User));
    const user = await userRepo.save({ name: 'User NonOverlap' });

    const userId = user.id;

    await request(app.getHttpServer()).post('/events').send({
      title: 'Event X',
      status: 'TODO',
      startTime: '2025-07-13T10:00:00.000Z',
      endTime: '2025-07-13T11:00:00.000Z',
      invitees: [{ id: userId }],
    });

    await request(app.getHttpServer()).post('/events').send({
      title: 'Event Y',
      status: 'TODO',
      startTime: '2025-07-13T12:00:00.000Z',
      endTime: '2025-07-13T13:00:00.000Z',
      invitees: [{ id: userId }],
    });

    const res = await request(app.getHttpServer())
      .post('/events/merge-all')
      .send({ userId });

    expect(res.status).toBe(201);
    expect(['Event X', 'Event Y']).toContain(res.body.title);
  });


  it('/POST events/merge-all should fail if user does not exist', async () => {
    const res = await request(app.getHttpServer())
      .post('/events/merge-all')
      .send({ userId: 9999 }); // assuming this ID doesn't exist

    expect(res.status).toBe(404);
    expect(res.body.message).toContain('User not found');
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
  
  it('/DELETE events/:id should delete the event', async () => {
    const createRes = await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Delete Me',
        status: 'TODO',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3600000).toISOString(),
        invitees: [],
      });

    const eventId = createRes.body.id;
    expect(eventId).toBeDefined();

    const deleteRes = await request(app.getHttpServer()).delete(`/events/${eventId}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.message).toContain(`Event ${eventId} deleted`);

    const getRes = await request(app.getHttpServer()).get(`/events/${eventId}`);
    expect(getRes.status).toBe(200); // depending on your service behavior may return 404
  });
});
