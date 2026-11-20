# HTTP details

Docs: https://docs.nestjs.com/controllers.md, https://docs.nestjs.com/exception-filters.md, https://docs.nestjs.com/interceptors.md, https://docs.nestjs.com/http/versioning.md, https://docs.nestjs.com/faq/raw-body.md, https://docs.nestjs.com/http/server-sent-events.md

The snippets on this page were run on Nest 12.5 with the Express adapter.

## Status codes

```typescript
@Post('login')
@HttpCode(200) // @Post() defaults to 201 Created
login(@Body({ schema: credentialsSchema }) body: Credentials) { ... }

@Delete(':id')
@HttpCode(204) // no body
remove(@Param('id', { schema: id }) noteId: number) { return this.notes.remove(noteId); }
```

For a status decided at run time, inject the response with passthrough, so Nest still serializes the return value: `@Res({ passthrough: true }) res: Response` and `res.status(202)`.

## Errors

Throw the built-in exceptions (`BadRequestException`, `UnauthorizedException`, `ForbiddenException`, `NotFoundException`, `ConflictException`, `UnprocessableEntityException`, `HttpException` for any other code). Nest answers them as `{ "statusCode": 404, "message": "...", "error": "Not Found" }`; any other thrown error is a 500 with `"Internal server error"`.

When the API contract fixes a different error body, map every `HttpException` in one global filter. Validation pipes and guards (including `@nestjs/authentication`'s and `@nestjs/throttler`'s) throw `HttpException`s, so they're covered:

```typescript
// src/common/http-error.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpErrorFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const message =
        typeof body === 'string' ? body : [(body as { message?: string | string[] }).message ?? exception.message].flat().join('; ');
      res.status(exception.getStatus()).json({ code: exception.getStatus(), detail: message }); // the contract's shape
      return;
    }
    this.logger.error(exception);
    res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ code: 500, detail: 'Internal server error' });
  }
}

// main.ts
app.useGlobalFilters(new HttpErrorFilter());
```

Response headers set by the thrower (e.g. `WWW-Authenticate` from the authentication guard, `Retry-After` from the throttler) are already on the response when the filter runs, so they're kept.

This filter is for the Express adapter (the default). On Fastify, use `res.status(...).send(...)` with `FastifyReply`, or `HttpAdapterHost`'s `httpAdapter.reply()` for both.

An unparseable JSON body is a 400 from the body parser, which reaches the filter as a `BadRequestException`.

## Bootstrap options that change HTTP behaviour

```typescript
// main.ts
import type { NestExpressApplication } from '@nestjs/platform-express';

const app = await NestFactory.create<NestExpressApplication>(AppModule, {
  rawBody: true, // keeps req.rawBody (a Buffer) for webhook signature checks
});
app.useBodyParser('json', { limit: '100kb' }); // larger bodies: 413
app.setGlobalPrefix('api', { exclude: ['health'] }); // /api/notes, but /health stays at the root
app.enableVersioning({ type: VersioningType.URI, defaultVersion: ['1', VERSION_NEUTRAL] }); // /api/v1/notes and /api/notes
app.set('trust proxy', 1); // Express: behind one proxy, req.ip is the client's address, not the proxy's
await app.listen(process.env.PORT ?? 3000);
```

- `setGlobalPrefix()` moves every controller route, health checks included, unless you `exclude` them; probes and load balancers then get 404s. `SwaggerModule.setup()` is not prefixed unless you pass `useGlobalPrefix: true`.
- The JSON body limit defaults to 100 kB in Express. Raise it per need, not globally to megabytes.
- Verify a webhook signature over `req.rawBody` (`@Req() req: RawBodyRequest<Request>`, with `import type { RawBodyRequest }`), never over `JSON.stringify(body)`, which is not the bytes the sender signed.
- On the Node adapter, these are constructor options: `new NodeAdapter({ trustProxy: 'loopback' })` (a name or address list, no hop count), `querystringParser`, `maxParamLength`; `useBodyParser()` works the same (checked). Fastify: `new FastifyAdapter({ trustProxy: true })`.
- Without `trust proxy`, every client behind a load balancer has the proxy's IP, so IP rate limits and logs lump everyone together. Trust only as many hops as you actually have.

## Request IDs

```typescript
@Injectable()
export class RequestIdInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const incoming = req.header('x-request-id');
    const id = incoming && /^[\w.-]{1,128}$/.test(incoming) ? incoming : randomUUID();
    res.setHeader('X-Request-Id', id);
    return next.handle();
  }
}
// AppModule providers: { provide: APP_INTERCEPTOR, useClass: RequestIdInterceptor }
```

- Validate an incoming id before echoing it (length, characters): it lands in logs and response headers.
- An interceptor runs after guards, so a request a guard refuses (401, 403, 429) gets no header from it. If every response must carry one, set it in middleware (`app.use((req, res, next) => { ...; next(); })` in `main.ts`), which runs first.
- NestJS Observe adopts a well-formed incoming `x-request-id` as the trace id and stamps it on log lines (`nestjs-production`).

## Reading the request

- `@Param('id')`, `@Query('cursor')`, `@Body()`, `@Headers('x-tenant-id')`, `@Ip()`: each with an optional `{ schema }` or pipes.
- Your own: `export const TenantId = createParamDecorator((_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().headers['x-tenant-id'])`, used as `@TenantId({ schema: z.uuid() }) tenantId: string`.
- Avoid `@Res()` without `passthrough: true`: you then own the whole response, and interceptors, `@HttpCode()` and serialization stop applying to that route.

