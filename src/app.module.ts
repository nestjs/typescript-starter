import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostcodeController } from './postcode/postcode.controller';
import { PostcodeService } from './postcode/postcode.service';
import { PeopleController } from './people/people.controller';
import { PeopleService } from './people/people.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PeopleModule } from './people/people.module';
import { getConnectionOptions } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    PeopleModule
  ],
  controllers: [AppController, PostcodeController],
  providers: [AppService, PostcodeService,],
})
export class AppModule { }
