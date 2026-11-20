---
name: nestjs
description: NestJS, the TypeScript framework for Node.js backends. How to start a project non-interactively with the Nest CLI, the project layout and module system, where the current docs are, and the mistakes agents make in Nest apps that still pass their tests. Use when creating or extending a NestJS application.
license: MIT
compatibility: Written for NestJS 12 (@nestjs/core 12.x) on Node.js 20+.
---

# NestJS

Nest's APIs move faster than model training data, so what you remember may be a major version behind. Check before relying on memory:

- Which version you're on: `npm ls @nestjs/core` in a project, `npm view @nestjs/core version` for the latest. Use the latest for a new project.

- https://docs.nestjs.com/llms.txt indexes every chapter. Each chapter is plain markdown at its URL plus `.md`, e.g. https://docs.nestjs.com/controllers.md. Fetch the one chapter you need, not `llms-full.txt`. Find the page in the index rather than from memory: remembered paths (`/techniques/...`) are from older versions; most redirect to the current chapter, but some topics moved or split.
- Nest has first-party packages for most backend needs (auth, permissions, databases, config, rate limiting, OpenAPI, health checks, queues, scheduling). Check them before writing your own or adding another library. The other skills in this package cover the common ones.

## Start a project

In an empty folder:

```bash
npx @nestjs/cli new . --skip-git --package-manager npm
```

Without a TTY (an agent's shell) it asks nothing: it creates an ESM project with Vitest and installs dependencies. `--minimal` creates a one-file app (`src/main.ts`). `npm start` runs `nest start`, which compiles first.

Write modules, controllers and services as files yourself (`nestjs-feature` shows the shape); register each in its module. `nest generate` is optional: `npx nest g module|controller|service <name> --no-spec` creates a stub and registers it, which helps when you're unsure where it goes. `nest g resource` makes a CRUD scaffold of stubs, DTOs and an entity class; use it only when you want exactly that, and pass `--type rest --crud` so it doesn't prompt.

The scaffold comes with an `AGENTS.md`; read it in an existing project, along with `package.json` and `nest-cli.json`.

## Layout and module system

- `src/main.ts` bootstraps (`NestFactory.create(AppModule)`, global pipes, `app.listen(process.env.PORT ?? 3000)`); `src/app.module.ts` imports the feature modules.
- One folder per feature: `src/notes/notes.module.ts`, `notes.controller.ts` (HTTP only), `notes.service.ts` (rules), a repository (queries), DTOs (`CreateNoteDto`) or schemas next to them. Share a provider by adding it to its module's `exports` and importing that module. Where code goes, how to split modules and what to avoid: `nestjs-feature`'s `references/structure.md`.
- Projects from `nest new` are ESM (`"type": "module"`), and Nest's packages are ESM only: relative imports end in `.js` (`import { NotesService } from './notes.service.js'`), there's no `__dirname` (use `import.meta.dirname`), tests use `vi.fn()`, not `jest.fn()`. Follow what an existing project uses.
- Run through the Nest CLI or `tsc`, not `tsx`: `tsx` emits no decorator metadata, so providers injected by type arrive as `undefined`.
- **Never `import type` a class you inject.** Dependency injection reads the constructor's parameter types at run time; a type-only import erases them, and the app stops at startup with `Nest can't resolve dependencies of the NotesService (?)`. Linters and auto-fixers (`consistent-type-imports`) make this change on their own. The opposite holds for plain types in decorated signatures (`Request` from express, `RawBodyRequest`): with `isolatedModules`, TypeScript requires `import type` there (error TS1272).

## Mistakes that pass tests

Coding agents make these in Nest apps whose tests all pass:

- **Sign-in leaks which emails exist.** Hand-assembled sign-in (`@nestjs/jwt` + bcrypt) returns early for an unknown email (`if (!user || !(await bcrypt.compare(...))) throw`), so unknown emails answer faster. Use `@nestjs/authentication`'s `PasswordHasher.verify(password, user?.passwordHash)`, which checks a dummy hash when there's no user. See the `nestjs-auth` skill.
- **`@Post()` answers 201.** A POST that creates nothing (sign-in, actions, searches) needs `@HttpCode(200)` or the code it means.
- **`@IsOptional()` lets `null` through.** class-validator skips every rule for `null`, so `{"title": null}` reaches the database and fails with a 500. For "may be left out, not null", use `@ValidateIf((_, value) => value !== undefined)` instead. Zod's `.optional()` doesn't have this problem.
- **A short HS256 secret.** `@nestjs/authentication`'s `accessToken.key` needs at least 32 bytes and stops the app at startup otherwise. Never hash or pad a secret to fit: tokens are then signed with a different key and whatever verifies them with the real secret rejects them. The `nestjs-auth` skill covers a secret the task fixes.
- **The OpenAPI document leaves out its own route.** `SwaggerModule.setup()` serves the document outside Nest's router, so it isn't listed. Add it if the contract says every route is documented (`nestjs-production`).
- **Stopping servers.** Start a server in the background, note its PID (`npm start > server.log 2>&1 & echo $!`), and stop it with `kill <pid>`, or by its port: `kill $(lsof -ti tcp:3000 -sTCP:LISTEN)`. Never `pkill -f nest` or `pkill -f "npm start"`: they match other projects' processes on the machine.

A contract the task fixes (status codes, error bodies, secrets, field names) wins over a package's defaults. Adapt the package, or say what you couldn't do.

When a task says how to test, follow it. When it says nothing, cover the behaviour you change with focused tests rather than broad e2e suites.

## Other skills in this package

- `nestjs-feature`: modules, controllers, services, validation (Zod with `@Body({ schema })`, or class-validator), status codes, error bodies, Server-Sent Events.
- `nestjs-auth`: `@nestjs/authentication` and `@nestjs/authorization`.
- `nestjs-data`: `@nestjs/drizzle` and `@nestjs/typeorm`.
- `nestjs-testing`: unit and e2e tests.
- `nestjs-production`: config, logging, observability (NestJS Observe), health checks, rate limiting, OpenAPI, shutdown, deployment.

More detail: [references/docs-map.md](references/docs-map.md) lists the docs chapter for each topic.
