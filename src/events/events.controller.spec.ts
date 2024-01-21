import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import * as request from 'supertest';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as dotenv from 'dotenv';
import { EventsModule } from './events.module';
import { Event } from './event.entity';
import { DataSource } from 'typeorm';
import { User } from '../users/user.entity';
import { UsersModule } from '../users/users.module';

dotenv.config({ path: '.env.test' });

describe('EventsController', () => {
    let controller: EventsController;
    let app: INestApplication;

    beforeEach(async () => {
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
                EventsModule,
                UsersModule,
            ],
        }).compile();

        app = module.createNestApplication();
        controller = module.get<EventsController>(EventsController);
        await app.init();
    });

    afterEach(async () => {
        const dataSource = app.get(DataSource);
        await dataSource.query('TRUNCATE TABLE events_invitees_users CASCADE');
        await dataSource.query('TRUNCATE TABLE events CASCADE');
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('POST /events', () => {
        it('should create an event', async () => {
            const createUserDto = {
                name: 'Test User',
            };
            await request(app.getHttpServer())
                .post('/users')
                .send(createUserDto)
                .expect(HttpStatus.CREATED);
            const createEventDto = {
                title: 'Test Event',
                description: 'Test Description',
                status: 'TODO',
                startTime: new Date(),
                endTime: new Date(),
                invitees: [1],
            };
            const response = await request(app.getHttpServer())
                .post('/events')
                .send(createEventDto)
                .expect(HttpStatus.CREATED);
            expect(response.body.title).toEqual(createEventDto.title);
            expect(response.body.description).toEqual(
                createEventDto.description,
            );
            expect(response.body.status).toEqual(createEventDto.status);
        });
    });

    describe('GET /events/:id', () => {
        it('should return an event by id', async () => {
            const createUserDto = {
                name: 'Test User',
            };
            await request(app.getHttpServer())
                .post('/users')
                .send(createUserDto)
                .expect(HttpStatus.CREATED);
            const createEventDto = {
                title: 'Test Event',
                description: 'Test Description',
                status: 'TODO',
                startTime: new Date(),
                endTime: new Date(),
                invitees: [1],
            };
            const eventResponse = await request(app.getHttpServer())
                .post('/events')
                .send(createEventDto)
                .expect(HttpStatus.CREATED);
            const response = await request(app.getHttpServer())
                .get(`/events/${eventResponse.body.id}`)
                .expect(HttpStatus.OK);
            expect(response.body.title).toEqual(createEventDto.title);
            expect(response.body.description).toEqual(
                createEventDto.description,
            );
            expect(response.body.status).toEqual(createEventDto.status);
        });
        it('should return 404 if event not found', async () => {
            await request(app.getHttpServer())
                .get(`/events/999`)
                .expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('DELETE /events/:id', () => {
        it('should delete an event by id', async () => {
            const createUserDto = {
                name: 'Test User',
            };
            await request(app.getHttpServer())
                .post('/users')
                .send(createUserDto)
                .expect(HttpStatus.CREATED);
            const createEventDto = {
                title: 'Test Event',
                description: 'Test Description',
                status: 'TODO',
                startTime: new Date(),
                endTime: new Date(),
                invitees: [1],
            };
            const eventResponse = await request(app.getHttpServer())
                .post('/events')
                .send(createEventDto)
                .expect(HttpStatus.CREATED);
            await request(app.getHttpServer())
                .delete(`/events/${eventResponse.body.id}`)
                .expect(HttpStatus.NO_CONTENT);
            await request(app.getHttpServer())
                .get(`/events/${eventResponse.body.id}`)
                .expect(HttpStatus.NOT_FOUND);
        });
    });
});
