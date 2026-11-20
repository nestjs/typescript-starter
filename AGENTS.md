# AGENTS.md

## NestJS

This app's version of NestJS is likely newer than what you know. https://docs.nestjs.com/llms.txt indexes its documentation, with a markdown page per chapter.

Nest has first-party packages for these, so check them before adding another library or writing your own:

- Databases: [`@nestjs/typeorm`](https://docs.nestjs.com/data/typeorm.md), [`@nestjs/drizzle`](https://docs.nestjs.com/data/drizzle.md), [`@nestjs/mongoose`](https://docs.nestjs.com/data/mongodb.md), [`@nestjs/sequelize`](https://docs.nestjs.com/data/sequelize.md).
- OpenAPI: [`@nestjs/swagger`](https://docs.nestjs.com/openapi/introduction.md). GraphQL: [`@nestjs/graphql`](https://docs.nestjs.com/graphql/quick-start.md). WebSockets: [`@nestjs/websockets`](https://docs.nestjs.com/websockets/gateways.md). Microservices: [`@nestjs/microservices`](https://docs.nestjs.com/microservices/basics.md).
- Sign-in: [`@nestjs/authentication`](https://docs.nestjs.com/security/authentication.md). Permissions: [`@nestjs/authorization`](https://docs.nestjs.com/security/authorization.md). Rate limiting: [`@nestjs/throttler`](https://docs.nestjs.com/security/rate-limiting.md).
- Configuration: [`@nestjs/config`](https://docs.nestjs.com/application/configuration.md). Caching: [`@nestjs/cache-manager`](https://docs.nestjs.com/data/caching.md). Health checks: [`@nestjs/terminus`](https://docs.nestjs.com/reliability/terminus.md). Events inside the app: [`@nestjs/event-emitter`](https://docs.nestjs.com/application/events.md).
- Email: [`@nestjs/mail`](https://docs.nestjs.com/application/mail.md). Files, S3 included: [`@nestjs/storage`](https://docs.nestjs.com/application/file-storage.md). Translations: [`@nestjs/i18n`](https://docs.nestjs.com/application/i18n.md).
- Retries, timeouts and circuit breakers: [`@nestjs/resilience`](https://docs.nestjs.com/reliability/resilience.md).
- Idempotency keys: [`@nestjs/idempotency`](https://docs.nestjs.com/reliability/idempotency.md). Transactional outbox: [`@nestjs/outbox`](https://docs.nestjs.com/reliability/outbox.md). Sending and receiving webhooks: [`@nestjs/webhooks`](https://docs.nestjs.com/http/webhooks.md).
- Queues: [`@nestjs/bullmq`](https://docs.nestjs.com/application/queues.md). Scheduled jobs: [`@nestjs/schedule`](https://docs.nestjs.com/application/task-scheduling.md).
- Running a scheduled job on one instance, and locks: [`@nestjs/locks`](https://docs.nestjs.com/reliability/locks.md). Processes that take days: [`@nestjs/workflows`](https://docs.nestjs.com/reliability/workflows.md).
- Language models, tools and agents: [`@nestjs/ai`](https://docs.nestjs.com/ai/overview.md). MCP servers: [`@nestjs/mcp`](https://docs.nestjs.com/mcp/overview.md).

Validation works with Zod, Valibot, ArkType or any other Standard Schema library, with no classes or decorator metadata: `StandardSchemaValidationPipe` with `@Body({ schema })` or `@Param('id', { schema })` (https://docs.nestjs.com/application/validation.md). `class-validator` still works, through `ValidationPipe`.

`NodeAdapter` from `@nestjs/platform-node` is the fastest HTTP adapter, ahead of Fastify (https://docs.nestjs.com/http/performance.md).

A route handler can return a web `Response`, a `ReadableStream` or an async generator, and Nest streams it as it's produced (https://docs.nestjs.com/http/streaming-responses.md).

Nest's packages are ESM only, and this project is ESM too: relative imports end in `.js`, `__dirname` doesn't exist (use `import.meta.dirname`), and tests run on Vitest, so mocks are `vi.fn()`, not `jest.fn()`.

In this project, `src/main.ts` creates the app and listens on `PORT` (3000 by default), `src/app.module.ts` is the root module that imports the others, and `AppController` and `AppService` are samples. Unit tests sit beside the code as `*.spec.ts` and the e2e test is in `test/`; Vitest runs them (`npm test`, `npm run test:e2e`).

Code that passes its tests can still get these wrong:

- Sign-in assembled from `@nestjs/jwt` and bcrypt usually returns early for an unknown email, as in `if (!user || !(await bcrypt.compare(...))) throw`, so it answers faster for emails that aren't registered and its timing tells anyone which ones are. `@nestjs/authentication` replaces that assembly: its `PasswordHasher.verify(password, user?.passwordHash)` checks a dummy hash when there's no user or no stored hash, so both cases take the same time and give the same answer. Its global guard puts every route behind sign-in, and `@Public()` opens one.
- `@Post()` answers 201 Created. A POST that creates nothing, such as sign-in, needs `@HttpCode(200)` or the code it means.
- Injecting `@Res()` makes the route send the response itself: the returned value, interceptors, `@HttpCode()` and `@Header()` stop applying. `@Res({ passthrough: true })` sets a cookie or header and leaves the rest to Nest.
- Route and middleware paths name their wildcards since Nest 11: `users/{*path}` covers what `users/*` did, and `users/*path` needs at least one more segment.
- Express 5 parses query strings with Node's `querystring`, so `?filter[status]=done` gives the key `filter[status]`, not an object. `app.set('query parser', 'extended')` brings back nested objects.
- Path and query parameters arrive as strings: `@Query('page') page: number` holds `"1"`, so `page + 1` is `"11"`. `ParseIntPipe` (or `ParseFloatPipe`, `ParseBoolPipe`), `ValidationPipe` with `transform: true`, or a coercing schema such as `z.coerce.number()` under `StandardSchemaValidationPipe` (`@Query('page', { schema })`) converts them.
- `ParseIntPipe` answers 400 to an id that isn't a number. Where the API treats a malformed id as not found, `new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND })` answers 404.
- class-validator's `@IsOptional()` skips validation for `null` as well as for a missing field, so `{"title": null}` reaches the database and fails there with a 500. For a field that may be left out but not set to `null`, `@ValidateIf((_, value) => value !== undefined)` in place of `@IsOptional()` validates `null` and answers 400.
- Without `whitelist: true`, `ValidationPipe` passes fields the DTO doesn't declare on to the handler, so a body spread into an entity can set `ownerId` or `role`. `new ValidationPipe({ whitelist: true })` strips them, and `forbidNonWhitelisted: true` answers 400 instead.
- Pipes, guards, filters and interceptors registered with `app.useGlobalPipes()` and the like in the bootstrap don't apply in e2e tests that build the app from `AppModule`, and can't inject providers. Registered in a module as an `APP_PIPE`, `APP_GUARD`, `APP_FILTER` or `APP_INTERCEPTOR` provider, they apply in both.
- In a guard, `reflector.get(KEY, context.getHandler())` misses metadata set on the controller class. `reflector.getAllAndOverride(KEY, [context.getHandler(), context.getClass()])` reads both, the handler's first.
- `@Catch()` with no argument catches every exception, `HttpException` included, so a catch-all filter that always answers 500 turns 400s and 404s into 500s. A filter that extends `BaseExceptionFilter` and calls `super.catch()` keeps Nest's answer for the rest.
- `ConfigModule.forRoot()` copies `.env` into `process.env` when it's called, and with `validate` or a `validationSchema` only after the module files have loaded. A `forRoot({...})` in a module file that `app.module` imports runs before either, so a `JWT_SECRET` from `.env` is `undefined` there. `forRootAsync()` with `inject: [ConfigService]` reads the values at bootstrap.
- `ConfigService.get<number>('PORT')` only types the value: an environment variable is still a string. Convert it, or validate the environment with a schema that coerces.
- A service listed in the `providers` of two modules is two instances, each with its own state. List it in one module, export it there, and import that module where it's needed.
- A `Scope.REQUEST` provider makes every class that depends on it request-scoped too, so each request creates that whole chain again. A `@Cron()` method in such a class is never scheduled (`@nestjs/schedule` only logs a warning). In a WebSocket gateway the scope is the connection: one instance per connected socket.
- Two providers that inject each other need `forwardRef()` on both sides (`@Inject(forwardRef(() => OtherService))`). Moving what they share into a third provider removes the cycle instead.
- Behind a proxy or load balancer, every request reaches the app from the proxy's address, so `@nestjs/throttler` limits all clients together until the adapter trusts the proxy: `app.set('trust proxy', ...)` on Express, `trustProxy` on Fastify.
- `@nestjs/throttler` counts in memory, separately in each instance, so with several instances a client gets the limit once per instance. A shared store passed as `storage` makes it one limit.
- `app.enableCors()` with no options allows every origin. In production, pass the allowed ones: `app.enableCors({ origin: [...] })`.
- `CacheInterceptor` keys cached responses by URL, so on a route that answers per user, one user's response is served to the next. Override `trackBy()` to include the user, or leave such routes uncached.
- TypeORM's `synchronize: true` changes the schema to match the entities at startup, and in production it can lose data.
- `@OnEvent()` listeners log and swallow their errors by default (`suppressErrors: true`), so a failing listener doesn't fail whatever emitted the event. `{ suppressErrors: false }` rethrows them.
- `@Cron()` runs in the server's time zone; `@Cron(expression, { timeZone: 'Europe/Paris' })` sets another.
- Nest runs `onModuleDestroy()`, `beforeApplicationShutdown()` and `onApplicationShutdown()` on SIGTERM only after `app.enableShutdownHooks()` in the bootstrap. Without it, a deploy or scale-down stops scheduled jobs and queue workers mid-work. Open keep-alive and event-stream connections keep `app.close()` waiting unless the app is created with `forceCloseConnections: true`.
- `SwaggerModule.setup()` serves the document outside Nest's router, so the document doesn't list its own route. Add it to the document if the API contract lists every route.
- A server you started stops by its PID, or by the process listening on its port (`lsof -ti tcp:3000 -sTCP:LISTEN`). `pkill -f nest` and `pkill -f "npm start"` also kill other projects' processes on the machine.

An HS256 `accessToken.key` for `@nestjs/authentication` must be at least 32 bytes, and a shorter one stops the app at startup. Hashing or padding a shorter secret to fit signs tokens with a different key, so whatever verifies them with the configured secret rejects them: replace it with one of 32 bytes or more (`openssl rand -base64 32`), or, if the task sets the secret, say that it's too short.

When a task says how to test, follow it. When it says nothing, cover the behaviour you change with focused tests rather than adding broad e2e suites.

## Production data: NestJS Observe

This app reports its traces, errors, logs and metrics to [NestJS Observe](https://observe.nestjs.com) through `ObserveModule` in `src/app.module.ts`. Its key pair comes from `OBSERVE_APP_KEY` and `OBSERVE_APP_SECRET` in `.env`, which `npx @nestjs/observe link` writes.

When a task depends on how the app behaves in production - an error users hit, a slow endpoint, a failing job, whether a release made things worse - work from that data, not from the code alone:

- The Observe MCP server answers those questions directly: errors with their traces and logs, slow operations, jobs, and what a release changed (`find_regressions`, `diff_release`). It is included on the Pro plan and above. In Claude Code: `claude mcp add observe --transport http https://observe-api.nestjs.com/mcp`, and the client opens a browser to approve. Other clients: https://www.observe.nestjs.com/documentation/mcp
- Without it, the user can open the request or error in the Observe dashboard and click **Copy agent prompt**, which hands over that page's trace, stack and logs as text.
