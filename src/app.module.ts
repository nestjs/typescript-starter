import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Event } from './events/event.entity';
import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

dotenv.config();

@Module({
    imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
                type: 'postgres',
                host: config.get('DB_HOST'),
                port: config.get('DB_PORT'),
                username: config.get('DB_USERNAME'),
                password: config.get('DB_PASSWORD'),
                database: config.get('DB_DATABASE'),
                entities: [Event, User],
                synchronize: true,
            }),
            inject: [ConfigService],
        }),
        UsersModule,
        EventsModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
