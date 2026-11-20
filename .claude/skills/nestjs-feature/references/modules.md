# Modules, providers and scopes

Docs: https://docs.nestjs.com/modules.md, https://docs.nestjs.com/fundamentals/custom-providers.md, https://docs.nestjs.com/fundamentals/injection-scopes.md, https://docs.nestjs.com/faq/common-errors.md. Each behaviour marked "checked" was run on Nest 12.5.

## One instance per module that lists it

```typescript
@Module({ providers: [Counter, A], exports: [A] }) class ModA {}
@Module({ providers: [Counter, B], exports: [B] }) class ModB {}
// A and B get two different Counter instances: state set through one isn't seen by the other (checked).
```

Share a provider by listing it in one module, exporting it, and importing that module wherever it's injected:

```typescript
@Module({ providers: [Counter], exports: [Counter] }) class CounterModule {}
@Module({ imports: [CounterModule], providers: [A], exports: [A] }) class ModA {}
```

`@Global()` makes a module's exports injectable everywhere without importing it. Keep it for app-wide infrastructure (config, database, logging); a global feature module hides who depends on what.

## Dynamic modules

`XModule.forRoot(options)` configures a package once, in the root module; `XModule.forFeature(...)` (TypeORM repositories, for example) or a plain import gives feature modules what they need. Use `forRootAsync({ imports: [ConfigModule], inject: [ConfigService], useFactory: (config) => ({...}) })` when options come from configuration; `forRoot({...})` evaluates its argument when the file is imported.

## Tokens for things that aren't classes

```typescript
export const NOTES_REPOSITORY = Symbol('NOTES_REPOSITORY');

@Module({
  providers: [
    { provide: NOTES_REPOSITORY, useClass: SqlNotesRepository }, // or useValue / useFactory
    NotesService,
  ],
})
export class NotesModule {}

@Injectable()
export class NotesService {
  constructor(@Inject(NOTES_REPOSITORY) private readonly repository: NotesRepository) {} // NotesRepository: an interface
}
```

An interface or type alias doesn't exist at run time, so injecting one without `@Inject(token)` fails at startup with `?` at that parameter's index.

## `import type` and dependency injection

Nest reads constructor parameter types from decorator metadata at run time. `import type { NotesService }` erases it, and the app stops with `Nest can't resolve dependencies of the NotesController (?). Please make sure that the argument Function at index [0] ...` (checked). Use a value import for every class you inject, and turn off auto-fixes (`consistent-type-imports`) that rewrite them.

The reverse also holds under `isolatedModules` (the scaffold's default): a type used only in a decorated signature, such as `Request` from express or `RawBodyRequest`, must be imported with `import type`, or `tsc` stops with TS1272 (checked).

## Scopes

- Providers are singletons by default: one instance for the app, created at startup. Keep per-request data out of their fields.
- `@Injectable({ scope: Scope.REQUEST })` creates an instance per request, and the scope bubbles up: every provider and controller that injects it becomes request-scoped too, with an instance per request for the whole chain.
- Lifecycle hooks (`onModuleInit`, `onApplicationBootstrap`, `onModuleDestroy`, ...) are never called on request-scoped classes (checked: 0 calls).
- A `@Cron()`, `@Interval()` or `@Timeout()` method in a class that depends on a request-scoped provider is never scheduled: `@nestjs/schedule` only schedules classes whose dependency tree is static, and logs a warning for the rest.
- WebSocket gateways (Nest 12+) can depend on request-scoped providers: the scope is then the connection, one instance per connected socket, so it can hold per-connection state (docs: `/websockets/gateways`, "Request-scoped gateways").
- For "who is calling" inside services, inject a context instead of a request-scoped provider: `AuthenticationContext` from `@nestjs/authentication`, or `AsyncLocalStorage` (`nestjs-cls`, docs: `/recipes/async-local-storage`).

## Circular dependencies

Two modules that import each other, or two providers that inject each other, fail at startup or inject `undefined`. Move what both need into a third module. `forwardRef(() => OtherModule)` on both sides works, but it hides a design problem and makes the order of initialization matter.

## Startup work

- `onModuleInit()`: after the module's providers are created; `onApplicationBootstrap()`: after every module is initialized. Both may be `async`, and Nest waits for them before listening.
- Work that needs another module's provider to be ready goes in `onApplicationBootstrap()`.
- An async factory (`useFactory: async () => ...`) delays everything that injects it until it resolves: the place for "connect, then migrate".
