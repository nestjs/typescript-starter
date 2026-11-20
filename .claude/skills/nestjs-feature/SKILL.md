---
name: nestjs-feature
description: Add or change HTTP endpoints in a NestJS application - modules, controllers and services, request validation (Zod or another Standard Schema library with @Body({ schema }), or class-validator DTOs), status codes, error response bodies, request IDs, versioning and Server-Sent Events. Use when adding or changing endpoints in a NestJS application.
license: MIT
---

# Adding a feature to a NestJS app

## Where code goes

- Controllers do HTTP only (params, one service call, status codes); services hold the rules and know nothing about HTTP; repositories hold the queries. Never return ORM entities or rows: map to a response type.
- One module per feature (`src/notes/` holds its module, controller, service, repository, DTOs, policy and tests), never per layer. Export only what others inject.
- To read another feature's table, register its repository in your own module (`TypeOrmModule.forFeature([Note])`, or import the Drizzle table) instead of importing the other feature's module: that's how circular module dependencies start.
- Avoid `@Global()`, always for feature modules; no catch-all `SharedModule`.
- DTO classes end in `Dto` (`CreateNoteDto`), one per use case (create, update, response).
- Never block the event loop: CPU-heavy work goes to a queue worker or `worker_threads`.

All 49 conventions, with what to avoid: [references/structure.md](references/structure.md).

## The shape of a feature

Write the files directly; each is small:

```typescript
// src/notes/notes.module.ts
@Module({ controllers: [NotesController], providers: [NotesService], exports: [NotesService] })
export class NotesModule {}

// src/notes/notes.controller.ts: HTTP only (params, status codes, which service call)
@Controller('notes')
export class NotesController {
  constructor(private readonly notes: NotesService) {}
  @Get(':id') findOne(@Param('id', { schema: id }) noteId: number, @CurrentUser() user: User) { return this.notes.findOne(user.id, noteId); }
}

// src/notes/notes.service.ts: rules and data access; throws Nest exceptions (NotFoundException, ...)
@Injectable()
export class NotesService { ... }
```

Then add `NotesModule` to `AppModule`'s `imports`. `exports` only what other modules inject, and import the exporting module where it's used.

`npx nest g module|controller|service notes --no-spec` does the same registration if you'd rather generate; `nest g resource` adds CRUD stubs and an entity class you'll mostly delete, so it's worth it only for a plain CRUD (pass `--type rest --crud`, or it prompts).

**When it doesn't start:**
- `Nest can't resolve dependencies of the NotesService (?)`, with `?` at index N: the Nth constructor parameter isn't provided in this module's scope. Add the provider to `providers`, or `exports` it from its module and import that module. The parameter shows as `Function` or `Object` when it was imported with `import type` (decorator metadata erased): use a value import for every injected class.
- Two modules importing each other: break the cycle (move the shared provider to a third module); `forwardRef(() => OtherModule)` is the last resort.
- A provider injected by an interface or a config value needs a token: `{ provide: NOTES_REPO, useClass: SqlNotesRepository }` and `@Inject(NOTES_REPO)`.

**Modules and providers that start but misbehave** (details: [references/modules.md](references/modules.md)):
- A class listed in the `providers` of two modules is two instances with separate state. List it once, `export` it, import that module.
- Call a module's `forRoot()` once, in the root module; feature modules import `forFeature()` or the module itself.
- `Scope.REQUEST` spreads: everything that injects a request-scoped provider becomes request-scoped too (a new instance per request), lifecycle hooks (`onModuleInit`, ...) never run on them, and a `@Cron()` in such a class is never scheduled. (In a WebSocket gateway the scope is the connection, since Nest 12.) For per-request data, read it from the request or a context service (`AuthenticationContext`, `AsyncLocalStorage`) instead.

**Where code runs**, per request: middleware → guards → interceptors (before) → pipes → handler → interceptors (after) → exception filters. So a guard sees the raw, unvalidated body, validation errors come after authentication (a bad body from an anonymous caller is a 401, not a 400), and an interceptor's response mapping doesn't apply to thrown errors (filters handle those). Global ones run before controller-level, then route-level.

## Validate every request body

Pick one style per app and bind its pipe globally in `main.ts`. If the app already has one, keep it.

**Zod (or Valibot, ArkType): no classes, the type is inferred.**

```typescript
// main.ts
app.useGlobalPipes(new StandardSchemaValidationPipe()); // from '@nestjs/common'

// notes.schemas.ts
export const createNoteSchema = z.object({ title: z.string().trim().min(1).max(200) });
export type CreateNote = z.infer<typeof createNoteSchema>;
export const updateNoteSchema = z.object({ title: z.string().trim().min(1).max(200), archived: z.boolean() }).partial();

// notes.controller.ts
@Post()
create(@Body({ schema: createNoteSchema }) body: CreateNote) { ... }

@Get(':id')
findOne(@Param('id', { schema: z.coerce.number().int().positive() }) id: number) { ... }
```

