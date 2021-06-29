import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { PeopleService } from './people.service';
import { Person } from './person.entity';

@Controller('people')
export class PeopleController {

  constructor(private readonly peopleService: PeopleService) { }


  @Get()
  findAll(): Promise<Person[]> {
    return this.peopleService.findAll()
  }

  @Get(":id")
  findOne(@Param("id") id: number): Promise<Person> {
    return this.peopleService.findOne(id);
  }

  @Post()
  create(@Body() newPerson: Person) {
    this.peopleService.create(newPerson);
  }

  @Put(":id")
  update(@Body() newData: Person, @Param("id") id: number) {
    this.peopleService.update(id, newData)
  }

  @Delete(":id")
  delete(@Param("id") id: number) {
    this.peopleService.remove(id)
  }
}
