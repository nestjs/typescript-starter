import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from '../src/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../src/entities/user.entity';
import { Event } from '../src/entities/event.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';

describe('UsersController (e2e)', () => {
  let app: INestApplication;

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
            entities: [User, Event],
            synchronize: true,
          }),
          inject: [ConfigService],
        }),
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

  });

  it('/POST create user', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'John Doe',
        eventIds: [],
      })
      .expect(201)
      .then((response) => {
        expect(response.body).toHaveProperty('id');
        expect(response.body.name).toEqual('John Doe');
      });
  });

  it('POST /users - fail to create a user with unknown event', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'John Doe',
        eventIds: [999],
      })
      .expect(400)
      .then((response) => {
        expect(response.body).toHaveProperty('statusCode', 400);
        expect(response.body).toHaveProperty('message', 'One or more events do not exist.');
      });
  });
  
  it('/GET find user by ID', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'Jane Doe',
        eventIds: [],
      })
      .expect(201);

    return request(app.getHttpServer())
      .get(`/users`)
      .expect(200)
      .then((response) => {
        const foundUsers = response.body;
        expect(foundUsers).toBeInstanceOf(Array);
        expect(foundUsers[foundUsers.length - 1].name).toEqual('Jane Doe');
      });
  });

  it('/DELETE user', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'John Doe',
        eventIds: []
      })
      .expect(201);

    const userId = response.body.id;
    return request(app.getHttpServer())
      .delete(`/users/${userId}`)
      .expect(200);
  });

  afterAll(async () => {
    await app.close();
  });
});
