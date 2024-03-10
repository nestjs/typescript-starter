import { Injectable } from '@nestjs/common';
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
            throw new Error('One or more events do not exist.');
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

    async deleteUser(userId: number): Promise<void> {
        const events = await this.eventsRepository
            .createQueryBuilder('event')
            .leftJoin('event.invitees', 'user')
            .where('user.id = :userId', { userId })
            .getMany();
        
        for (const event of events) {
            event.invitees = event.invitees.filter(invitee => invitee.id !== userId);
            await this.eventsRepository.save(event);
        }
    
        await this.usersRepository.delete(userId);
    }
}
