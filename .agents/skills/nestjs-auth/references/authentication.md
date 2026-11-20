# @nestjs/authentication recipes

Full tutorial and reference: https://docs.nestjs.com/security/authentication.md (about 200 KB: fetch it and read the section you need). Imports are from `@nestjs/authentication` unless shown otherwise; ESM projects end relative imports in `.js`.

Everything marked "checked" ran in one app on Nest 12.5.1, `@nestjs/authentication` 0.1.6, `@nestjs/authorization` 0.1.4 and `@nestjs/jwt` 12.0.5: sessions, bearer tokens with refresh, API keys, the context service and the restrictions below.

Contents: how it fits together, the user type, password sign-in, sessions, bearer tokens, a secret the task fixes, API keys, reading the user in services, route options, production, testing, mistakes.

## How it fits together

- `AuthenticationModule.forRoot({...})` (or `forRootAsync()`) takes plain values only: lifetimes, secrets, URLs. It registers a **global guard**: every route answers 401 without credentials. `@Public()` (route or controller) skips authentication; `@Authenticate({ optional: true })` lets anonymous callers in with `user === null`.
- **Credential providers** are your own `@Injectable()` classes extending `SessionCookieProvider`, `JwtBearerProvider`, `ApiKeyProvider`, or `AuthenticationProvider` for anything else. Each registers itself in its constructor: `registry.registerProvider(this, { order })`. The guard asks them in ascending `order`; the first that returns a user wins. Two providers with the same order fail at startup.
- `validate()` (or `findKey()`) runs on every request and loads the current user, so a deleted user or a changed role takes effect at once. Keep roles out of token claims.
- Lifetimes are milliseconds or strings (`'15m'`, `'14d'`). `3600` is 3.6 seconds; a numeric lifetime under a minute logs a warning.

```typescript
// Tell the package your user type once; @CurrentUser(), AuthenticationContext and the providers follow it.
declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: User;
    // refreshTokens: false;  // with `refreshToken: false`, so issue() is typed without one
  }
}
```

## Password sign-in

```typescript
@Injectable()
export class CredentialsService {
  constructor(private readonly users: UsersRepository, private readonly passwordHasher: PasswordHasher) {}

  async register(email: string, password: string) {
    // Insert and map the unique violation to 409 (see nestjs-data); a lookup first races.
    return this.users.create(email, await this.passwordHasher.hash(password));
  }

  /** The user, or null when the email or the password is wrong. */
  async verify(email: string, password: string) {
    const found = await this.users.findCredentials(email); // { user, passwordHash } | null
    // No account: verify() checks a dummy hash, so the timing doesn't reveal which emails exist.
    const valid = await this.passwordHasher.verify(password, found?.passwordHash);
    if (!valid || !found) return null;
    if (this.passwordHasher.needsRehash(found.passwordHash)) {
      await this.users.updatePasswordHash(found.user.id, await this.passwordHasher.hash(password));
    }
    return found.user;
  }
}
```

- Keep the hash inside the repository: everything else gets a user without it, so it can't leak into a response or a log.
- Answer a wrong password and an unknown email identically (same status, same body). Sign-up can still reveal that an address exists (409); if that matters, answer sign-up the same way too and email the owner instead.
- `hash()` refuses an empty password and one over 4 KiB; length and strength rules are yours (validate at sign-up, not at sign-in, so passwords set under older rules still work).
- Throttle sign-in and token routes per IP and per account (`nestjs-production`, and "Rate-limit sign-in" in the docs).

## Sessions (browser apps)

