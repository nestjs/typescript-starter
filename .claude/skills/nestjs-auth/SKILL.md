---
name: nestjs-auth
description: Sign-in, sessions, bearer tokens, API keys and permissions in a NestJS application with the first-party @nestjs/authentication and @nestjs/authorization packages - timing-safe password checks, a global guard with @Public(), policies with @Can(), and what to do when a task fixes the JWT secret or token format. Use when adding or changing authentication or authorization in a NestJS application.
license: MIT
---

# Authentication and authorization in NestJS

Use the first-party packages rather than assembling auth from `@nestjs/jwt`, Passport and bcrypt:

```bash
npm i @nestjs/authentication @nestjs/authorization
```

- `@nestjs/authentication` (docs: https://docs.nestjs.com/security/authentication.md): a global guard that puts every route behind sign-in, `@Public()` to open one, `@Authenticate({ optional: true })`, `@CurrentUser()`, `PasswordHasher` (scrypt), sessions, `TokenService` (JWT access + rotating refresh tokens), `ApiKeyProvider`, TOTP, magic links, OIDC. No third-party dependencies.
- `@nestjs/authorization` (docs: https://docs.nestjs.com/security/authorization.md): policies as providers, `@Can(Policy, 'ability')` on routes, `AuthorizationService.authorize()` in services. Denies a route that declares no check.

## Rules that matter

- **Check passwords with `PasswordHasher.verify(password, found?.passwordHash)`**, and only then decide. With no user it checks a dummy hash, so an unknown email takes as long as a wrong password. Never `if (!user) throw` before the hash check: the faster answer tells anyone which emails are registered. Hash with `passwordHasher.hash()`; inject `PasswordHasher` (the module provides it).
- **Sign-in is `@Post()` + `@HttpCode(200)`**: it creates nothing, so not 201.
- **`accessToken.key` must be at least 32 bytes** for HS256 (`openssl rand -base64 32`); a shorter one stops the app at startup. Never hash, pad or derive a longer key from a short secret: tokens are then signed with a different key, and anything that verifies them with the configured secret rejects them.
- **When the task fixes the secret or the token format** (a given `JWT_SECRET`, a default value, tokens other services verify), keep it exactly. If it's under 32 bytes, sign and verify with `@nestjs/jwt` using that secret, and plug verification into `@nestjs/authentication` as your own `AuthenticationProvider`, so the global guard, `@Public()` and `@CurrentUser()` still work. Say in your summary that the secret is too short for production. Code: [references/authentication.md](references/authentication.md#a-secret-the-task-fixes).
- **Refresh tokens rotate and detect theft.** `TokenService.refresh()` spends each refresh token; a reused one is a 401 and revokes its whole family, so the client must sign in again. Access tokens stay valid until they expire: keep `ttl` short.
- **Services read the user from `AuthenticationContext`** (`requireUser()`), a singleton backed by `AsyncLocalStorage`: no request-scoped providers, and `run({ user }, fn)` for workers and tests.
- **Load the user on every request** in the provider's `validate()`/`authenticate()`, and read roles from it, not from token claims: a role change or a deleted user then takes effect at once.
- **Global guards run in import order**: import `AuthenticationModule` before `AuthorizationModule` (the app refuses to start otherwise). A custom guard that sets `request.user` goes in as `APP_GUARD` before `AuthorizationModule`.
- **`@nestjs/authorization` denies every route that declares nothing**: once `AuthorizationModule` is imported, a signed-in user gets 403 on any handler without `@Can()`, `@Can.Anyone()` or `@Public()` (the startup log lists them). Adding it to an existing app, put `@Can.Anyone()` on routes any signed-in user may call (e.g. `GET /me`, the user's own resources) and re-test them.
- **401 vs 403**: no or bad credentials is 401 (the guard's), signed in but not allowed is 403 (`@Can()` or `ForbiddenException`).
- **Streams authenticate once.** An open SSE or WebSocket connection keeps its user after the token, API key or session is revoked, or the user is deleted. It is easy to miss. End the stream when its credential is revoked: `takeUntil()` on a revocation signal, shown in `nestjs-feature`'s `references/http.md`.
- **Response bodies.** The guard's 401 is an `HttpException` (`{ statusCode, message, errorCode }` plus a `WWW-Authenticate` header): a global exception filter can reshape it like any other error.
- **Cost.** At its default cost a hash takes ~0.3 s and 128 MiB, on the libuv threadpool. Tests override it: `.overrideProvider(PasswordHasher).useValue(new PasswordHasher({ logN: 10 }))`. Throttle sign-in (`nestjs-production`).
- **In-memory stores.** Sessions and refresh tokens live in memory until you register a store, and with `NODE_ENV=production` the module refuses to start that way. A bearer-only API can turn refresh tokens off: `refreshToken: false`.

## Pick the setup

| The app needs | Use |
| --- | --- |
| Bearer JWTs it issues itself, secret up to you | `accessToken` options + `JwtBearerProvider` + `TokenService.issue()` |
| A secret or token format fixed by the task | `@nestjs/jwt` + your own `AuthenticationProvider` |
| Browser sessions | `SessionCookieProvider` + `SignInService.signIn()` |
| Keys for scripts and partners | `ApiKeyProvider` (keys `prefix_<id>_<secret>`, stored as SHA-256) or your own provider for another header; manage keys only from a session (`@Authenticate({ providers: [SessionAuth] })`), so a leaked key can't mint more |
| Roles or ownership checks | `@nestjs/authorization` policies |

Code for each row, checked against `@nestjs/authentication` 0.1.6 and `@nestjs/authorization` 0.1.4: [references/authentication.md](references/authentication.md), [references/authorization.md](references/authorization.md).
