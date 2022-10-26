import { User } from './entities/user.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { FindOneOptions, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async findAll() {
    return await this.userRepository.find({
      select: ['id', 'firstName', 'lastName', 'email'],
    });
  }

  async findOneOrFail(options: FindOneOptions<User>) {
    try {
      return await this.userRepository.findOneOrFail(options);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async fundById(id: number){
    const user = await this.findOneOrFail({ where: { id } });
    return user;
  }

  async store(data: CreateUserDto) {
    const user = this.userRepository.create(data);
    return await this.userRepository.save(user);
  }

  async update(id: number, data: UpdateUserDto) {
    const user = await this.findOneOrFail({ where: { id } });
    this.userRepository.merge(user, data);
    return await this.userRepository.save(user);
  }

  async destroy(id: number) {
    await this.userRepository.findOneOrFail({ where: { id } });
    this.userRepository.softDelete({ id });
  }
}
