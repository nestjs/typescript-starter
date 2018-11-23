# TypeORM

Add to `app.module.ts`

```typescript
imports [
  TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService })
],
```

## typeorm.config.service.ts

- Provides the TypeORM configuration to the app,
- Best practice would be to spread the config from the ConfigService

```typescript
  type: 'postgres',
  ...config.postgres,
```

### config.service.ts

```typescript
  get postgres() {
    return {
      host: this.envConfig.POSTGRES_HOST,
      username: this.envConfig.POSTGRES_USER,
      password: this.envConfig.POSTGRES_PASSWORD,
      database: this.envConfig.POSTGRES_DATABASE,
    };
  }
```

[See TypeORM documentation](http://typeorm.io/#/connection-options)

## typeorm.logger.service.ts

- Enables TypeORM to use the NestJS logging service
- Adapted from [SimpleConsoleLogger](https://github.com/typeorm/typeorm/blob/master/src/logger/SimpleConsoleLogger.ts)
