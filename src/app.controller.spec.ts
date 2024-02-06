import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import { AppModule } from '../src/app.module'; 
import { PrismaService } from './prisma/prisma.service';
import * as request from 'supertest';

describe('EventsService Integration Tests', () => {
  let app: INestApplication;
  let testId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule], 
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  // Test the creation of an event
  it('should create an event', async () => {
    const createEventDto = {
      title: 'Test Event',
      description: 'This is a test event',
      startTime: new Date().toISOString(),
      endTime: new Date(new Date().getTime() + 3600000).toISOString(), 
      invitees: [{ id: 15, name: 'HTC' }],
    };

    const response = await request(app.getHttpServer())
      .post('/events')
      .send(createEventDto);
    
    testId = response.body.id;
    
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toHaveProperty('id');
  });

  // Test the retrive of an event by event ID
  it('should retrieve an event by ID', async () => {
    const response = await request(app.getHttpServer()).get(`/events/${testId}/`); 
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toHaveProperty('title');
  });

  // Test the deletion of an existing event
  it('should delete an event', async () => {
    const deleteResponse = await request(app.getHttpServer()).delete(`/events/${testId}/`); 
    expect(deleteResponse.status).toBe(HttpStatus.OK);
  });

  // Test the merge for a existing user
  it('correctly merges overlapping events while leaving non-overlapping events unaffected', async () => {
    // Step 1: Create a set of test events for a specific user, including overlapping and non-overlapping events

    const createEventDto1 = {
      title: 'Test Event 1',
      description: 'This is a test event',
      startTime: '2024-01-01 09:00:00.000',
      endTime: '2024-05-06 11:00:00.000 ', 
      invitees: [{ id: 100, name: 'Hungta' }],
    };
    const createEventDto2 = {
      title: 'Test Event 2',
      description: 'This is a test event',
      startTime: '2024-03-01 09:00:00.000',
      endTime: '2024-05-30 11:00:00.000 ', 
      invitees: [{ id: 100, name: 'Hungta' }],
    };
    const createEventDto3 = {
      title: 'Test Event 3',
      description: 'This is a test event',
      startTime: '2024-06-01 09:00:00.000',
      endTime: '2024-09-30 11:00:00.000 ', 
      invitees: [{ id: 100, name: 'Hungta' }],
    };

    const r1 = await request(app.getHttpServer()).post('/events').send(createEventDto1);
    const r2 = await request(app.getHttpServer()).post('/events').send(createEventDto2); // Overlapping
    const r3 = await request(app.getHttpServer()).post('/events').send(createEventDto3); // non-overlapping

    // Step 2: Call the merge operation
    const response = await request(app.getHttpServer())
        .post(`/events/merge-all/`)
        .send({
          userId: 100
        });

    // Step 3: Verify the results
    // Verify that event1 and event2 have been merged
    expect(response.body.events[0].title).toContain(createEventDto1.title); 
    expect(response.body.events[0].title).toContain(createEventDto2.title);

    // Verify that event3 remains unchanged
    expect(response.body.events[1].title).toEqual(createEventDto3.title);

    await request(app.getHttpServer()).delete(`/users/100/`); 
    await request(app.getHttpServer()).delete(`/events/${r1.body.id}/`); 
    await request(app.getHttpServer()).delete(`/events/${r2.body.id}/`); 
    await request(app.getHttpServer()).delete(`/events/${r3.body.id}/`); 
  });

  afterAll(async () => {
    const prisma = new PrismaService();
    // await prisma.user.deleteMany({});
    // await prisma.event.deleteMany({});
    await app.close();
  });
});