```typescript
@Injectable()
export class SessionAuth extends SessionCookieProvider<User> {
  constructor(private readonly users: UsersRepository, registry: AuthenticationRegistry) {
    super();
    registry.registerProvider(this); // order 0
  }
  validate(session: SessionRecord) {
    return this.users.findById(session.userId); // null ends the session
  }
}

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly credentials: CredentialsService, private readonly signInService: SignInService) {}

  @Post('sign-in')
  @HttpCode(200)
  async signIn(@Body({ schema: credentialsSchema }) body: Credentials) {
    const user = await this.credentials.verify(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    const { session } = await this.signInService.signIn(user.id, { method: 'password' }); // sets the cookie itself
    return { mfaRequired: session.mfa === 'pending' };
  }

  @Post('sign-out')
  @HttpCode(204)
  async signOut() {
    if (!(await this.signInService.signOut())) throw new UnauthorizedException(); // no session cookie
  }
}
```

- `signIn()` creates the session, sets the cookie (`__Host-sid`: `HttpOnly`, `Secure`, `SameSite=Lax`), drops the browser's previous session (session fixation) and refuses a sign-in posted from another site (403).
- Locally over plain HTTP on a host other than `localhost`, set `session: { cookie: { secure: false } }`; the cookie is then named `sid` (checked).
- `SessionService.list(userId)` and `revoke(sessionId, { userId })` for a "where you're signed in" page; `signInService.signOutEverywhere(userId)` ends every session and refresh token. Rotate with `signInService.rotateSession()` after a privilege change.
- Cross-origin writes don't count as signed in. A web app on another origin goes in `session.trustedOrigins`; on Nest 12.1+ also call `app.enableCsrfProtection()`.

## Bearer tokens you issue (secret of 32+ bytes)

Checked on 0.1.6: with a 12-byte key the app stops at startup (`the key is not a valid HS256 key; HS256 needs a secret of at least 32 bytes`); with a 32-byte key the code below signs in and authenticates.

```typescript
// app.module.ts
AuthenticationModule.forRoot({
  accessToken: { key: process.env.JWT_SECRET!, ttl: '15m' }, // issuer and audience are optional, checked when set
  // refreshToken: false,  // bearer-only APIs that make clients sign in again: no refresh-token store needed
}),

@Injectable()
export class JwtAuth extends JwtBearerProvider<User> {
  constructor(private readonly users: UsersRepository, registry: AuthenticationRegistry) {
    super(); // verifies with the module's accessToken options
    registry.registerProvider(this, { order: 1 });
  }
  validate({ sub }: JwtClaims) {
    return sub ? this.users.findById(sub) : null; // sub is a string: convert it for numeric ids
  }
}

@Public()
@Controller('auth/token')
export class TokensController {
  constructor(private readonly credentials: CredentialsService, private readonly tokens: TokenService) {}

  @Post()
  @HttpCode(200)
  async issue(@Body({ schema: credentialsSchema }) body: Credentials) {
    const user = await this.credentials.verify(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid email or password');
    return this.tokens.issue(String(user.id), { method: 'password' }); // { accessToken, expiresIn, refreshToken }
  }

  @Post('refresh')
  @HttpCode(200)
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.tokens.refresh(refreshToken); // a new pair; an unknown, expired or reused token is a 401
  }

  @Post('revoke')
  @HttpCode(204)
  async revoke(@Body('refreshToken') refreshToken: string) {
    await this.tokens.revoke(refreshToken); // same answer for unknown tokens (RFC 7009)
  }
}
```

- Checked: refreshing works once per token. Reusing a spent refresh token is a 401 and revokes its whole family, so the newer token from the same sign-in stops working too: whoever stole one, both parties must sign in again.
- Access tokens stay valid until they expire, even after sign-out everywhere: keep them short (`15m`).
- A request with no credentials gets 401 with `errorCode: 'missing_credentials'` and `WWW-Authenticate: Bearer`; a bad or expired token gets 401 with an RFC 6750 `error="invalid_token"` challenge, which tells clients to refresh.

## A secret the task fixes

