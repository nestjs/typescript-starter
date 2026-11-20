# Structure: where code goes, how to organize modules, what to avoid

Conventions an experienced Nest team follows, and the ones coding agents most often get wrong.

## Where logic goes

1. **Controllers do HTTP only**: read params, call one service method, set status codes and headers. No business rules, no queries.
2. **Services hold the use cases and rules** ("an archived note can't be edited"). They don't know about HTTP: no `Request`, `Response` or `@Res()` in them, so a queue worker or a CLI command can call them too.
3. **Data access lives in repositories** (your own class, or the ORM's repository behind a service), never in controllers, and never as raw SQL scattered across services.
4. **Shape at the edge, rules in the service.** Types, lengths and formats go in the schema or DTO; checks that need the database ("email taken", "over quota") go in the service.
5. **Permissions:** route-level checks with `@Can()`, record-level checks in the service after loading the record (`nestjs-auth`).
6. **Response shapes in one place per resource**: a mapper function or a response class, not ad hoc spreads in each handler. Never return ORM entities or rows directly: they leak password hashes, internal columns and lazy relations.
7. **Cross-cutting concerns go in the building block made for them:** authentication and access in guards; logging, timing and response mapping in interceptors; the error body in one exception filter; parsing and transformation in pipes; raw request work before routing in middleware. Business rules go in none of them.
8. **Services throw Nest exceptions** (`NotFoundException`, `ConflictException`, ...) instead of returning `null` or error codes that every controller has to translate.

## Modules and features

9. **One module per feature or business capability** (`notes`, `billing`, `identity`), never per technical layer: no top-level `controllers/`, `services/` or `repositories/` folders.
10. **A feature folder holds everything about it:** module, controller, service, repository, DTOs or schemas, policy, and its tests. Everything about notes is in `src/notes/`.
11. **Export as little as possible.** A module's `exports` are its public API: only what other modules actually inject.
12. **Reading another feature's table:** register that table's repository in your own module (`TypeOrmModule.forFeature([Note])` in the module that needs it; with Drizzle, import the table and query it) rather than importing the other feature's module. Feature modules importing each other is how circular module dependencies start. Go through the owning feature's service only when the operation has to run that feature's rules or side effects.
13. **Shared infrastructure gets its own modules** (database, config, mail, logging), imported where needed. Avoid `@Global()` in general, and always for feature modules: a global module hides who depends on what, and makes modules impossible to test or move on their own. Packages that register themselves globally (`ConfigModule` with `isGlobal`, the database module) are the usual exception.
14. **No catch-all `SharedModule` or `CommonModule`** that everything imports. Pure helpers go in plain files; anything with dependencies goes in a small, focused module.
15. **The root `AppModule` composes**: feature modules, infrastructure modules and app-wide providers (`APP_GUARD`, `APP_FILTER`, ...). No feature controllers or services of its own.
16. **A cycle between feature modules means a boundary is wrong.** Extract what both need into a third module, register the repository you need (item 12), or communicate through events. `forwardRef()` is the last resort.
17. **Side effects across features** ("when a user is deleted, cancel their reminders"): a domain event (`@nestjs/event-emitter`) or a queued job when it needn't happen in the same transaction; a direct service call when it must.

## Configuration

18. All configuration through `@nestjs/config` with a schema validated at startup; no `process.env` reads scattered through services.
19. Typed namespaces (`registerAs('database', () => ({...}))`, injected with `@Inject(databaseConfig.KEY)`) instead of string keys everywhere.
20. Module options from configuration: `forRootAsync({ inject: [ConfigService], useFactory })`, not `forRoot({ secret: process.env.X })`.
21. Secrets never in code or committed files; a separate key per environment.

## Code style

22. **Constructor injection only.** `new SomeService()` inside a provider bypasses the container: its dependencies, lifecycle hooks and test overrides stop applying.
23. **Abstractions where there's a second implementation or a test seam** (a payment provider, a mailer): an interface plus a token. Not an interface and token for every class.
24. **Providers are stateless singletons.** Per-request data comes from arguments or a context service (`AuthenticationContext`), never from fields.
25. **Small, single-purpose services.** Split one that injects many unrelated collaborators, or whose methods share nothing.
26. **Nest's naming:** `notes.module.ts`/`NotesModule`, `notes.controller.ts`/`NotesController`, `notes.service.ts`/`NotesService`, `notes.service.spec.ts`; DTO classes end in `Dto` (`CreateNoteDto`, `UpdateNoteDto`, `NoteResponseDto`) in `create-note.dto.ts`, and schemas in `notes.schemas.ts` (`createNoteSchema`, type `CreateNote`). The CLI, tools and other developers look for these names.
27. **DTOs per use case**: create, update and response are separate types, not one entity class used as input, output and table at once. Blurring them is how a read-then-`save()` update resurrects deleted rows and how password hashes reach responses.

## Performance

28. **For throughput, use the Node adapter.** `@nestjs/platform-node`'s `NodeAdapter` (Nest 12.3+) is the fastest adapter: about 50% more requests per second than Express and about 5% more than Fastify in Nest's benchmarks, with Express-style request/response helpers, so most Express middleware works unchanged. Express (the scaffold's default) stays the safe choice when the app relies on Express APIs the Node adapter doesn't implement (`res.render()`, `res.download()`, ...); Fastify when you need its plugins. Docs: `/http/performance`.
    - Adapter differences to know (checked on 12.5): the Node and Fastify adapters match routes by specificity, Express in declaration order; trusted proxies are a constructor option on Node and Fastify (`new NodeAdapter({ trustProxy: 'loopback' })`), `app.set('trust proxy', 1)` on Express; e2e tests must pass the same adapter to `createNestApplication(new NodeAdapter())`, or they run on Express.
    - The adapter is a small part of each request: a route waiting on a database gains little. It matters for light routes at high request rates.
29. **Never block the event loop.** One Node process serves every request on one thread: a CPU-heavy loop (image or PDF processing, big JSON transforms, compression, synchronous crypto such as `bcrypt.hashSync`/`scryptSync`, regexes on untrusted input) stalls every other request on the instance. Move such work to a queue worker (`@nestjs/bullmq`) or a `worker_threads` pool, use the async APIs, and stream large payloads instead of building them in memory.

## Errors and logs

30. One global exception filter for the error body; log unexpected errors there, once.
31. Don't catch just to log and rethrow. Catch to handle (retry, fall back, map to a domain error) or to add context.
32. A `Logger` per class (`new Logger(NotesService.name)`) with structured params; never `console.log`.
33. Instrument from day one (NestJS Observe, `nestjs-production`), not after the first incident.

## What to avoid

34. Request-scoped providers for convenience: the scope spreads to every dependent and costs an instance chain per request.
35. `@Res()` without `passthrough: true`.
36. Business rules in guards, interceptors, middleware or custom decorators: hidden, hard to find, hard to test. A decorator carries metadata or extracts a parameter; it doesn't query the database.
37. "God" services (`UsersService` doing sign-in, profile, billing and email).
38. Copy-pasted helpers across features; extract them once.
39. Deep inheritance between services or controllers; compose instead.
40. Architecture beyond the problem: CQRS, ports-and-adapters layers, or repositories wrapping repositories in a small app. Start with module, controller, service and repository; add structure when a feature needs it.
41. Microservices before they're needed. A modular monolith with clean module boundaries (items 9-17) splits later.
42. `synchronize: true` in production, `any`-typed bodies, "temporarily" disabled validation, TypeScript `strict` off.
43. Barrel files (`index.ts` re-exporting a feature) inside an app: they make circular imports easy, which show up as `undefined` providers at startup.

## Testing and change

44. Rules live in services and policies, so they're unit-testable without HTTP (`nestjs-testing`).
45. A feature module boots on its own in a test with its dependencies stubbed. If it can't, its boundaries leak.
46. One change carries its whole feature: module wiring, schema or DTO, migration, tests and the OpenAPI description together.

## Growing

47. Dozens of modules: group them by domain (`src/catalog/products`, `src/catalog/categories`); module boundaries become ownership lines between teams.
48. Code shared between several apps (an API and a worker) goes in workspace libraries (`nest g library`); one app doesn't need libraries.
49. External clients: version the API (`app.enableVersioning()`), and never change a released response shape silently.
