import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventsModule } from '../src/events/events.module';
import { Event } from '../src/entities/event.entity';
import { User } from '../src/entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';


describe('EventsModule (e2e)', () => {
  let app: INestApplication;
  let userRepository: Repository<User>;
  let eventRepository: Repository<Event>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true
        }),
        TypeOrmModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            type: configService.get<any>('DB_TYPE'),
            host: configService.get<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_DEV_NAME'),
            entities: [Event, User],
            synchronize: true,
          }),
          inject: [ConfigService],
        }),
        EventsModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    userRepository = moduleFixture.get('UserRepository');
    eventRepository = moduleFixture.get('EventRepository');
  });

  it('/POST create event', () => {
    return request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Integration Test Event',
        description: 'This is a test event from Jest.',
        status: 'TODO',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        invitees: [],
      })
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty('id');
        expect(response.body.title).toBe('Integration Test Event');
      });
  });

  it('/GET find event', async () => {
    const event = await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Find Test Event',
        description: 'This event is for finding.',
        status: 'TODO',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        invitees: [],
      })
      .expect(201)
      .then((response) => response.body);

    return request(app.getHttpServer())
      .get(`/events/${event.id}`)
      .expect(200)
      .then((response) => {
        expect(response.body.id).toEqual(event.id);
        expect(response.body.title).toEqual('Find Test Event');
      });
  });

  it('/DELETE event', async () => {
    const event = await request(app.getHttpServer())
      .post('/events')
      .send({
        title: 'Delete Test Event',
        description: 'This event will be deleted.',
        status: 'TODO',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        invitees: [],
      })
      .expect(201)
      .then((response) => response.body);

    return request(app.getHttpServer())
      .delete(`/events/${event.id}`)
      .expect(200);
  });

  it('should merge overlapping events', async () => {
    const user = await userRepository.save({ name: 'Test User', events: [] });

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);
    await eventRepository.save([
      { title: 'Event 1', startTime, endTime, invitees: [user] },
      { title: 'Event 2', startTime: new Date(startTime.getTime() + 30 * 60 * 1000), endTime: new Date(endTime.getTime() + 90 * 60 * 1000), invitees: [user] },
    ]);


    const response = await request(app.getHttpServer())
      .post('/events/merge')
      .send({ userId: user.id })
      .expect(201);

    expect(response.body).toHaveLength(1);

    const mergedEvent = response.body[0]
    expect(mergedEvent.title).toEqual('Event 1 / Event 2');

    await eventRepository.delete({ id: mergedEvent.id });
    await userRepository.delete({ id: user.id });
  });


  afterAll(async () => {
    await app.close();
  });
});