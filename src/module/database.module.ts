import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbConfig = configService.get('database')
        const syncDB = configService.get('env') === 'development' ? true : false
        const option = {
          name: 'default',
          type: dbConfig.type,
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database_name,
          synchronize: syncDB,
          logging: false,
          entities: [__dirname + '../model/*.entity{.ts,.js}']
        }
        return option
      }
    }),
  ],
  controllers: [],
  providers: []
})
export class DatabaseModule { }