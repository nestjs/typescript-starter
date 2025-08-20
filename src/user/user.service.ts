import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(userData: Partial<User>): Promise<User> {
    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findAdmins(): Promise<User[]> {
    return this.usersRepository.find({
      where: { isAdmin: true },
    });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }
}
