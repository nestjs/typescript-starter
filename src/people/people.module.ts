import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeopleController } from './people.controller';
import { PeopleService } from './people.service';
import { Person } from './person.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Person])],
  providers: [PeopleService],
  controllers: [PeopleController],
})
export class PeopleModule { }
