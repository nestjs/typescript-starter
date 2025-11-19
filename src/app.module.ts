import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientModule } from './client/client.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Client } from './client/entities/client.entity';
import { Raffle } from './raffle/entities/raffle.entity';
import { RaffleController } from './raffle/raffle.controller';
import { RaffleNumbers } from './raffle-numbers/entities/raffle-numbers.entity';
import { RaffleNumbersStatus } from './raffle-numbers-status/entities/raffle-numbers-status.entity';
import { RaffleNumbersStatusModule } from './raffle-numbers-status/raffle-numbers-status.module';
import { RaffleNumbersModule } from './raffle-numbers/raffle-number.module';

@Module({
  imports: [
    ClientModule,
    RaffleNumbersStatusModule,
    RaffleNumbersModule,
    TypeOrmModule.forFeature([
      Client,
      Raffle,
      RaffleNumbers,
      RaffleNumbersStatus,
    ]),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'raffles',
      entities: [RaffleNumbersStatus, Client, Raffle, RaffleNumbers],
      synchronize: true,
    }),
  ],
  controllers: [AppController, RaffleController],
  providers: [AppService],
})
export class AppModule { }
