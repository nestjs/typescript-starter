import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Person } from './person.entity';

@Injectable()
export class PeopleService {
  constructor(
    @InjectRepository(Person)
    private peopleRepo: Repository<Person>,
  ) { }

  findAll(): Promise<Person[]> {
    return this.peopleRepo.find();
  }

  findOne(id: number): Promise<Person> {
    return this.peopleRepo.findOne(id);
  }

  create(person: Person) {
    this.peopleRepo.insert(person);
  }

  update(id: number, data: Person) {
    this.peopleRepo.update(id, data)
  }

  remove(id: number) {
    this.peopleRepo.delete(id);
  }
}
