import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { BetModel } from './bet/bet.model';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '192.168.0.10',
      port: 3307,
      username: 'root',
      password: 'root_password',
      database: 'owncloud',
      synchronize: true,
      autoLoadEntities: true,
    }),
    BetModel,
  ],
  providers: [AppService],
})

export class AppModule {
  constructor(private connection: Connection) {}
}
