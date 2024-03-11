import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Event } from '../entities/event.entity';
import { User } from '../entities/user.entity';
import { Repository, In } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
        @InjectRepository(Event)
        private eventsRepository: Repository<Event>,
    ) {}

    async create(createUserDto: CreateUserDto): Promise<User> {
        const { eventIds = [], ...userData } = createUserDto;
    
        const existingEvents = eventIds.length > 0 ? await this.eventsRepository.findBy({
            id: In(eventIds),
        }) : [];
    
        if (eventIds.length > 0 && existingEvents.length !== eventIds.length) {
            throw new HttpException('One or more events do not exist.', HttpStatus.BAD_REQUEST);
        }
    
        const user = this.usersRepository.create({
            ...userData,
            events: existingEvents,
        });
    
        return this.usersRepository.save(user);
    }
    

    async findAll() {
        return this.usersRepository.find();
    }
}
