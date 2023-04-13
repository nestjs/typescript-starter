/* Reference: https://github.com/mguay22/nestjs-mongo/tree/unit-testing */

import { taskStub } from "../test/stubs/task.stub";

export const TasksService = jest.fn().mockReturnValue({
  insertTask: jest.fn().mockReturnValue(taskStub()._id),
  getTask: jest.fn().mockResolvedValue(taskStub()),
  deleteTask: jest.fn().mockReturnValue(taskStub()),
  updateTask: jest.fn().mockReturnValue('success')
})