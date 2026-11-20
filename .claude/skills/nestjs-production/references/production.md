# Production recipes

Checked on Nest 12.5.1, `@nestjs/config` 12.1.1, `@nestjs/throttler` 6.8.0, `@nestjs/terminus` 12.2.0, `@nestjs/swagger` 12.1.2, `@nestjs/authentication` 0.1.6, `@nestjs/observe` 0.3.27, Node 24.

Docs: https://docs.nestjs.com/application/configuration.md, https://docs.nestjs.com/application/logger.md, https://docs.nestjs.com/observability/sdk.md, https://docs.nestjs.com/deployment.md, https://docs.nestjs.com/reliability/terminus.md, https://docs.nestjs.com/security/rate-limiting.md, https://docs.nestjs.com/openapi/introduction.md, https://docs.nestjs.com/fundamentals/lifecycle-events.md

## main.ts

```typescript
import { ConsoleLogger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { ObserveInstrument } from './observe.js';

const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  instrument: ObserveInstrument, // with an explicit adapter, these options are the THIRD argument
  logger: new ConsoleLogger({ json: true, logLevels: ['log', 'warn', 'error', 'fatal'], redact: ['password', 'authorization'] }),
});
app.set('trust proxy', 1);
app.enableShutdownHooks();

const server = app.getHttpServer();
server.keepAliveTimeout = 65_000; // longer than the load balancer's idle timeout (AWS ALB: 60 s); Node's default is 5 s
server.headersTimeout = 66_000; // must stay above keepAliveTimeout

await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
```

## Observe

```typescript
// src/observe.ts: one call, shared by AppModule and main.ts
import { createObserveModule } from '@nestjs/observe';
export const { ObserveModule, ObserveInstrument } = createObserveModule();

// app.module.ts, first in imports (before BullModule, so jobs running at shutdown are reported)
ObserveModule.forRoot({
  enabled: process.env.NODE_ENV === 'production', // off: nothing recorded or sent, no keys needed
  appKey: process.env.OBSERVE_APP_KEY ?? '',
  appSecret: process.env.OBSERVE_APP_SECRET ?? '',
  serviceId: 'orders-api',
  http: {
    ignore: ['/health', '/ready'],
    getUserId: (req) => String(req.user?.id ?? 'anonymous'),
  },
}),
```

Checked with `enabled: false`: the app starts, logs `Observe is disabled (enabled: false): nothing is recorded or sent.`, and log lines written during a request still carry a `traceId` (an incoming well-formed `X-Request-Id` is adopted as the id):

```json
{"level":"log","message":"Listing things","context":"ThingsController","params":{"userId":1,"password":"[REDACTED]","headers":{"authorization":"[REDACTED]"}},"traceId":"abc-123"}
```

- Keys: `npx @nestjs/observe link` (the user approves a code at observe.nestjs.com/link; it writes `OBSERVE_APP_KEY`/`OBSERVE_APP_SECRET` to `.env` and adds `--env-file .env` to the `nest start` scripts), or a key from the project's API Keys page. Production gets its own key, from the platform's secrets, not a shipped `.env`.
- Inject `TracerService` anywhere for `createSpan(name, fn)`, `captureError(error, tags?)` on handled errors, `setAttribute`/`getAttribute` for request-scoped values, and counters, gauges and summaries.
- `forwardLogs: true` sends `Logger` lines to the dashboard (Pro and above), redacted by default. `tracesSampleRate` and `http.capture` (headers, bodies of failed or slow requests) are in the SDK chapter.
- Tests that boot the app with real keys: `shutdownFlushTimeout: 0`, or `enabled: false`.

## Root module

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthenticationModule } from '@nestjs/authentication';
import { TerminusModule } from '@nestjs/terminus';
import { z } from 'zod';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: z.object({
        PORT: z.coerce.number().default(3000),
        THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),
      }),
    }),
    AuthenticationModule.forRoot({ ... }),
    // AuthorizationModule.forRoot(), if used
    TerminusModule,
    RateLimitModule, // after AuthenticationModule: see below
    // feature modules
  ],
  controllers: [HealthController],
})
export class AppModule {}
```

Module options (`forRoot({...})`) are evaluated when the file is imported. To read values through `ConfigService`, use the module's `forRootAsync({ inject: [ConfigService], useFactory: (config) => ({...}) })`.

## Rate limiting, per user

```typescript
// rate-limit.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

