import { environment } from '@env';
import { DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as entities from '@services/db/entities';

class DbModule {
  /**
   * Mapped entities
   */
  public static entities = Object.keys(entities).map((item) => entities[item]);

  /**
   * Root definition
   */
  public static forRoot(): DynamicModule {
    return TypeOrmModule.forRoot({
      entities: DbModule.entities,
      charset: 'utf8mb4',
      insecureAuth: true,
      extra: { insecureAuth: true },
      synchronize: true,
      autoLoadEntities: true,
      retryAttempts: 5,
      retryDelay: 10000,
      timezone: 'Z',
      ...(environment.db as Record<string, string>),
    });
  }
  /**
   * Feature definition
   */
  public static forFeature(): DynamicModule {
    return TypeOrmModule.forFeature(DbModule.entities);
  }
}

export { DbModule };
