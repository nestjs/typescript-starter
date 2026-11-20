---
name: nestjs-testing
description: Unit, service and end-to-end tests for a NestJS application with @nestjs/testing - Test.createTestingModule, mocking and overriding providers and global guards, Supertest against the real app, signing test users in, SSE, test databases, Vitest in ESM projects (Jest in CommonJS ones). Use when writing, running or fixing tests in a NestJS application.
license: MIT
---

# Testing a NestJS app

Docs: https://docs.nestjs.com/fundamentals/testing.md. Recipes, each run with Vitest on the scaffold's config: [references/testing.md](references/testing.md).

**Scope first.** When the task says how to test, do that. When it says nothing, cover the behaviour you changed with focused tests (a unit test for a policy or a service rule, one e2e test per new route and its main error) rather than broad e2e suites, and verify the rest by running the app.

## Pick the level

| What | How | Speed |
| --- | --- | --- |
| A policy, a pure function, a mapper | `new NotePolicy(fakeQuotas)`: no Nest at all | ms |
| A service's rules | `Test.createTestingModule({ providers: [NotesService, { provide: NotesRepository, useValue: { findById: vi.fn() } }] })` | ms |
| A service with the real policies | the above plus `imports: [AuthorizationModule.forRoot()]` and a stub `AuthenticationContext` | ms |
| A route as clients see it | `imports: [AppModule]`, Supertest on `app.getHttpServer()`, a fresh database | 100s of ms |

## Runner

- Projects from `nest new` are ESM with **Vitest** (`globals: true`): `npm test` runs `src/**/*.spec.ts`, `npm run test:e2e` runs `test/**/*.e2e-spec.ts`. Mocks are `vi.fn()`/`vi.spyOn()`; relative imports end in `.js`. One file: `npx vitest run src/notes/notes.service.spec.ts`; one test: add `-t "name"`.
- CommonJS projects use Jest (`jest.fn()`). Follow the project's `package.json`.

## Rules that save debugging time

- **The testing app doesn't run `main.ts`.** Pipes, filters, prefixes and versioning set there are missing in tests: put them in one `configureApp(app)` that `main.ts` and the tests both call, or register them as `APP_PIPE`/`APP_FILTER` providers.
- **Module options are read when the module file is imported.** Set env variables (database path, secrets) in the Vitest config's `test.env`, or import `AppModule` dynamically after setting them.
- **A global guard registered with `useClass` can't be replaced in tests.** Neither `.overrideGuard(ThrottlerGuard)` nor `.overrideProvider(ThrottlerGuard)` touches `{ provide: APP_GUARD, useClass: ThrottlerGuard }` (checked). Register it as `ThrottlerGuard` plus `{ provide: APP_GUARD, useExisting: ThrottlerGuard }`, then `.overrideProvider(ThrottlerGuard).useValue({ canActivate: () => true })` works. Or keep the guard and give tests a limit they won't reach.
- **Sign users in cheaply.** Override `PasswordHasher` with `new PasswordHasher({ logN: 10 })` (the default costs ~0.3 s and 128 MiB per hash); mint a bearer token with `app.get(TokenService).issue(user.id)`; run service code as a user with `app.get(AuthenticationContext).run({ user }, fn)`. Keep one test that signs in through the real route.
- **One database per test file.** Vitest runs files in parallel: a shared SQLite file or schema makes them interfere. Create a temporary file (or schema) per file, apply the migrations, delete it afterwards.
- **No ports, no leftovers.** `await app.init()` and `request(app.getHttpServer())` need no port; `afterAll(() => app.close())` closes connections and timers. Leave no server or watcher running when you finish.
- **Time-dependent code** (reminders, expiry, rate windows): inject a clock or the delay, rather than sleeping in tests.
- **Test what the client sees** in e2e tests: status codes, bodies, headers. Assert the exact status the contract names (`expect(201)` on a create, `expect(200)` on a sign-in), which also catches `@Post()`'s default 201.

## When tests fail to start

- `Nest can't resolve dependencies of NotesService (?)` in a unit test: the testing module lacks a provider. Add a `useValue` stub for it, or `useMocker(() => ({}))` for everything missing.
- The app works but the test module doesn't: something is registered in `main.ts` only (see above), or env variables are read before the test sets them.
