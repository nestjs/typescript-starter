# @nestjs/authorization recipes

Tutorial and reference: https://docs.nestjs.com/security/authorization.md. Everything marked "checked" ran on Nest 12.5.1 with `@nestjs/authorization` 0.1.4 and `@nestjs/authentication` 0.1.6.

Contents: register, policies, `before()`, policies with services, route checks, record checks in services, 401 or 403, errors and events, another authentication, testing, production.

## Register

```typescript
@Module({
  imports: [
    AuthenticationModule.forRoot({ ... }), // first: its guard sets the user that authorization reads
    AuthorizationModule.forRoot(),          // global module + global guard
    NotesModule,
  ],
})
export class AppModule {}
```

- Global guards run in the order modules are scanned. With `AuthenticationModule` second, the app refuses to start.
- **Deny by default** (checked): a handler with no `@Can()`, `@Can.Anyone()` or `@Public()` answers 403 to a signed-in user (401 to a guest), and the startup log lists every such handler: `AuthorizationGuard denies every call to AuthController.me, ...: they declare no check`. Read that line after adding the module: it's the list of routes you just closed.

## Policies

```typescript
import { Policy, type PolicyBefore } from '@nestjs/authorization';

@Policy()
export class NotePolicy implements PolicyBefore<User> {
  constructor(private readonly quotas: QuotaService) {} // a policy is a provider: it can inject services

  // Runs ahead of every ability of this policy, on routes and in services alike.
  before(user: User | null) {
    if (user?.role === 'admin') return true; // true allows, false denies, nothing lets the ability decide
  }

  // Route abilities: the guard has no record, and may have a guest (null).
  create(user: User | null) {
    return !!user;
  }

  // Record abilities: called from the service with the record.
  edit(user: User, note: Note) {
    return note.ownerId === user.id;
  }

  // Abilities may be async; guard, authorize() and can() await them.
  async createMore(user: User, current: number) {
    return current < (await this.quotas.maxNotesFor(user));
  }
}
```

- An ability's first parameter is the user; it returns `boolean` or `Promise<boolean>`, and only a literal `true` allows.
- Register the policy in its feature module's `providers` with the services it injects; `@Policy()` makes it injectable and the module finds it anywhere.
- Policies must be singletons: a request-scoped policy, or one depending on a request-scoped provider, throws at startup. Pass per-request facts as arguments.
- `before()` skips every ability of its policy, including rules that should bind admins too ("nobody refunds a shipped order"). For those, check the ability name `before()` receives, or keep them in a policy without a bypass.
- Checked: with `before()` above, an admin creates past the quota (`createMore` never runs) and edits other users' notes; a user over the quota gets 403.

## Route checks

```typescript
@Controller('notes')
export class NotesController {
  @Post()
  @Can(NotePolicy, 'create') // the guard calls create(user) before the handler
  create(@Body({ schema: createNoteSchema }) body: CreateNote) { ... }

  @Get()
  @Can.Anyone() // anyone authentication lets through; the service decides what each caller sees
  list() { ... }

  // viewNotesOf(user: User | null, userId: string) in the policy: the third argument supplies userId
  @Get('users/:userId/notes')
  @Can(NotePolicy, 'viewNotesOf', (context) => [context.switchToHttp().getRequest().params.userId])
  listFor(@Param('userId') userId: string) { ... }
}
```

- `@Can()` is type-checked: a misspelt ability, or one that needs a record, doesn't compile on a route.
- The argument function runs in the guard, before pipes: params are raw strings. Pass ids, not records (loading the record in the guard loads it twice and answers 403 before the handler can answer 404).
- `@Can()` on the class applies to every method; `@Can.Anyone()` or `@Public()` on a method lifts it there.

## Record checks in services

```typescript
@Injectable()
export class NotesService {
  constructor(private readonly authorization: AuthorizationService, private readonly context: AuthenticationContext) {}

  async edit(id: string, changes: UpdateNote) {
    const user = this.context.requireUser();
    const note = await this.repository.findById(id);
    if (!note) throw new NotFoundException();                          // 404 first
    await this.authorization.authorize(NotePolicy, 'edit', user, note); // 403 (401 for a guest) when denied
    return this.repository.update(id, changes);
  }

  async list() {
    const user = this.context.requireUser();
    const notes = await this.repository.findVisibleTo(user); // filter in the query, not by checking every row
    return Promise.all(notes.map(async (note) => ({ ...note, canEdit: await this.authorization.can(NotePolicy, 'edit', user, note) })));
  }
}
```

