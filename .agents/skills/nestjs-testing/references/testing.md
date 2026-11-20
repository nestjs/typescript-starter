# Testing recipes

Every recipe here ran with Vitest 4 on the configuration `nest new` generates (Nest 12.5.1, `@nestjs/authentication` 0.1.6, `@nestjs/authorization` 0.1.4, `@nestjs/throttler` 6.8.0, Supertest). Docs: https://docs.nestjs.com/fundamentals/testing.md; testing sections of `/security/authentication` and `/security/authorization`.

## A unit test with the container

```typescript
import { Test } from '@nestjs/testing';
import { vi } from 'vitest';
import { NotesService } from './notes.service.js';
import { NotesRepository } from './notes.repository.js';

describe('NotesService', () => {
  const repository = { findById: vi.fn(), update: vi.fn() };
  let service: NotesService;

  beforeEach(async () => {
    vi.resetAllMocks();
    const moduleRef = await Test.createTestingModule({
      providers: [NotesService, { provide: NotesRepository, useValue: repository }],
    }).compile();
    service = moduleRef.get(NotesService);
  });

  it('answers 404 for a missing note', async () => {
    repository.findById.mockResolvedValue(null);
    await expect(service.rename('n1', 'x')).rejects.toThrow(NotFoundException);
    expect(repository.update).not.toHaveBeenCalled();
  });
});
```

`useMocker((token) => ...)` stubs every dependency you didn't list, for classes with many collaborators.

## Policies and services with the real authorization

```typescript
// A policy is a class: construct it. Calling an ability directly skips before(); test before() too.
const quotas = new QuotaService();
const policy = new NotePolicy(quotas);
vi.spyOn(quotas, 'maxNotesFor').mockResolvedValue(1);
expect(await policy.createMore(alice, 0)).toBe(true);
expect(await policy.createMore(alice, 1)).toBe(false);
expect(policy.before({ ...alice, role: 'admin' })).toBe(true);

// A service with the real policy and module, no HTTP: a denial stays an AuthorizationError here.
const moduleRef = await Test.createTestingModule({
  imports: [AuthorizationModule.forRoot()],
  providers: [
    NotesService,
    NotePolicy,
    { provide: QuotaService, useValue: { maxNotesFor: vi.fn().mockResolvedValue(0) } },
    { provide: AuthenticationContext, useValue: { requireUser: () => alice } },
  ],
}).compile();
await expect(moduleRef.get(NotesService).create('x')).rejects.toMatchObject({ reason: 'forbidden', ability: 'createMore' });
```

## End to end

```typescript
// test/notes.e2e-spec.ts
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AuthenticationContext, PasswordHasher, TokenService } from '@nestjs/authentication';
import { ThrottlerGuard } from '@nestjs/throttler';
import request from 'supertest';
import { configureApp } from '../src/app.setup.js';

describe('Notes (e2e)', () => {
  let app: INestApplication;
  const dir = mkdtempSync(join(tmpdir(), 'e2e-'));

  beforeAll(async () => {
    process.env.DATABASE_FILE = join(dir, 'test.db');
    const { AppModule } = await import('../src/app.module.js'); // after the env: module options read it on import
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PasswordHasher)
      .useValue(new PasswordHasher({ logN: 10 }))
      .overrideProvider(ThrottlerGuard) // works when the app registers it with useExisting (below)
      .useValue({ canActivate: () => true })
      .compile();
    app = moduleRef.createNestApplication();
    configureApp(app); // the same pipes, filters and prefix as main.ts
    await app.init(); // no port needed
  });

  afterAll(async () => {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  });

  const tokenFor = async (email: string) => {
    const user = await app.get(UsersRepository).create(email, 'unused-hash');
    const { accessToken } = await app.get(TokenService).issue(String(user.id)); // no sign-in route needed
    return `Bearer ${accessToken}`;
  };

  it('signs in through the real route', async () => {
    await request(app.getHttpServer()).post('/auth/sign-up').send({ email: 'a@test.io', password: 'correct horse battery' }).expect(201);
    const { body } = await request(app.getHttpServer()).post('/auth/token').send({ email: 'a@test.io', password: 'correct horse battery' }).expect(200);
    await request(app.getHttpServer()).get('/me').set('authorization', `Bearer ${body.accessToken}`).expect(200);
  });

  it('rejects a note without a title', async () => {
    await request(app.getHttpServer()).post('/notes').set('authorization', await tokenFor('b@test.io')).send({}).expect(400);
  });

  it('runs service code as a user, without HTTP', async () => {
    const user = await app.get(UsersRepository).create('c@test.io', 'unused-hash');
    const note = await app.get(AuthenticationContext).run({ user }, () => app.get(NotesService).create('from a test'));
    expect(note.ownerId).toBe(user.id);
  });
});
```

## Replacing a global guard

```typescript
// app module (or the rate-limit module)
providers: [
  ThrottlerGuard,                                   // a provider of its own...
  { provide: APP_GUARD, useExisting: ThrottlerGuard }, // ...that the global guard points at
],
```

Checked with a limit of 1 request: with this registration, `.overrideProvider(ThrottlerGuard).useValue({ canActivate: () => true })` let three requests through. With `{ provide: APP_GUARD, useClass: ThrottlerGuard }`, the second request was a 429 under `.overrideGuard(ThrottlerGuard)` and under `.overrideProvider(ThrottlerGuard)` alike: the `useClass` instance belongs to the `APP_GUARD` token, which neither override reaches. `.overrideGuard()` is for guards bound with `@UseGuards()`.

## Server-Sent Events

```typescript
it('streams three ticks', async () => {
  const res = await request(app.getHttpServer())
    .get('/stream')
    .buffer(true)
    .parse((response, done) => {
      let text = '';
      response.on('data', (chunk: Buffer) => (text += chunk));
      response.on('end', () => done(null, text));
    });
  expect(res.status).toBe(200);
  expect((res.body as string).match(/event: tick/g)).toHaveLength(3);
});
```

This works for a stream that completes. For an endless one, listen on a port (`await app.listen(0)`), read with `fetch()` and its body reader, and abort the request once the events you expect have arrived.

## Databases

- A temporary file per test file (above), or a schema per file on PostgreSQL; PGlite runs PostgreSQL in-process with no server (`drizzle-orm/pglite`). Apply the real migrations, not `synchronize`, so the tests check them too.
- Override the database provider when the module creates it from config you can't set early: `.overrideProvider(getDrizzleToken()).useValue(testDb)`.
- Clean up between tests by deleting what each test created, or use a fresh database per file; avoid tests that depend on each other's rows.
