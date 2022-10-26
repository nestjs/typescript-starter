import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ItemModule } from './item/item.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { DataSource } from 'typeorm';
import { ProcedimentModule } from './procediment/procediment.module';
import { SchedulingModule } from './scheduling/scheduling.module';
import { ClinicModule } from './clinic/clinic.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.DB_SYNCHRONIZE === 'true',
      autoLoadEntities: true,
    } as TypeOrmModuleOptions),
    ItemModule,
    UserModule,
    AuthModule,
    ProcedimentModule,
    SchedulingModule,
    ClinicModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private datasource: DataSource) {}
}