## Response headers

`@Header('Cache-Control', 'no-store')` for static ones; dynamic ones through `@Res({ passthrough: true }) res` and `res.setHeader(...)`, or an interceptor. Headers set before an exception is thrown survive it (the guard's `WWW-Authenticate`, the throttler's `Retry-After`).

## Lists

Page with a cursor, not an offset: `WHERE id > :cursor ORDER BY id LIMIT :limit + 1`. The extra row says whether there's a next page without a `COUNT(*)`, and inserts don't shift pages (`nestjs-data` has the query). Cap `limit` in the schema (`z.coerce.number().int().min(1).max(100).default(20)`), and return the next cursor (`{ items, nextCursor }`) or a `Link` header, whichever the contract names.

## Routing and serialization surprises (checked)

- Named wildcards (Nest 11+, Express 5): with `@Get('files/{*path}')`, `/files/` and `/files/a/b` match (`path` is `['a', 'b']`) and `/files` is a 404; with `@Get('docs/*path')`, `/docs/a` matches and `/docs/` and `/docs` are 404s.
- Query strings: `?filter[status]=done` arrives as `{ "filter[status]": "done" }`; after `app.set('query parser', 'extended')`, as `{ "filter": { "status": "done" } }`.

- Express adapter: `@Get(':id')` declared before `@Get('search')` in the same controller: `GET /notes/search` reaches `findOne` with `id = 'search'`. Static paths first. Node adapter, same controller: `/notes/search` reaches `search`, because it matches by specificity (both checked).
- `ClassSerializerInterceptor` + `@Exclude() passwordHash` on an entity class: a returned instance goes out as `{"id":1,"email":"a@x.io"}`, but a plain object with the same fields goes out with `passwordHash`. Drizzle rows and most query results are plain objects.
- An interceptor doing `map((data) => ({ data }))` turns an SSE event `{ data: { hello: 1 } }` into `data: {"data":{"hello":1}}`, with the event's `type` and `id` buried inside. Exclude `@Sse()` and streaming routes from response-wrapping interceptors.

## Ids that aren't numbers

`ParseIntPipe` and `z.coerce.number()` answer 400 for `/notes/abc`. When the contract treats such an id as "not found", give the pipe that status (checked: `/items/abc` answers 404, `/items/7` gives the number 7):

```typescript
@Get(':id')
findOne(@Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.NOT_FOUND })) id: number) { ... }
```

Or parse it yourself, e.g. to reject values beyond `Number.MAX_SAFE_INTEGER` too:

```typescript
@Get(':id')
findOne(@Param('id') raw: string) {
  const id = /^\d+$/.test(raw) ? Number(raw) : NaN;
  if (!Number.isSafeInteger(id)) throw new NotFoundException('Note not found');
  return this.notes.findOne(id);
}
```

## Server-Sent Events

```typescript
import { Controller, MessageEvent, Sse } from '@nestjs/common';
import { CurrentUser } from '@nestjs/authentication';
import { Observable, finalize, map } from 'rxjs';

@Controller()
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Sse('events')
  stream(@CurrentUser() user: User): Observable<MessageEvent> {
    return this.events.forUser(user.id).pipe(
      map((e): MessageEvent => ({ type: e.type, data: e.payload })), // event name; data is a string or an object
      finalize(() => this.events.release(user.id)), // runs on disconnect too
    );
  }
}
```

- An `EventsService` holding a `Subject` per user (or one `Subject` filtered by user id) is enough inside one process; across instances, use Redis pub/sub or a queue.
- Guards and the user are resolved once, when the stream opens. A revoked token, key or session, or a deleted user, keeps receiving events until the stream is completed: see "Ending streams on revocation" below.
- To send a first event at once (some clients wait for one), start the observable with it: `startWith({ type: 'ready', data: {} })`.
- For keep-alive comments or full control of the bytes, a handler can also return a web `ReadableStream` or an async generator: https://docs.nestjs.com/http/streaming-responses.md
- Shutting down with open streams: the HTTP server waits for open connections, so with a stream open `SIGTERM` doesn't stop the app (checked on Nest 12.5: still running 5 s later). Complete the streams in `beforeApplicationShutdown()`, which runs before the server closes (with `app.enableShutdownHooks()`); then it exits at once. `NestFactory.create(AppModule, { forceCloseConnections: true })` is the blunt alternative.

## Ending streams on revocation

```typescript
@Injectable()
export class StreamRevocations {
  private readonly revoked = new Subject<string>();
  /** Emits when `credentialId` is revoked. */
  until(credentialId: string) {
    return this.revoked.pipe(filter((id) => id === credentialId));
  }
  revoke(credentialId: string) {
    this.revoked.next(credentialId);
  }
}

// in the SSE handler: the response ends when this key (or session, or user) is revoked
return this.events.forUser(user.id).pipe(
  map((e): MessageEvent => ({ type: e.type, data: e.payload })),
  takeUntil(this.revocations.until(keyId)),
  finalize(() => this.events.release(user.id)),
);

// wherever the credential is revoked: API key deleted, session ended, user deleted
this.revocations.revoke(keyId);
```

Checked: after `DELETE`, the open response ends and `finalize()` runs. With several instances, publish revocations over Redis (or poll the credential's status) so the instance holding the stream hears it.
