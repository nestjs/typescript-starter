import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { UserSeeder } from './user/user.seeder';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST'),
        port: config.get<number>('DATABASE_PORT'),
        username: config.get<string>('DATABASE_USER'),
        password: config.get<string>('DATABASE_PASS'),
        database: config.get<string>('DATABASE_NAME'),
        autoLoadEntities: true,
        synchronize: true, // ⚠️ Don't use in production
      }),
    }),

    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  constructor(private readonly userSeeder: UserSeeder) {}

  async onModuleInit() {
    // Run the seeder after the module is initialized
    await this.userSeeder.seed();
  }
}
