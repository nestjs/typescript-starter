# Data recipes

Every snippet here was run on Nest 12.5.1, with `@nestjs/drizzle` 0.0.2, `drizzle-orm` and `drizzle-kit` 1.0.0-rc and `@libsql/client` 0.18, and with `@nestjs/typeorm` 12.0.3, `typeorm` 1.1.3 and `better-sqlite3` 12 (TypeORM 1.1 wants `better-sqlite3@^12`). Docs: https://docs.nestjs.com/data/drizzle.md, https://docs.nestjs.com/data/typeorm.md

Contents: Drizzle (schema, relations, registration with migrations, a repository with paging and 409s, transactions, migrations), TypeORM (entities, the same repository, transactions, migrations), and rules for both.

## Drizzle

```bash
npm i @nestjs/drizzle drizzle-orm@rc @libsql/client
npm i -D drizzle-kit@rc
```

Drizzle v1 is published under the `rc` tag; its docs and these recipes are for v1. Other drivers work the same way: install the driver and import `drizzle` from its entry point (`drizzle-orm/node-postgres` with `connection: process.env.DATABASE_URL`, `drizzle-orm/better-sqlite3`, `drizzle-orm/pglite`, ...).

### Schema and relations

```typescript
// src/db/schema.ts
import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer().primaryKey({ autoIncrement: true }),
  email: text().notNull().unique(), // the database enforces it: see 409s below
});

export const notes = sqliteTable(
  'notes',
  {
    id: integer().primaryKey({ autoIncrement: true }),
    userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    title: text().notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' }).notNull().default(sql`(unixepoch() * 1000)`),
  },
  (t) => [index('notes_user_id_idx').on(t.userId, t.id)], // serves "this user's notes, by id"
);

export type Note = typeof notes.$inferSelect;
export type NewNote = typeof notes.$inferInsert;
```

```typescript
// src/db/relations.ts: only for relational queries (db.query...); foreign keys come from references()
import { defineRelations } from 'drizzle-orm';
import * as schema from './schema.js';

export const relations = defineRelations(schema, (r) => ({
  users: { notes: r.many.notes() },
  notes: { user: r.one.users({ from: r.notes.userId, to: r.users.id }) },
}));

// src/db/database.ts: the injected type depends on the relations, so name it once
import type { LibSQLDatabase } from 'drizzle-orm/libsql';
import type { relations } from './relations.js';
export type Database = LibSQLDatabase<typeof relations>;
```

`import type` is right for `Database`: it's a type, injected with the `@InjectDrizzle()` token rather than by class.

### Registration, with migrations at startup

```typescript
// app.module.ts
import { DrizzleModule } from '@nestjs/drizzle';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { relations } from './db/relations.js';

DrizzleModule.forRootAsync({
  useFactory: async () => {
    const db = drizzle({ connection: { url: `file:${process.env.DATABASE_FILE ?? 'data/app.db'}` }, relations });
    await db.run(sql`PRAGMA foreign_keys = ON`); // SQLite enforces foreign keys and cascades only with this
    await migrate(db, { migrationsFolder: './drizzle' });
    return { db };
  },
}),
```

Nest creates nothing that injects the database until the factory resolves, so the schema is current before the first request. With several instances starting at once, run `npx drizzle-kit migrate` as a release step instead. The parent folder of a file database must exist (`data/` here).

```typescript
// drizzle.config.ts (project root)
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'turso', // libSQL; 'sqlite' for better-sqlite3, 'postgresql' for Postgres
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: `file:${process.env.DATABASE_FILE ?? 'data/app.db'}` },
});
```

After every schema change: `npx drizzle-kit generate --name=<what changed>`, and commit the generated `drizzle/<timestamp>_<name>/migration.sql`. Read the SQL before committing it, especially for renamed columns or tables.

### A repository: owner-scoped queries, cursor paging, 409s

```typescript
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDrizzle } from '@nestjs/drizzle';
import { and, asc, eq, gt } from 'drizzle-orm';
import type { Database } from '../db/database.js';
import { notes, users } from '../db/schema.js';

@Injectable()
export class NotesRepository {
  constructor(@InjectDrizzle() private readonly db: Database) {}

  async createUser(email: string) {
    try {
      const [user] = await this.db.insert(users).values({ email }).returning();
      return user;
    } catch (error) {
      if (isUniqueViolation(error)) throw new ConflictException('Email already registered');
      throw error;
    }
  }

  /** limit + 1 rows: the extra one says there's a next page; its cursor is the last id returned. */
  async page(userId: number, limit: number, after?: number) {
    const rows = await this.db
      .select()
      .from(notes)
      .where(and(eq(notes.userId, userId), after ? gt(notes.id, after) : undefined))
      .orderBy(asc(notes.id))
      .limit(limit + 1);
    const items = rows.slice(0, limit);
    return { items, nextCursor: rows.length > limit ? items[items.length - 1].id : null };
  }

  async update(userId: number, id: number, changes: { title?: string }) {
    const [note] = await this.db
      .update(notes)
      .set(changes)
      .where(and(eq(notes.id, id), eq(notes.userId, userId))) // someone else's note is simply not found
      .returning();
    if (!note) throw new NotFoundException('Note not found');
    return note;
  }

  userWithNotes(id: number) {
    return this.db.query.users.findFirst({ where: { id }, with: { notes: true } }); // one query, nested result
  }
}

/** Drizzle wraps the driver's error: walk the causes. */
export function isUniqueViolation(error: unknown): boolean {
  for (let e = error as { code?: string; rawCode?: number; cause?: unknown } | undefined; e; e = e.cause as typeof e) {
    if (e.code === 'SQLITE_CONSTRAINT_UNIQUE' || e.rawCode === 2067 || e.code === '23505') return true;
  }
  return false;
}
```

