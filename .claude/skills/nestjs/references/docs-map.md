# Where each topic is documented

Every chapter is plain markdown at `https://docs.nestjs.com/<path>.md`. The full index, with each chapter's first sentence, is https://docs.nestjs.com/llms.txt. Some chapters are long (authentication is ~200 KB): fetch one and read the section you need.

| Topic | Chapter | Package |
| --- | --- | --- |
| A first app, project files | `/first-steps` | `@nestjs/cli` |
| CLI commands and options (`new`, `generate`, `--minimal`) | `/cli/usages` | `@nestjs/cli` |
| Controllers, routes, status codes, `@HttpCode()` | `/controllers` | `@nestjs/common` |
| Providers and dependency injection | `/providers`, `/fundamentals/custom-providers` | |
| Modules, `exports`, global and dynamic modules | `/modules`, `/fundamentals/dynamic-modules` | |
| Pipes (`ParseIntPipe`, custom pipes) | `/pipes` | |
| Validation: `StandardSchemaValidationPipe` (Zod, Valibot, ArkType) and `ValidationPipe` (class-validator) | `/application/validation` | |
| Guards, interceptors, exception filters | `/guards`, `/interceptors`, `/exception-filters` | |
| Lifecycle hooks, `enableShutdownHooks()` | `/fundamentals/lifecycle-events` | |
| Request lifecycle (order of middleware, guards, interceptors, pipes, filters) | `/faq/request-lifecycle` | |
| Common errors ("Nest can't resolve dependencies", circular imports) | `/faq/common-errors`, `/fundamentals/circular-dependency` | |
| Logger, JSON logs, redaction | `/application/logger` | `@nestjs/common` |
| Tests (`Test.createTestingModule`, Vitest, Supertest) | `/fundamentals/testing` | `@nestjs/testing` |
| Configuration and `.env` | `/application/configuration` | `@nestjs/config` |
| Sign-in, sessions, tokens, API keys | `/security/authentication` | `@nestjs/authentication` |
| Permissions (policies, `@Can()`) | `/security/authorization` | `@nestjs/authorization` |
| Rate limiting | `/security/rate-limiting` | `@nestjs/throttler` |
| Password hashing and encryption | `/security/encryption-and-hashing` | |
| Drizzle | `/data/drizzle` | `@nestjs/drizzle` |
| TypeORM | `/data/typeorm` | `@nestjs/typeorm` |
| Prisma, MongoDB, Sequelize, MikroORM | `/data/prisma`, `/data/mongodb`, `/data/sequelize`, `/data/mikroorm` | |
| Server-Sent Events | `/http/server-sent-events` | `@nestjs/common` |
| Streaming responses (web `Response`, async generators) | `/http/streaming-responses` | |
| Events inside the app | `/application/events` | `@nestjs/event-emitter` |
| Scheduled jobs | `/application/task-scheduling` | `@nestjs/schedule` |
| Queues and background jobs | `/application/queues` | `@nestjs/bullmq` |
| Health checks | `/reliability/terminus` | `@nestjs/terminus` |
| OpenAPI | `/openapi/introduction` | `@nestjs/swagger` |
| Webhooks | `/http/webhooks` | `@nestjs/webhooks` |
| Idempotency keys, outbox, locks, retries | `/reliability/idempotency`, `/reliability/outbox`, `/reliability/locks`, `/reliability/resilience` | |
| HTTP adapters (Express, Fastify, `node:http`) and performance | `/http/performance` | |
| Global prefix, versioning, CORS, Helmet, CSRF | `/faq/global-prefix`, `/http/versioning`, `/security/cors`, `/security/helmet`, `/security/csrf` | |
| Raw request body (webhook signatures), keep-alive connections at shutdown | `/faq/raw-body`, `/faq/keep-alive-connections` | |
| Deployment (build, `NODE_ENV`, Docker, scaling) | `/deployment` | |
| Observability: overview, plans, first project | `/observability/overview` | `@nestjs/observe` |
| Observe SDK setup and options (`createObserveModule`, `instrument`, shutdown flush, log forwarding, redaction) | `/observability/sdk` | `@nestjs/observe` |
| Custom spans, handled errors, custom metrics (`TracerService`) | `/observability/manual-instrumentation` | `@nestjs/observe` |
| Distributed tracing, error monitoring, production rules, MCP server for agents | `/observability/distributed-tracing`, `/observability/error-monitoring`, `/observability/production-rules`, `/observability/mcp-server` | |
| OpenTelemetry, choosing an APM | `/observability/opentelemetry`, `/observability/choosing-an-apm` | |
| Upgrading from older versions | `/migration-guide` | |