// Imported after AuthenticationModule: global guards run in module order, so request.user is set here.
@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [{ ttl: 60_000, limit: Number(process.env.THROTTLE_LIMIT ?? 100) }],
      getTracker: (req) => (req.user ? `user:${req.user.id}` : `ip:${req.ip}`),
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class RateLimitModule {}
```

Checked: with a limit of 3, user A's 4th request is a 429 with `Retry-After: 60` and user B still gets 200. With the same `APP_GUARD` in `AppModule`'s `providers` instead, `req.user` was `undefined` in `getTracker` and user B got 429 too.

- The default key is per route (controller + handler + tracker). For one budget across all routes, pass `generateKey: (context, tracker, name) => \`${name}:${tracker}\``.
- `@SkipThrottle()` on a controller or route opts out; `@Throttle({ default: { limit: 5, ttl: 60_000 } })` tightens one.
- `@Public()` routes have no user, so they count per IP.
- A guessed bearer token is refused by authentication before the throttler counts it when the throttler runs after it. To count failed attempts too, also limit per IP in a throttler that runs first (docs: "Rate-limit sign-in" in the authentication chapter).
- 429 bodies are `ThrottlerException`s (`HttpException`), so a global exception filter reshapes them; the `Retry-After` header is already set when the filter runs.

## Health and readiness

```typescript
import { Controller, Get, Injectable } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { HealthCheck, HealthCheckService, HealthIndicatorService } from '@nestjs/terminus';
import { sql } from 'drizzle-orm';

@Injectable()
export class DatabaseHealthIndicator {
  constructor(private readonly indicators: HealthIndicatorService, @InjectDrizzle() private readonly db: Database) {}

  isHealthy(key: string) {
    // Return nothing from attempt(): its result is copied into the response body.
    return this.indicators.check(key).attempt(async () => { await this.db.run(sql`select 1`); }).withTimeout('1s');
  }
}

@Public()
@SkipThrottle()
@Controller()
export class HealthController {
  constructor(private readonly health: HealthCheckService, private readonly database: DatabaseHealthIndicator) {}

  @Get('health') live() { return { status: 'ok' }; } // liveness: no dependencies; a restart doesn't fix a database

  @Get('ready')
  @HealthCheck()
  ready() { return this.health.check([() => this.database.isHealthy('database')]); } // 503 when a check fails
}

// health.module.ts
@Module({
  imports: [TerminusModule.forRoot({ gracefulShutdownTimeoutMs: 2000 })],
  controllers: [HealthController],
  providers: [DatabaseHealthIndicator],
})
export class HealthModule {}
```

Checked: `/ready` answers `{"status":"ok","info":{"database":{"responseTime":1,"status":"up"}},...}`; after `SIGTERM` it answers 503 with `"status":"shutting_down"` for the configured 2 s, then the process exits. TypeORM apps can use the built-in `TypeOrmHealthIndicator` (`pingCheck('database')`) instead.

## OpenAPI

```typescript
// main.ts
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const config = new DocumentBuilder().setTitle('Orders API').setVersion('1.0').addBearerAuth().build();
const documentFactory = () => {
  const document = SwaggerModule.createDocument(app, config);
  // setup() serves the document outside Nest's router, so it isn't listed: add its own route.
  document.paths['/docs-json'] = {
    get: { summary: 'This OpenAPI document', responses: { '200': { description: 'The document' } } },
  };
  return document;
};
SwaggerModule.setup('docs', app, documentFactory); // JSON at /docs-json by default (jsonDocumentUrl to change it)
```

- Checked: without the added entry, the JSON document's `paths` doesn't contain its own route.
- Routes come from controllers. Bodies and params declared with `@Body({ schema })` are converted when the schema library exposes Standard JSON Schema (Zod 4.2+); other libraries need `standardSchemaConverter` in `createDocument()`'s options. class-validator DTOs need `@ApiProperty()` or the swagger CLI plugin.
- Document every response status with `@ApiResponse({ status, description })` or `@ApiOkResponse()`/`@ApiCreatedResponse()` where the contract lists them.
- `@ApiBearerAuth()` on controllers that need a token.

## Shutdown

```typescript
// main.ts
app.enableShutdownHooks();
```

```typescript
@Injectable()
export class EventsService implements BeforeApplicationShutdown {
  private readonly bus = new Subject<AppEvent>();
  beforeApplicationShutdown() {
    this.bus.complete(); // ends open SSE responses, so the HTTP server can close
  }
}
```

Checked: with one SSE client connected, `SIGTERM` left the process running for 5 s and more; with the `complete()` above it exited within a second.

Timers and intervals (`setInterval` workers, schedulers) stop in `onModuleDestroy()`; database clients close themselves when registered through `@nestjs/typeorm`/`@nestjs/drizzle`.

## Persisted background work

For work due later (emails, retries), store it with its due time and status, and at startup (`onApplicationBootstrap()`) load what's pending: send what's overdue, schedule the rest. A `setTimeout` alone is lost on restart. Mark each job done in the same statement that claims it (`UPDATE ... SET status = 'sent' WHERE id = ? AND status = 'pending'`), so two instances or a restart don't send it twice. `@nestjs/schedule` (cron, intervals) and `@nestjs/bullmq` (queues with Redis) cover larger needs.
