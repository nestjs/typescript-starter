/**
 * End-to-end/Integration tests for post, get, and delete requests
 */

import { Test } from "@nestjs/testing"
import { Connection } from "mongoose"
import * as request from 'supertest';

import { AppModule } from "../../../app.module"
import { DatabaseService } from "../../../database/database.service";
import { taskStub } from "../stubs/task.stub";
import { Types } from "mongoose";

describe('TasksController', () => {
    let dbConnection: Connection;
    let httpServer: any;
    let app: any;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [AppModule]
        }).compile();

        app = moduleRef.createNestApplication();
        await app.init();
        dbConnection = moduleRef.get<DatabaseService>(DatabaseService).getDbHandle();
        httpServer = app.getHttpServer();
    })

    afterAll(async () => {
        await app.close();
    })

    beforeEach(async () => {
        await dbConnection.collection('tasks').deleteMany({});
    })

    describe('insertTask', () => {
        it('should return the new document id', async () => {
            const task = taskStub();
            const response = await request(httpServer).post('/tasks').send({
                title: task.title,
                status: task.status,
                description: task.description
            });

            expect(response.status).toBe(201);
            expect(response.body.id).toBeDefined();

            const addedTask = await dbConnection.collection('tasks')
                .findOne({ _id: new Types.ObjectId(response.body.id) });
            expect(addedTask).toMatchObject({
                title: task.title,
                status: task.status,
                description: task.description
            });

        })
    })

    describe('getTask', () => {
        it('should return a task with target id', async () => {
            const task = taskStub();
            const id = new Types.ObjectId(task._id);
            await dbConnection.collection('tasks').insertOne({
                title: task.title,
                description: task.description,
                status: task.status,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
                _id: id
            });
            const response = await request(httpServer).get('/tasks').send({ _id: id });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                title: task.title,
                description: task.description,
                status: task.status,
                createdAt: task.createdAt.toISOString(),
                updatedAt: task.updatedAt.toISOString(),
                _id: task._id
            });
        })
    })

    describe('deleteTask', () => {
        it('should return a task with target id', async () => {
            const task = taskStub();
            const id = new Types.ObjectId(task._id);
            await dbConnection.collection('tasks').insertOne({
                title: task.title,
                description: task.description,
                status: task.status,
                createdAt: task.createdAt,
                updatedAt: task.updatedAt,
                _id: id
            });
            const response = await request(httpServer).del('/tasks').send({ _id: id });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                title: task.title,
                description: task.description,
                status: task.status,
                createdAt: task.createdAt.toISOString(),
                updatedAt: task.updatedAt.toISOString(),
                _id: task._id
            });
        })
    })

})