import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Task } from '../typeorm/Task';

describe('TasksService', () => {
    let service: TasksService;
    const mockusers = [
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
    const mockUserRepo = {
        create: jest.fn((dto) => {
            return dto;
        }),
        save: jest.fn((user) => {
            return Promise.resolve({
                id: Date.now(),
                ...user,
            });
        }),

        find: jest.fn(() => {
            return Promise.resolve(mockusers);
        }),

        findOneBy: jest.fn(({ id: id }) => {
            // console.log(mockusers.filter((user) => user.id === id));
            return Promise.resolve(mockusers.filter((user) => user.id === id));
        }),

        delete: jest.fn((id) => {
            return Promise.resolve(mockusers.filter((user) => user.id != id));
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                { provide: getRepositoryToken(Task), useValue: mockUserRepo },
            ],
        }).compile();

        service = module.get<TasksService>(TasksService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should create a new user and return ', async () => {
        expect(
            await service.createTask({
                title: 'title',
                description: 'desp',
                status: 'TODO',
            }),
        ).toEqual({
            id: expect.any(Number),
            title: 'title',
            description: 'desp',
            status: 'TODO',
        });
    });

    it('should find all tasks and return ', async () => {
        expect(await service.getTasks()).toEqual(mockusers);
    });

    it('should find single user and return', async () => {
        expect(await service.getTaskById(1)).toEqual([
            {
                id: 1,
                title: 'ralab',
                description: 'description',
                status: 'TODO',
            },
        ]);
    });

    it('should delete a task by id, return the rest', async () => {
        expect(await service.deleteTaskById(1)).toEqual([
            {
                id: 2,
                title: 'ralab2',
                description: 'description',
                status: 'TODO',
            },
        ]);
    });
});
