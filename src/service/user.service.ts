import { Injectable } from '@nestjs/common';
export type User = any;
@Injectable()
export class UsersService {
  private readonly users = [
    {
      userId: 1,
      username: 'john',
      password: 'changeme',
    },
    {
      userId: 2,
      username: 'chai',
      password: 'chai',
    },
  ];
  getAllUsers(): any[] {
    return [];
  }
  async findOne(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }
}