- `authorize()` throws on a denial; `can()` resolves to `true` or `false` and never throws. Checked: `can()` flags come out per row (`one:true`, `admin0:false`).
- Each `can()` flag runs the ability once per row, async work included: cache slow lookups (limits, plans) per request.
- Re-check state when you write: two requests can both pass `authorize()` on a `paid` order. Make the write conditional (`UPDATE ... WHERE status = 'paid'`).
- Where existence is sensitive (sequential ids, other users' records), answer 404 instead of 403: scope the query by owner, so someone else's record is simply not found.

## 401 or 403

| Caller | Status | From |
| --- | --- | --- |
| No or bad credentials on a route that needs a user | 401 (`WWW-Authenticate`) | authentication, before any policy |
| Guest on an optional route, policy denies `null` | 401 | authorization: signing in might change the answer |
| Signed-in user, policy denies | 403 | authorization |

## Errors and events

- `authorize()` throws `AuthorizationError` (`reason: 'unauthenticated' | 'forbidden'`, `status`, `policy`, `ability`). Leaving a handler, it becomes `UnauthorizedException`/`ForbiddenException`, so a global exception filter shapes it. Thrown in your own guard or middleware, it isn't mapped and becomes a 500: use `can()` there.
- The 403 body doesn't name the ability. To know which check refused whom, subscribe to `AuthorizationEvents.events$` (checked: `forbidden:NotePolicy.createMore`, `forbidden:NotePolicy.administer`; guests stopped by authentication emit nothing here). `can()` returning `false` isn't a denial and emits nothing.

```typescript
@Injectable()
export class DenialLog implements OnModuleInit {
  private readonly logger = new Logger(DenialLog.name);
  constructor(private readonly events: AuthorizationEvents) {}
  onModuleInit() {
    this.events.events$.subscribe((e) => this.logger.warn('Denied', { policy: e.policy, ability: e.ability, reason: e.reason, userId: (e.user as User | null)?.id }));
  }
}
```

## Another authentication

- The guard reads the user from `request.user` (and the equivalents for WebSockets, microservices and GraphQL). With another authentication guard (Passport's `AuthGuard()`, your own), register it as `APP_GUARD` in a module imported before `AuthorizationModule`, never with `app.useGlobalGuards()` (those run after every `APP_GUARD`); the order check only goes by class names there, so it logs instead of refusing to start.
- User elsewhere: `AuthorizationModule.forRoot({ getUser: (context) => ... })`. Authentication with `@UseGuards()` per route: `forRoot({ globalGuard: false })` and `@UseGuards(MyAuthGuard, AuthorizationGuard)`.

## Testing

```typescript
// Unit: a policy is a plain class. Calling an ability directly skips before(); test before() on its own.
const quotas = new QuotaService();
const policy = new NotePolicy(quotas);
vi.spyOn(quotas, 'maxNotesFor').mockResolvedValue(1);
expect(await policy.createMore(alice, 0)).toBe(true);
expect(await policy.createMore(alice, 1)).toBe(false);
expect(policy.before({ ...alice, role: 'admin' })).toBe(true);

// Service: the real policy and module, no HTTP. A denial stays an AuthorizationError outside a handler.
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

Checked with Vitest on the scaffold's config. End-to-end, sign in through the real route and check one allowed and one denied request per rule; `.overrideProvider(NotePolicy).useValue(...)` replaces a policy everywhere at once.

## Production

- Review every `@Can.Anyone()`: it opens the route to everyone authentication lets through, so its service must authorize.
- Don't cache responses by URL on routes that check records: `CacheInterceptor` answers before the handler, so it would serve one user's record to another without asking the policy.
- Hybrid apps: `connectMicroservice(..., { inheritAppConfig: true })`, or `@Can()` on message handlers isn't enforced.
- Put record checks in services, not controllers, so HTTP handlers, resolvers and queue workers share them.