- Checked: a duplicate insert surfaces as `DrizzleQueryError` → `LibsqlError` (`code: 'SQLITE_CONSTRAINT'`, `rawCode: 2067`) → `SqliteError` (`code: 'SQLITE_CONSTRAINT_UNIQUE'`). The top-level `code` is generic, so check the chain. PostgreSQL's code is `23505`.
- Insert, then catch the violation. "Look it up, then insert" lets two concurrent requests both pass the lookup.

### Transactions

```typescript
await this.db.transaction(async (tx) => {
  await tx.update(notes).set({ userId: toUser }).where(eq(notes.userId, fromUser));
  await tx.delete(users).where(eq(users.id, fromUser));
}); // a throw (or tx.rollback()) rolls back; otherwise it commits and resolves with the callback's value
```

Use `tx` inside, not `this.db` or a repository that holds `this.db`: with a pool those run on another connection, outside the transaction. To span several providers, propagate the transaction with `AsyncLocalStorage` (`nestjs-cls` has a Drizzle transactional plugin; docs: `/recipes/async-local-storage`).

### Testing

Override the database: `.overrideProvider(getDrizzleToken()).useValue(testDb)`, where `testDb` points at a fresh file (or PGlite for PostgreSQL) with the migrations applied.

## TypeORM

```bash
npm i @nestjs/typeorm typeorm better-sqlite3@12
```

```typescript
// app.module.ts
TypeOrmModule.forRoot({
  type: 'better-sqlite3',
  database: process.env.DATABASE_FILE ?? 'data/app.db',
  autoLoadEntities: true, // entities from every forFeature()
  synchronize: false, // true only for a throwaway dev database: it can drop columns and data
  migrations: ['dist/migrations/*.js'],
  migrationsRun: true, // apply pending migrations at startup (one instance at a time)
}),
```

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn() id: number;
  @Column({ unique: true }) email: string;
  @OneToMany(() => Note, (note) => note.user) notes: Note[];
}

@Entity()
@Index(['userId', 'id'])
export class Note {
  @PrimaryGeneratedColumn() id: number;
  @Column() title: string;
  @Column() userId: number; // the foreign key as a plain column: filter and write it without loading the user
  @ManyToOne(() => User, (user) => user.notes, { onDelete: 'CASCADE' }) user: User;
  @CreateDateColumn() createdAt: Date;
}

// notes.module.ts: TypeOrmModule.forFeature([Note, User]); then in the service:
constructor(
  @InjectRepository(Note) private readonly notes: Repository<Note>,
  @InjectDataSource() private readonly dataSource: DataSource,
) {}

page(userId: number, limit: number, after = 0) {
  return this.notes.find({ where: { userId, id: MoreThan(after) }, order: { id: 'ASC' }, take: limit + 1 });
}

async update(userId: number, id: number, changes: Partial<Pick<Note, 'title'>>) {
  const result = await this.notes.update({ id, userId }, changes); // one UPDATE ... WHERE
  if (!result.affected) throw new NotFoundException('Note not found');
  return this.notes.findOneByOrFail({ id });
}

async createUser(email: string) {
  try {
    return await this.users.save(this.users.create({ email }));
  } catch (error) {
    // driverError.code: 'SQLITE_CONSTRAINT_UNIQUE' (better-sqlite3), '23505' (PostgreSQL)
    if (error instanceof QueryFailedError && ['SQLITE_CONSTRAINT_UNIQUE', '23505'].includes((error as any).driverError?.code))
      throw new ConflictException('Email already registered');
    throw error;
  }
}

userWithNotes(id: number) {
  return this.users.findOne({ where: { id }, relations: { notes: true } });
}

moveNotes(from: number, to: number) {
  return this.dataSource.transaction(async (manager) => {
    const result = await manager.getRepository(Note).update({ userId: from }, { userId: to }); // manager, not this.notes
    return result.affected;
  });
}
```

- Checked: loading a row, deleting it, then `save()`-ing the loaded entity inserts it again; `update({ id, userId }, ...)` on the deleted row reports `affected: 0`.
- Migrations are TypeORM's own classes, generated and run by its CLI from a `DataSource` file with the same options; they can't use Nest's dependency injection. Commands: https://typeorm.io/docs/advanced-topics/migrations/
- A `Repository` call is async even on `better-sqlite3`, so another request can run between a read and a write.

## Rules for both

- Keep queries in a repository or service, never in controllers, and scope every query by owner or tenant in the `WHERE`, not after loading.
- Read the relation in the same query (`with` / `relations`) or with one `IN (...)` query, not one query per row in a loop (N+1).
- Index what you filter and sort by together (`(userId, id)` for "a user's items in id order").
- Use database constraints (unique, foreign keys, `NOT NULL`) as the final check, and map their violations to 409/404 rather than letting them become 500s.
- Return what the API promises, not the row: drop password hashes and internal columns in the repository, or map to a response type.
- Don't use `:memory:` for data that must survive a restart, and don't use `synchronize: true` or `drizzle-kit push` against a database with data you care about.