The pipe validates only parameters that declare a `schema` and answers 400. `z.object()` strips unknown keys; `z.strictObject()` rejects them. `.optional()` and `.partial()` accept a missing field but not `null`. Booleans from query strings: `z.stringbool()`, not `z.coerce.boolean()`, which turns `"false"` into `true`.

**class-validator DTOs**: `app.useGlobalPipes(new ValidationPipe({ whitelist: true }))`. `@IsOptional()` lets `null` through every other rule, so `{"title": null}` reaches the database: for a field that may be left out but not set to `null`, use `@ValidateIf((_, value) => value !== undefined)` in its place. `PartialType()` from `@nestjs/mapped-types` applies `@IsOptional()` too, unless you pass `{ skipNullProperties: false }`. Nested objects and arrays are validated only with `@ValidateNested()` plus `@Type(() => Address)` from class-transformer; without `@Type()` any value passes. Without `whitelist: true`, undeclared fields reach the handler: a body spread into an entity can set `ownerId` or `role` (mass assignment). `whitelist: true` strips them, silently, typos included; `forbidNonWhitelisted: true` answers 400 instead. (`z.object()` strips unknown keys by default.)

Details and both styles side by side: [references/validation.md](references/validation.md).

## Status codes and errors

- `@Post()` answers 201 and every other method 200. A POST that creates nothing (sign-in, an action) needs `@HttpCode(200)`; a DELETE with no body, `@HttpCode(204)`.
- Throw Nest's exceptions (`NotFoundException`, `ConflictException`, `ForbiddenException`, ...) from services or controllers; anything else becomes a 500.
- Path and query parameters are strings: `@Query('page') page: number` holds `"1"`, so `page + 1` is `"11"`. Convert with a schema (`z.coerce.number()`), `ParseIntPipe`/`ParseFloatPipe`, or `ValidationPipe({ transform: true })`.
- `ParseIntPipe` answers 400 for a non-numeric id. If the contract says 404 there, `new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND })`.
- Nest's error body is `{ statusCode, message, error }`. If the contract fixes another shape, add one global exception filter; it then also covers validation errors and guards' 401s, which are `HttpException`s too. See [references/http.md](references/http.md).

## Routes and responses that surprise

- On the Express adapter (the default), route order matters: `@Get(':id')` declared before `@Get('search')` answers `/search` with `id = 'search'`. Declare static paths first. The Node and Fastify adapters match by specificity instead.
- Wildcards are named since Nest 11 (Express 5): `files/{*path}` matches `/files/` and `/files/a/b` (`path` is an array of segments), `files/*path` needs at least one segment; neither matches bare `/files`. An old-style `files/*` still matches, but logs `LegacyRouteConverter: Unsupported route path` at startup: write the named form.
- Express 5 parses query strings flat: `?filter[status]=done` gives the key `filter[status]`, not `{ filter: { status } }`. `app.set('query parser', 'extended')` brings nested objects back.
- `ClassSerializerInterceptor` and `@Exclude()` strip fields only from class instances. A plain object (what most ORMs and Drizzle return) goes out whole, password hash included. Map to a response type, or return `new UserResponse(row)`.
- A global interceptor that wraps responses (`map((data) => ({ data }))`) also wraps every SSE event and streamed chunk: skip those routes in it.
- `@Catch()` with no argument catches `HttpException` too: a catch-all filter that always answers 500 turns every 400, 401 and 404 into a 500. Handle `HttpException` first (as the filter in `references/http.md` does), or extend `BaseExceptionFilter` and call `super.catch()` for what you don't handle.
- In a guard, `reflector.get(KEY, context.getHandler())` misses metadata set on the controller class: `reflector.getAllAndOverride(KEY, [context.getHandler(), context.getClass()])` reads both, the handler's first.
- `CacheInterceptor` keys responses by URL: on a route that answers per user, the next user gets the first user's response. Override `trackBy()` to include the user, or don't cache such routes.
- `app.useGlobalFilters(new X())`, `useGlobalPipes`, `useGlobalGuards` take instances made outside the container: no dependency injection, and the testing module doesn't see them. Register as `APP_FILTER`/`APP_PIPE`/`APP_GUARD` providers when they need services.
- CORS with cookies or `Authorization` from a browser needs `credentials: true` and a list of origins; `origin: true` reflects any origin, which lets every site call the API as the user.

## Server-Sent Events

`@Sse('events')` on a handler that returns an `Observable<MessageEvent>`; release per-client resources in `finalize()`, which runs when the client disconnects. Guards run once, when the stream opens: a stream keeps its user after the token, API key or session is revoked, or the user is deleted. End it then: keep each open stream's credential id, and complete that stream (`takeUntil(revoked$)`) when the credential is revoked. It is easy to miss. Example in [references/http.md](references/http.md).

## Cross-cutting HTTP concerns

Request IDs, a global prefix with exceptions, API versioning, body size limits, raw bodies for webhook signatures, response headers, `@Res()` without losing interceptors: [references/http.md](references/http.md).

## Before you finish

Build (`npm run build`), start the app on the port you were given, try the new routes with `curl`, including a bad body, a missing resource and an unauthenticated call, then stop the server by its PID.