`accessToken.key` refuses an HS256 secret under 32 bytes. When the secret is given (an environment variable with a short default, a value other services verify with), keep it and don't transform it. Sign with `@nestjs/jwt` (`npm i @nestjs/jwt`), and verify through your own provider, so the global guard, `@Public()` and `@CurrentUser()` keep working. Checked on Nest 12.5 with `@nestjs/authentication` 0.1.6 and `@nestjs/jwt` 12.0.5, with an 11-byte secret: tokens signed elsewhere with the raw secret verify, a forged one gets 401.

```typescript
// app.module.ts
@Module({
  imports: [
    AuthenticationModule.forRoot({}), // no accessToken: this app's tokens come from @nestjs/jwt
    JwtModule.register({ secret: process.env.JWT_SECRET!, signOptions: { expiresIn: '15m' } }), // the secret as given: no padding, no hashing
    // ...
  ],
  providers: [JwtAuth],
})
export class AppModule {}
```

```typescript
// jwt-auth.provider.ts
import { Injectable, type ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationError, AuthenticationProvider, AuthenticationRegistry } from '@nestjs/authentication';

@Injectable()
export class JwtAuth extends AuthenticationProvider<User> {
  constructor(private readonly jwt: JwtService, private readonly users: UsersRepository, registry: AuthenticationRegistry) {
    super();
    registry.registerProvider(this);
  }

  async authenticate(context: ExecutionContext) {
    const header = this.header(context, 'authorization');
    if (!header?.startsWith('Bearer ')) return null; // no credentials: the guard answers 401
    let sub: number;
    try {
      ({ sub } = await this.jwt.verifyAsync<{ sub: number }>(header.slice(7))); // HS256, checks exp
    } catch {
      throw new AuthenticationError('Invalid or expired token'); // 401
    }
    const user = await this.users.findById(sub); // current user and role, on every request
    if (!user) throw new AuthenticationError('Invalid or expired token');
    return { user };
  }

  challenge() {
    return 'Bearer'; // WWW-Authenticate on a 401
  }
}
```

Sign in with `PasswordHasher.verify()` as above, then `return { accessToken: await this.jwt.signAsync({ sub: user.id }) }`. Tell the user the secret is too short for production use.

## API keys

```typescript
@Injectable()
export class ApiKeyAuth extends ApiKeyProvider<User> {
  constructor(private readonly keys: ApiKeysRepository, private readonly users: UsersRepository, registry: AuthenticationRegistry) {
    super({ prefix: 'acme' }); // keys look like acme_<id>_<secret>; the prefix lets secret scanners find leaks
    registry.registerProvider(this, { order: 2 });
  }

  // Called with the id part of a key; the provider compares the SHA-256 in constant time and checks expiresAt.
  async findKey(id: string) {
    const key = await this.keys.findById(id);
    const user = key && (await this.users.findById(key.userId));
    return user ? { hash: key.hash, user, expiresAt: key.expiresAt } : null; // null: unknown, revoked, or owner gone
  }
}

// Managed with a session only: a leaked key can't create more keys or revoke its owner's.
@Authenticate({ providers: [SessionAuth] })
@Controller('api-keys')
export class ApiKeysController {
  constructor(private readonly apiKeyAuth: ApiKeyAuth, private readonly keys: ApiKeysRepository) {}

  @Post()
  async create(@CurrentUser('id') userId: string) {
    const { key, id, hash } = this.apiKeyAuth.generate();
    const expiresAt = new Date(Date.now() + 365 * 24 * 3600 * 1000);
    await this.keys.insert({ id, userId, hash, expiresAt }); // store the hash, never the key
    return { id, key, expiresAt }; // the only response that ever contains the key
  }

  @Delete(':id')
  @HttpCode(204)
  async revoke(@CurrentUser('id') userId: string, @Param('id') id: string) {
    if (!(await this.keys.delete({ id, userId }))) throw new NotFoundException(); // another user's key: 404
  }
}
```

