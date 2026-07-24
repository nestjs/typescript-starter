import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import request from 'supertest';
import { App } from 'supertest/types';
import { EventsModule } from '../src/events/events.module';
import { UsersModule } from '../src/users/users.module';
import { Event } from '../src/events/event.entity';
import { User } from '../src/users/user.entity';

// This spins up the real app (real HTTP layer, real TypeORM, real repos)
// against an in-memory sqlite DB, so it's actually exercising the whole
// stack rather than mocks. Per the assignment FAQ ("should do both"), the
// unit tests in events.service.spec.ts cover the logic with mocked repos,
// and this file covers it end-to-end against a real database.
describe('Events (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Event, User],
          synchronize: true,
        }),
        EventsModule,
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  async function createUser(name: string): Promise<User> {
    const res = await request(app.getHttpServer())
      .post('/users')
      .send({ name })
      .expect(201);
    return res.body as User;
  }

  async function createEvent(body: Record<string, unknown>): Promise<Event> {
    const res = await request(app.getHttpServer())
      .post('/events')
      .send(body)
      .expect(201);
    return res.body as Event;
  }

  it('creates an event and then retrieves it by id', async () => {
    const alice = await createUser('alice');

    const created = await createEvent({
      title: 'Standup',
      description: 'daily sync',
      startTime: '2024-01-01T09:00:00.000Z',
      endTime: '2024-01-01T09:30:00.000Z',
      inviteeIds: [alice.id],
    });

    expect(created.title).toBe('Standup');
    expect(created.invitees).toHaveLength(1);

    const getRes = await request(app.getHttpServer())
      .get(`/events/${created.id}`)
      .expect(200);

    expect((getRes.body as Event).title).toBe('Standup');
  });

  it('returns 404 for an event that does not exist', () => {
    return request(app.getHttpServer()).get('/events/999999').expect(404);
  });

  it('rejects creating an event with missing required fields', () => {
    return request(app.getHttpServer())
      .post('/events')
      .send({ description: 'no title or times' })
      .expect(400);
  });

  it('deletes an event', async () => {
    const created = await createEvent({
      title: 'Throwaway',
      startTime: '2024-01-01T09:00:00.000Z',
      endTime: '2024-01-01T09:30:00.000Z',
    });

    await request(app.getHttpServer())
      .delete(`/events/${created.id}`)
      .expect(204);

    await request(app.getHttpServer()).get(`/events/${created.id}`).expect(404);
  });

  it('merges overlapping events for a user end to end', async () => {
    const bob = await createUser('bob');
    const carol = await createUser('carol');

    const e1 = await createEvent({
      title: 'E1',
      startTime: '2024-02-01T14:00:00.000Z',
      endTime: '2024-02-01T15:00:00.000Z',
      inviteeIds: [bob.id],
    });

    const e2 = await createEvent({
      title: 'E2',
      startTime: '2024-02-01T14:45:00.000Z',
      endTime: '2024-02-01T16:00:00.000Z',
      inviteeIds: [bob.id, carol.id],
    });

    // an event bob isn't invited to at all - should be untouched by the merge
    const e3 = await createEvent({
      title: 'E3 not bobs',
      startTime: '2024-02-01T14:30:00.000Z',
      endTime: '2024-02-01T15:30:00.000Z',
      inviteeIds: [carol.id],
    });

    const mergeRes = await request(app.getHttpServer())
      .post(`/events/merge-all/${bob.id}`)
      .expect(201);

    const mergedEvents = mergeRes.body as Event[];
    const merged = mergedEvents.find((e) => e.title === 'E1 + E2');
    expect(merged).toBeDefined();
    expect(merged?.invitees.map((u) => u.id).sort()).toEqual(
      [bob.id, carol.id].sort(),
    );

    // originals should be gone
    await request(app.getHttpServer()).get(`/events/${e1.id}`).expect(404);
    await request(app.getHttpServer()).get(`/events/${e2.id}`).expect(404);

    // e3 should still exist untouched since bob was never invited to it
    await request(app.getHttpServer()).get(`/events/${e3.id}`).expect(200);
  });

  it('returns 404 from merge-all when the user does not exist', () => {
    return request(app.getHttpServer())
      .post('/events/merge-all/999999')
      .expect(404);
  });
});
