import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { FindOneOptions, Repository } from 'typeorm';

import { UpdateCombo } from './dto/update-combo.dto';
import { CreateCombo } from './dto/create-combo.dto';
import { Combo } from './entities/combo.entity';

@Injectable()
export class ComboService {
  constructor(
    @InjectRepository(Combo)
    private readonly comboRepository: Repository<Combo>,
  ) {}

  async findAll() {
    return await this.comboRepository.find({
      select: ['id', 'name', 'description', 'cost', 'installment', 'pack'],
    });
  }

  async findOneOrFail(options: FindOneOptions<Combo>) {
    try {
      return await this.comboRepository.findOneOrFail(options);
    } catch (error) {
      throw new NotFoundException(error.message);
    }
  }

  async store(data: CreateCombo, user: User) {
    const combo = this.comboRepository.create(data);
    combo.setUser(user);
    return await this.comboRepository.save(combo);
  }

  async update(data: UpdateCombo) {
    const id = data.id;
    const combo = await this.findOneOrFail({ where: { id } });
    this.comboRepository.merge(combo, data);
    return await this.comboRepository.save(combo);
  }

  async destroy(id: number) {
    await this.comboRepository.findOneOrFail({ where: { id } });
    this.comboRepository.softDelete({ id });
  }
}
