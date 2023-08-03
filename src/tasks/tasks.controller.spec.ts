import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TasksModule } from './tasks.module';
import { TaskStatus } from './tasks.model';
import * as request from 'supertest';

describe('TasksController (e2e)', () => {
  let app: INestApplication;
  let taskId: string;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [TasksModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/tasks (POST)', async () => {
    const response = await request(app.getHttpServer())
      .post('/tasks')
      .send({ title: 'Task 1', description: 'Test task 1' })
      .expect(201);

    taskId = response.body.id;

    expect(response.body.title).toEqual('Task 1');
    expect(response.body.description).toEqual('Test task 1');
    expect(response.body.status).toEqual(TaskStatus.TODO);
  });


  afterAll(async () => {
    await app.close();
  });
});
