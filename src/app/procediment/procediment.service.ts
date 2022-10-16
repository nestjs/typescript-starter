import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';
import { CreateProcedimentDto } from './dto/create-procediment.dto';
import { UpdateProcedimentDto } from './dto/update-procediment.dto';
import { Procediment } from './entities/procediment.entity';

@Injectable()
export class ProcedimentService {
    constructor(
        @InjectRepository(Procediment)
        private readonly procedimentRepository: Repository<Procediment>,
    ){}

    async findAll(){
        return await this.procedimentRepository.find({
            select: ['id', 'name', 'description', 'price'],
        });
    }

    async findOneOrFail(options: FindOneOptions<Procediment>){
        try{
            return await this.procedimentRepository.findOneOrFail(options);            
        }catch(error){
            throw new NotFoundException(error.message);
        }
    }

    async store(data: CreateProcedimentDto, user: User){
        let procediment = this.procedimentRepository.create(data);
        procediment.setUser(user);
        return await this.procedimentRepository.save(procediment);
    }

    async update(data: UpdateProcedimentDto) {  
        const id = data.id;
        const procediment = await this.findOneOrFail({ where: { id } });
        this.procedimentRepository.merge(procediment, data);
        return await this.procedimentRepository.save(procediment);
    }

    async destroy(id: number){
        await this.procedimentRepository.findOneOrFail({ where: { id } });
        this.procedimentRepository.softDelete({ id });
    }    

}