- Checked: a key sent as `Authorization: Bearer acme_...` signs its owner in; on `@Authenticate({ providers: [SessionAuth] })` routes it's a 401 (so is a valid JWT); after `DELETE` the same key is a 401 on the next request.
- `@CurrentSession()` on a key request is `{ keyId, expiresAt, method: 'api-key' }`: log `keyId` to know which key did what. Keys never satisfy `@Authenticate({ mfa: true })`.
- Scopes or per-key limits: store them with the key, return them from `findKey()` through your own user or session shape, and check them in a policy.
- A key in another header (`X-API-Key`) needs your own `AuthenticationProvider` that reads `this.header(context, 'x-api-key')`, looks the key up by its SHA-256, throws `AuthenticationError` when it's unknown, and returns `{ user, session: { keyId } }`.
- Open event streams keep running after a key is revoked: end them (`nestjs-feature`, `references/http.md`, "Ending streams on revocation").

## Reading the user

- In controllers: `@CurrentUser()`, `@CurrentUser('id')` for one property, `@CurrentSession()` for the provider's session (checked shapes: a cookie session's `{ id, userId, createdAt, lastActiveAt, expiresAt }`, a JWT's claims, an API key's `{ keyId, expiresAt, method }`).
- In services: inject `AuthenticationContext` and call `requireUser()` (throws `AuthenticationError`, a 401 under a handler) or read `.user` (`null` for a guest). `run(result, fn)` runs code as a user outside a request: queue workers, cron jobs, tests. It's a singleton backed by `AsyncLocalStorage`, correct across concurrent requests and in anything the handler awaits (checked). No request-scoped providers needed.

## Route options

`@Authenticate({...})` on a class or method:

| Option | Effect |
| --- | --- |
| `optional: true` | Anonymous callers get through with `null`; bad credentials are still a 401. |
| `providers: [SessionAuth]` | Only these providers may authenticate the route; other credentials count as none (checked). |
| `mfa: true` | Requires a verified second factor (API keys never qualify). |
| `verifiedEmail: true` | Requires `emailVerified`; 403 `email_unverified` otherwise. |

## Production

- Stores: sessions, refresh tokens and the other features' state live in memory until you register a store (`AuthenticationStorage.registerSource()` with `sessions`, `refreshTokens`, `mfa`, `magicLinks`, `oidcStates`, `emailTokens`). With `NODE_ENV=production` the module refuses to start on in-memory stores that a configured feature uses. The docs' "Keep sessions and tokens in your database" builds a Drizzle store and ships contract tests to run against yours.
- Audit: `AuthenticationEvents.events$` (and diagnostics channels `nestjs:authentication:<type>`) emits `sign-in`, `sign-out`, `refresh-token-reused`, `mfa-failed`, `password-reset-requested` and more. Alert on `refresh-token-reused`.
- Secrets from a secret manager; HTTPS (the session cookie is `Secure`); `trustedOrigins` for a web app on another origin.

## Testing

- `.overrideProvider(PasswordHasher).useValue(new PasswordHasher({ logN: 10 }))`: the default cost is ~0.3 s and 128 MiB per hash.
- Sign a test user in without the sign-in route: `await app.get(TokenService).issue(user.id)` returns a bearer token; `SessionService.create()` a session cookie (checked for tokens).
- Run service code as a user without HTTP: `app.get(AuthenticationContext).run({ user }, () => service.create(...))` (checked).
- Keep one e2e test that signs in through the real route and calls a protected one: it catches a wrong guard order or a provider that never registered.

## Mistakes

- Returning early for an unknown email (`if (!user) throw`) before checking the password: the timing reveals which emails exist.
- `@Post()` sign-in without `@HttpCode(200)`.
- Hashing, padding or deriving a 32-byte key from a short secret: tokens no longer verify with the configured secret.
- Putting roles or permissions in token claims, then trusting them after they change.
- Forgetting `@Public()` on sign-up/sign-in (every route is closed by default), or putting it on a whole controller that also has private routes.
- Checking keys or tokens with `===` instead of the package's constant-time comparison; storing keys or refresh tokens in plaintext.
