import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { Repository } from 'typeorm';
import { Client } from './entities/client.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Client)
    private clientRepository: Repository<Client>,
  ) { }

  async create(createClientDto: CreateClientDto) {
    return await this.clientRepository.save(createClientDto);
  }

  async findAll() {
    return await this.clientRepository.find();
  }

  async findOne(id: number) {
    return await this.clientRepository.findOne({ where: { id } });
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    return await this.clientRepository.update(id, updateClientDto);
  }

  async remove(id: number) {
    return await this.clientRepository.delete(id);
  }
}
