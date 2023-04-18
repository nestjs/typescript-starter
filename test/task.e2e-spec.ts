import * as request from 'supertest';
import { Test } from '@nestjs/testing';
import { TasksModule } from '../src/tasks/tasks.module';
import { INestApplication } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../src/typeorm/Task';

describe('UserController (e2e)', () => {
    let app: INestApplication;

    const mockTasks = [
        {
            id: 1,
            title: 'ralab',
            description: 'description',
            status: 'TODO',
        },
        {
            id: 2,
            title: 'ralab2',
            description: 'description',
            status: 'TODO',
        },
    ];
    const mockTasksRepo = {
        find: jest.fn().mockResolvedValue(mockTasks),

        create: jest.fn((dto) => {
            return dto;
        }),
        save: jest.fn((user) => {
            return Promise.resolve({
                id: Date.now(),
                ...user,
            });
        }),

        findOneBy: jest.fn((id) => {
            const element = mockTasks.filter((el) => el.id === id);
            return Promise.resolve({
                id: element[0].id,
                ...element[0],
            });
        }),
    };
    beforeAll(async () => {
        const moduleFixture = await Test.createTestingModule({
            imports: [TasksModule],
        })
            .overrideProvider(getRepositoryToken(Task))
            .useValue(mockTasksRepo)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/tasks (GET)', () => {
        return request(app.getHttpServer())
            .get('/tasks')
            .expect(200)
            .expect(mockTasks);
    });

    it('/tasks/id (GET)', () => {
        return request(app.getHttpServer())
            .get('/tasks/1')
            .expect(200)
            .expect(mockTasks);
    });

    it('/tasks (POST)', () => {
        return request(app.getHttpServer())
            .post('/tasks')
            .send({
                title: 'ra',
                description: 'post test e2e',
                status: 'TODO',
            })
            .expect(201)
            .then((response) => {
                expect(response.body).toEqual({
                    id: expect.any(Number),
                    title: 'ra',
                    description: 'post test e2e',
                    status: 'TODO',
                });
            });
    });

    it('/tasks (POST), validation error with no title', () => {
        return request(app.getHttpServer())
            .post('/tasks')
            .send({
                description: 'post test e2e',
                status: 'TODO',
            })
            .expect(400);
    });

    it('/tasks (POST), validation error with no descrip', () => {
        return request(app.getHttpServer())
            .post('/tasks')
            .send({
                title: 'ra',
                description: 'post test e2e',
                status: 'TODO',
            })
            .expect(201);
    });

    it('/tasks (POST), validation error with wrong status', () => {
        return request(app.getHttpServer())
            .post('/tasks')
            .send({
                title: 'ra',
                description: 'post test e2e',
                status: 'TOO',
            })
            .expect(400);
    });
});
