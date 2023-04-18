import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

describe('TasksController', () => {
    let controller: TasksController;

    const mockTasksService = {
        createTask: jest.fn((dto) => {
            return {
                id: Date.now(),
                ...dto,
            };
        }),

        getTaskById: jest.fn(({ id: id }) => {
            return {
                id: 1,
                title: 'ralab',
                description: 'description',
                status: 'TODO',
            };
        }),

        getTasks: jest.fn(() => {
            return [
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
        }),

        deleteTaskById: jest.fn((id) => {
            const list = [
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
            return list.filter((el) => el.id != id);
        }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TasksController],
            providers: [TasksService],
        })
            .overrideProvider(TasksService)
            .useValue(mockTasksService)
            .compile();

        controller = module.get<TasksController>(TasksController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should create a task', () => {
        expect(
            controller.createTask({
                title: 'ralab',
                description: 'description',
                status: 'TODO',
            }),
        ).toEqual({
            id: expect.any(Number),
            title: 'ralab',
            description: 'description',
            status: 'TODO',
        });

        expect(mockTasksService.createTask).toHaveBeenCalled();
    });

    it('should return one specific test', () => {
        expect(controller.getTaskById(1)).toEqual({
            id: 1,
            title: 'ralab',
            description: 'description',
            status: 'TODO',
        });
        expect(mockTasksService.getTaskById).toHaveBeenCalled();
    });

    it('should return all specific test', () => {
        expect(controller.getTasks()).toEqual([
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
        ]);
        expect(mockTasksService.getTasks).toHaveBeenCalled();
    });

    it('should delete a specific test', () => {
        const list = [
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
        expect(controller.deleteTaskById(1)).toEqual([
            {
                id: 2,
                title: 'ralab2',
                description: 'description',
                status: 'TODO',
            },
        ]);
    });
});
