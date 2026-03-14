import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { DataSource } from 'typeorm';

describe('Users and Events APIs (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  beforeAll(async () => {
    process.env.DB_PATH = 'test.sqlite';
    const { AppModule } = require('../src/app.module');

    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    await app.init();

    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.synchronize(true);
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates users, creates an event with invitees, fetches it, and deletes it', async () => {
    const firstUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Alice' })
      .expect(201);

    const secondUserResponse = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Bob' })
      .expect(201);

    expect(firstUserResponse.body).toMatchObject({
      id: expect.any(Number),
      name: 'Alice',
    });
    expect(secondUserResponse.body).toMatchObject({
      id: expect.any(Number),
      name: 'Bob',
    });

    const createEventResponse = await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Planning',
        description: 'Sprint planning',
        status: 'TODO',
        startTime: '2026-03-13T14:00:00.000Z',
        endTime: '2026-03-13T15:00:00.000Z',
        inviteeIds: [firstUserResponse.body.id, secondUserResponse.body.id],
      })
      .expect(201);

    expect(createEventResponse.body).toMatchObject({
      id: expect.any(Number),
      title: 'Planning',
      description: 'Sprint planning',
      status: 'TODO',
      invitees: [
        { id: firstUserResponse.body.id, name: 'Alice' },
        { id: secondUserResponse.body.id, name: 'Bob' },
      ],
    });
    expect(createEventResponse.body.createdAt).toEqual(expect.any(String));
    expect(createEventResponse.body.updatedAt).toEqual(expect.any(String));

    const eventId = createEventResponse.body.id;

    const getEventResponse = await request(app.getHttpServer())
      .get(`/events/${eventId}`)
      .expect(200);

    expect(getEventResponse.body).toMatchObject({
      id: eventId,
      title: 'Planning',
      description: 'Sprint planning',
      status: 'TODO',
      invitees: [
        { id: firstUserResponse.body.id, name: 'Alice' },
        { id: secondUserResponse.body.id, name: 'Bob' },
      ],
    });

    await request(app.getHttpServer()).delete(`/events/${eventId}`).expect(204);

    await request(app.getHttpServer()).get(`/events/${eventId}`).expect(404);
  });

  it('returns 404 when deleting a missing event', async () => {
    await request(app.getHttpServer()).delete('/events/999').expect(404);
  });

  it('rejects creating an event when an invitee does not exist', async () => {
    await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Planning',
        status: 'TODO',
        startTime: '2026-03-13T14:00:00.000Z',
        endTime: '2026-03-13T15:00:00.000Z',
        inviteeIds: [999],
      })
      .expect(404);
  });

  it('rejects creating an event when startTime is not earlier than endTime', async () => {
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Alice' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Invalid Event',
        description: 'Bad time',
        status: 'TODO',
        startTime: '2026-03-13T16:00:00.000Z',
        endTime: '2026-03-13T14:00:00.000Z',
        inviteeIds: [userResponse.body.id],
      })
      .expect(400);
  });

  it('validates user creation payloads', async () => {
    await request(app.getHttpServer())
      .post('/users')
      .send({ name: '' })
      .expect(400);
  });

  it('does not change events when no overlap exists', async () => {
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Alice' })
      .expect(201);

    const firstEventResponse = await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Morning',
        status: 'TODO',
        startTime: '2026-03-13T10:00:00.000Z',
        endTime: '2026-03-13T11:00:00.000Z',
        inviteeIds: [userResponse.body.id],
      })
      .expect(201);

    const secondEventResponse = await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Afternoon',
        status: 'COMPLETED',
        startTime: '2026-03-13T11:00:00.000Z',
        endTime: '2026-03-13T12:00:00.000Z',
        inviteeIds: [userResponse.body.id],
      })
      .expect(201);

    const mergeResponse = await request(app.getHttpServer())
      .post(`/users/${userResponse.body.id}/events/merge-all`)
      .expect(200);

    expect(mergeResponse.body).toHaveLength(2);
    expect(mergeResponse.body.map((event: { id: number }) => event.id)).toEqual([
      firstEventResponse.body.id,
      secondEventResponse.body.id,
    ]);
  });

  it('merges two overlapping events and unions invitees', async () => {
    const alice = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Alice' })
      .expect(201);
    const bob = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Bob' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Design',
        description: 'Discuss UI',
        status: 'TODO',
        startTime: '2026-03-13T14:00:00.000Z',
        endTime: '2026-03-13T15:00:00.000Z',
        inviteeIds: [alice.body.id],
      })
      .expect(201);

    await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Build',
        description: 'Implement API',
        status: 'IN_PROGRESS',
        startTime: '2026-03-13T14:30:00.000Z',
        endTime: '2026-03-13T16:00:00.000Z',
        inviteeIds: [alice.body.id, bob.body.id],
      })
      .expect(201);

    const mergeResponse = await request(app.getHttpServer())
      .post(`/users/${alice.body.id}/events/merge-all`)
      .expect(200);

    expect(mergeResponse.body).toHaveLength(1);
    expect(mergeResponse.body[0]).toMatchObject({
      title: 'Design | Build',
      description: 'Discuss UI\nImplement API',
      status: 'IN_PROGRESS',
      startTime: '2026-03-13T14:00:00.000Z',
      endTime: '2026-03-13T16:00:00.000Z',
      invitees: [
        { id: alice.body.id, name: 'Alice' },
        { id: bob.body.id, name: 'Bob' },
      ],
    });
  });

  it('merges a continuous overlap chain into one event', async () => {
    const alice = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Alice' })
      .expect(201);
    const bob = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Bob' })
      .expect(201);
    const carol = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Carol' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'A',
        description: 'Alpha',
        status: 'COMPLETED',
        startTime: '2026-03-13T09:00:00.000Z',
        endTime: '2026-03-13T10:00:00.000Z',
        inviteeIds: [alice.body.id, bob.body.id],
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'B',
        description: 'Beta',
        status: 'TODO',
        startTime: '2026-03-13T09:30:00.000Z',
        endTime: '2026-03-13T10:30:00.000Z',
        inviteeIds: [alice.body.id, carol.body.id],
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'C',
        description: 'Gamma',
        status: 'IN_PROGRESS',
        startTime: '2026-03-13T10:15:00.000Z',
        endTime: '2026-03-13T11:00:00.000Z',
        inviteeIds: [alice.body.id, bob.body.id, carol.body.id],
      })
      .expect(201);

    const mergeResponse = await request(app.getHttpServer())
      .post(`/users/${alice.body.id}/events/merge-all`)
      .expect(200);

    expect(mergeResponse.body).toHaveLength(1);
    expect(mergeResponse.body[0]).toMatchObject({
      title: 'A | B | C',
      description: 'Alpha\nBeta\nGamma',
      status: 'IN_PROGRESS',
      startTime: '2026-03-13T09:00:00.000Z',
      endTime: '2026-03-13T11:00:00.000Z',
    });
    expect(mergeResponse.body[0].invitees).toHaveLength(3);
  });

  it('does not merge adjacent events that only touch at the boundary', async () => {
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Alice' })
      .expect(201);

    const firstEventResponse = await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'First',
        status: 'TODO',
        startTime: '2026-03-13T14:00:00.000Z',
        endTime: '2026-03-13T15:00:00.000Z',
        inviteeIds: [userResponse.body.id],
      })
      .expect(201);
    const secondEventResponse = await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Second',
        status: 'IN_PROGRESS',
        startTime: '2026-03-13T15:00:00.000Z',
        endTime: '2026-03-13T16:00:00.000Z',
        inviteeIds: [userResponse.body.id],
      })
      .expect(201);

    const mergeResponse = await request(app.getHttpServer())
      .post(`/users/${userResponse.body.id}/events/merge-all`)
      .expect(200);

    expect(mergeResponse.body).toHaveLength(2);
    expect(mergeResponse.body.map((event: { id: number }) => event.id)).toEqual([
      firstEventResponse.body.id,
      secondEventResponse.body.id,
    ]);
  });

  it('returns 404 when merging events for a missing user', async () => {
    await request(app.getHttpServer())
      .post('/users/999/events/merge-all')
      .expect(404);
  });

  it('returns an empty array when a user has no events', async () => {
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'No Events User' })
      .expect(201);

    const mergeResponse = await request(app.getHttpServer())
      .post(`/users/${userResponse.body.id}/events/merge-all`)
      .expect(200);

    expect(mergeResponse.body).toEqual([]);
  });

  it('merges multiple independent overlap groups separately', async () => {
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Alice' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'A',
        status: 'TODO',
        startTime: '2026-03-13T10:00:00.000Z',
        endTime: '2026-03-13T11:00:00.000Z',
        inviteeIds: [userResponse.body.id],
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'B',
        status: 'IN_PROGRESS',
        startTime: '2026-03-13T10:30:00.000Z',
        endTime: '2026-03-13T12:00:00.000Z',
        inviteeIds: [userResponse.body.id],
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'C',
        status: 'COMPLETED',
        startTime: '2026-03-13T14:00:00.000Z',
        endTime: '2026-03-13T15:00:00.000Z',
        inviteeIds: [userResponse.body.id],
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'D',
        status: 'TODO',
        startTime: '2026-03-13T14:30:00.000Z',
        endTime: '2026-03-13T16:00:00.000Z',
        inviteeIds: [userResponse.body.id],
      })
      .expect(201);

    const mergeResponse = await request(app.getHttpServer())
      .post(`/users/${userResponse.body.id}/events/merge-all`)
      .expect(200);

    expect(mergeResponse.body).toHaveLength(2);
    expect(mergeResponse.body).toMatchObject([
      {
        title: 'A | B',
        status: 'IN_PROGRESS',
        startTime: '2026-03-13T10:00:00.000Z',
        endTime: '2026-03-13T12:00:00.000Z',
      },
      {
        title: 'C | D',
        status: 'TODO',
        startTime: '2026-03-13T14:00:00.000Z',
        endTime: '2026-03-13T16:00:00.000Z',
      },
    ]);
  });

  it('deduplicates repeated titles when merging', async () => {
    const userResponse = await request(app.getHttpServer())
      .post('/users')
      .send({ name: 'Alice' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Meeting',
        description: 'Alpha',
        status: 'TODO',
        startTime: '2026-03-13T10:00:00.000Z',
        endTime: '2026-03-13T11:00:00.000Z',
        inviteeIds: [userResponse.body.id],
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Meeting',
        description: 'Beta',
        status: 'IN_PROGRESS',
        startTime: '2026-03-13T10:30:00.000Z',
        endTime: '2026-03-13T11:30:00.000Z',
        inviteeIds: [userResponse.body.id],
      })
      .expect(201);
    await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Review',
        description: 'Gamma',
        status: 'COMPLETED',
        startTime: '2026-03-13T10:45:00.000Z',
        endTime: '2026-03-13T12:00:00.000Z',
        inviteeIds: [userResponse.body.id],
      })
      .expect(201);

    const mergeResponse = await request(app.getHttpServer())
      .post(`/users/${userResponse.body.id}/events/merge-all`)
      .expect(200);

    expect(mergeResponse.body).toHaveLength(1);
    expect(mergeResponse.body[0]).toMatchObject({
      title: 'Meeting | Review',
      description: 'Alpha\nBeta\nGamma',
      status: 'IN_PROGRESS',
      startTime: '2026-03-13T10:00:00.000Z',
      endTime: '2026-03-13T12:00:00.000Z',
    });
  });
});
