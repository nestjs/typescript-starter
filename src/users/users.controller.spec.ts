import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { UsersModule } from './users.module';
import { EventsModule } from '../events/events.module';
import { User } from './user.entity';
import { Event } from '../events/event.entity';
import { DataSource } from 'typeorm';

dotenv.config({ path: '.env.test' });

describe('UsersController', () => {
    let controller: UsersController;
    let app: INestApplication;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            imports: [
                TypeOrmModule.forRoot({
                    type: 'postgres',
                    host: process.env.DB_HOST,
                    port: parseInt(process.env.DB_PORT),
                    username: process.env.DB_USERNAME,
                    password: process.env.DB_PASSWORD,
                    database: process.env.DB_DATABASE,
                    entities: [User, Event],
                    synchronize: true,
                }),
                UsersModule,
                EventsModule,
            ],
        }).compile();

        app = module.createNestApplication();
        controller = module.get<UsersController>(UsersController);
        await app.init();
    });

    afterEach(async () => {
        const dataSource = app.get(DataSource);
        await dataSource.query('TRUNCATE TABLE events_invitees_users CASCADE');
        await dataSource.query('TRUNCATE TABLE events CASCADE');
        await dataSource.query('TRUNCATE TABLE users CASCADE');
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('POST /users', () => {
        it('should create a user', async () => {
            const createUserDto = {
                name: 'Test User',
            };
            const response = await request(app.getHttpServer())
                .post('/users')
                .send(createUserDto)
                .expect(HttpStatus.CREATED);
            expect(response.body).toEqual({
                id: expect.any(Number),
                name: createUserDto.name,
            });
        });
    });

    describe('GET /users/:id', () => {
        it('should return a user by id', async () => {
            const createUserDto = {
                name: 'Test User',
            };
            const user = await request(app.getHttpServer())
                .post('/users')
                .send(createUserDto)
                .expect(HttpStatus.CREATED);
            const response = await request(app.getHttpServer())
                .get(`/users/${user.body.id}`)
                .expect(HttpStatus.OK);
            expect(response.body).toEqual({
                id: user.body.id,
                name: createUserDto.name,
                events: [],
            });
        });
        it('should return 404 if user not found', async () => {
            await request(app.getHttpServer())
                .get(`/users/999`)
                .expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('PUT /users/:id', () => {
        it('should merge all events for a user', async () => {
            const createUserDtos = [
                {
                    name: 'Test User 1',
                },
                {
                    name: 'Test User 2',
                },
                {
                    name: 'Test User 3',
                },
            ];
            const users = [];
            for (const createUserDto of createUserDtos) {
                const user = await request(app.getHttpServer())
                    .post('/users')
                    .send(createUserDto)
                    .expect(HttpStatus.CREATED);
                users.push(user);
            }
            const createEventDtos = [
                {
                    title: 'Test Event 1',
                    description: 'Test Description 1',
                    status: 'TODO',
                    startTime: '2020-01-01T00:00:00.000Z',
                    endTime: '2020-01-01T01:00:00.000Z',
                    invitees: [users[0].body.id, users[1].body.id],
                },
                {
                    title: 'Test Event 2',
                    description: 'Test Description 2',
                    status: 'TODO',
                    startTime: '2020-01-01T00:30:00.000Z',
                    endTime: '2020-01-01T02:00:00.000Z',
                    invitees: [users[0].body.id, users[2].body.id],
                },
            ];
            for (const createEventDto of createEventDtos) {
                await request(app.getHttpServer())
                    .post('/events')
                    .send(createEventDto)
                    .expect(HttpStatus.CREATED);
            }
            const response = await request(app.getHttpServer())
                .put(`/users/${users[0].body.id}`)
                .expect(HttpStatus.OK);
            expect(response.body[0].startTime).toEqual(
                '2020-01-01T00:00:00.000Z',
            );
            expect(response.body[0].endTime).toEqual(
                '2020-01-01T02:00:00.000Z',
            );
            expect(response.body[0].title).toEqual(
                'Test Event 1 & Test Event 2',
            );
            expect(response.body[0].description).toEqual(
                'Test Description 1 & Test Description 2',
            );
            expect(response.body[0].invitees).toHaveLength(3);
        });
    });

    afterAll(async () => {
        await app.close();
    });
});
