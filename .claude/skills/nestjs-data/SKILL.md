---
name: nestjs-data
description: Databases in a NestJS application with the first-party @nestjs/drizzle and @nestjs/typeorm integrations - registering the database, injecting it into services, schemas or entities, migrations, transactions, and writes that stay correct under concurrent requests. Use when adding or changing persistence in a NestJS application.
license: MIT
---

# Persistence in a NestJS app

Nest integrates the common ORMs; pick one per app and keep queries in services or repositories, not controllers.

| | Package | Docs |
| --- | --- | --- |
| Drizzle (SQL-like, schema in TypeScript, no classes) | `@nestjs/drizzle` + `drizzle-orm@rc` (v1) | https://docs.nestjs.com/data/drizzle.md |
| TypeORM (entity classes, repositories) | `@nestjs/typeorm` + `typeorm` | https://docs.nestjs.com/data/typeorm.md |
| Prisma, MongoDB (Mongoose), Sequelize, MikroORM | | `/data/prisma`, `/data/mongodb`, ... |

If the project already uses one, keep it.

## Drizzle

```typescript
DrizzleModule.forRoot({ drizzle, connection }) // drizzle(): your driver's, e.g. from 'drizzle-orm/libsql'
```

then `@InjectDrizzle() private readonly db: LibSQLDatabase` (type from the driver's entry point) in any provider; no `forFeature()`. The client closes on `app.close()`/shutdown hooks. Tables are plain objects: `sqliteTable('notes', {...})`, types from `$inferSelect`/`$inferInsert`. Migrations: `drizzle-kit generate` then `drizzle-kit migrate`, or `migrate()` from the driver's `/migrator` at startup.

## TypeORM

`TypeOrmModule.forRoot({ type, database, autoLoadEntities: true, synchronize: false })` at the root, `TypeOrmModule.forFeature([Note])` in the feature module, `@InjectRepository(Note) private readonly notes: Repository<Note>`. `synchronize: true` is for throwaway development databases only: it can drop columns and data. Use migrations otherwise.

## Rules

- **Don't read, then `save()` a whole entity to update it.** TypeORM's `save()` inserts the row if it's gone, so a PATCH that loaded a note just before a concurrent DELETE puts it back. Update with `repo.update({ id, userId }, changes)` (or a query builder) and check `result.affected`; delete with `repo.delete({ id, userId })`. With Drizzle, `db.update(notes).set(changes).where(and(eq(notes.id, id), eq(notes.userId, userId))).returning()` and treat no row as 404.
- **Scope by owner in the query**, not after loading: `where: { id, userId: user.id }`. A row that isn't the caller's is then simply not found.
- **Map constraint violations, don't pre-check.** Insert and catch the unique violation (Drizzle wraps the driver's error: walk `error.cause`; SQLite `SQLITE_CONSTRAINT_UNIQUE`, PostgreSQL `23505`) and answer 409; a lookup first lets two concurrent requests both pass.
- **Page with a cursor** (`WHERE id > :after ORDER BY id LIMIT :limit + 1`), not `OFFSET`: no `COUNT(*)`, stable under inserts.
- **Check-then-write in one statement or a transaction.** "Is the email taken? then insert" needs a unique index (catch the violation and answer 409); "count admins, then demote" needs a transaction (Drizzle `db.transaction(async (tx) => ...)`, TypeORM `dataSource.transaction(async (manager) => ...)`).
- **Cascades in the schema**: `onDelete: 'cascade'` on the foreign key (Drizzle `references(() => users.id, { onDelete: 'cascade' })`, TypeORM `@ManyToOne(() => User, { onDelete: 'CASCADE' })`), and for SQLite turn foreign keys on (`PRAGMA foreign_keys = ON`).
- **Data that must survive a restart** lives in a file or server database from the configured path or URL, never `:memory:`. Create the parent directory if needed.
- **Numbers that come back as strings.** PostgreSQL `bigint` (`int8`) and `numeric`/`decimal` arrive as strings through `pg`, because JavaScript numbers can't hold them exactly. Convert where you need arithmetic, choose the column mode on purpose (Drizzle `bigint({ mode: 'number' })` only when values stay below 2^53), and keep money as integer cents or `numeric` handled as strings.
- **Times in UTC.** Store timestamps in UTC (`timestamptz` in PostgreSQL; epoch milliseconds or ISO strings in SQLite, which has no date type) and convert at the edges.
- **Short transactions.** Never await an HTTP call, a queue or a user inside a transaction: it holds a pooled connection (and locks) the whole time, and a slow third party then exhausts the pool. Call out before or after, or use an outbox (`@nestjs/outbox`).
- **One Prisma client.** With Prisma, create one `PrismaService extends PrismaClient` provider, exported from one module, not a `new PrismaClient()` per service: each client has its own connection pool.
- **Async drivers yield between statements**: two requests can interleave between a read and a write. Synchronous drivers (`better-sqlite3`) don't, which hides races in tests that would appear on PostgreSQL.

Recipes, all run on the released packages: schemas and relations, migrations at startup or as a release step, a repository with owner-scoped queries, cursor paging and unique violations mapped to 409, transactions, testing: [references/data.md](references/data.md).
