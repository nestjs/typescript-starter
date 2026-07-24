# Events feature - take home exercise

This is the NestJS typescript-starter with an events management feature bolted on top, for the take-home assignment. Below is how to run it, plus the assumptions I made where the spec was ambiguous (I made a judgment call and documented it instead of guessing silently or going back and forth on it).

## What's here

- `Event` entity: title, description (optional), status enum, createdAt/updatedAt, startTime/endTime, and a many-to-many relation to invitees
- `User` entity: id, name, and the inverse side of the events relation
- REST endpoints for create / retrieve / delete on events, plus the mergeAll feature
- A tiny Users API (not asked for in the spec, see assumptions below) so you can actually create users to invite to events
- Unit tests for the merge logic and the service, plus e2e tests hitting real HTTP endpoints against a real (in-memory) database

## Running it

```bash
npm install
npm run start:dev
```

By default this runs against a local sqlite file (`events.sqlite`, created automatically, gitignored), so there's nothing else to set up. Postman/curl against `http://localhost:3000`.

If you want to point it at a real Postgres or MySQL instead, set env vars before starting:

```bash
# postgres
DB_TYPE=postgres DB_HOST=localhost DB_PORT=5432 DB_USERNAME=postgres DB_PASSWORD=postgres DB_NAME=events_db npm run start:dev

# mysql
DB_TYPE=mysql DB_HOST=localhost DB_PORT=3306 DB_USERNAME=root DB_PASSWORD=root DB_NAME=events_db npm run start:dev
```

Same code, no code changes needed, it's all in `src/database.config.ts`.

## API

**Users** (see "why is there a Users API" below)
```
POST /users        { "name": "alice" }
GET  /users/:id
```

**Events**
```
POST   /events                    { "title", "description"?, "status"?, "startTime", "endTime", "inviteeIds"? }
GET    /events/:id
DELETE /events/:id
POST   /events/merge-all/:userId
```

Example flow:

```bash
# make a couple users
curl -X POST localhost:3000/users -H 'Content-Type: application/json' -d '{"name":"alice"}'
curl -X POST localhost:3000/users -H 'Content-Type: application/json' -d '{"name":"bob"}'

# create two overlapping events, both inviting user 1
curl -X POST localhost:3000/events -H 'Content-Type: application/json' -d '{
  "title": "Standup",
  "startTime": "2024-01-01T14:00:00.000Z",
  "endTime": "2024-01-01T15:00:00.000Z",
  "inviteeIds": [1]
}'
curl -X POST localhost:3000/events -H 'Content-Type: application/json' -d '{
  "title": "Design review",
  "startTime": "2024-01-01T14:45:00.000Z",
  "endTime": "2024-01-01T16:00:00.000Z",
  "inviteeIds": [1, 2]
}'

# merge user 1's overlapping events
curl -X POST localhost:3000/events/merge-all/1
```

## Running tests

```bash
npm run test        # unit tests (mocked repos, no DB at all)
npm run test:e2e     # integration tests against a real in-memory sqlite DB
npm run test:cov     # coverage
```

Why both: the assignment FAQ says to do both, so `events.service.spec.ts` and `merge-events.util.spec.ts` mock everything out and just test the logic in isolation, and `test/events.e2e-spec.ts` boots the real app with a real (in-memory) sqlite database and hits the actual HTTP endpoints with supertest. sqlite in-memory rather than a real Postgres/MySQL container just so the tests don't need any infra to run, but it's exercising the same TypeORM code path as a real DB would.

## Assumptions I made (the spec had some gaps)

The instructions bounce between calling this feature "events" (section 2) and "tasks" (section 3, the API requirements). There's no separate Task entity anywhere, so I've treated those as the same thing and just built the Event API.

**User.events being "a list of strings":** I read this as "a list of event ids" rather than literally a `string[]` column, and made it the inverse side of a proper `Event.invitees` many-to-many relation. The alternative (a raw string array with no relation) is simpler but means mergeAll has to hand-sync two separate lists instead of TypeORM keeping them consistent automatically. Happy to swap it if a plain string array is actually what was wanted.

**mergeAll scope:** "merge all overlapping events... to a user" - I read this as scoped to one user (all the events *that user* is invited to), not a global merge of every event in the system. So `POST /events/merge-all/:userId` only touches events where that user is an invitee.

**Transitive overlap:** the example given is only two events (2-3pm and 2:45-4pm -> merged). I extended that to the standard "merge overlapping intervals" behavior: if A overlaps B and B overlaps C, all three get merged into one block even if A and C don't directly overlap. Felt like the more expected behavior for "merge overlapping events" generally, but it's worth knowing this was a judgment call in case a narrower pairwise-only merge was intended.

**Merging the other attributes**, per the FAQ:
- title: joined with " + "
- description: joined with "; ", skipping any that are missing
- status: picks the least-done status in the group (if anything is still TODO or IN_PROGRESS, the merged event is too; only COMPLETED if every event being merged was already COMPLETED). Felt safer than defaulting to COMPLETED and silently losing track of unfinished work.
- invitees: union of everyone invited to any event in the group, deduped

**Why is there a Users API:** the assignment only asks for the Event API (create/retrieve/delete/mergeAll), not a Users API. But there's no way to create/invite users to test any of that without some way to create User rows, so I added a bare-minimum `POST /users` and `GET /users/:id`. Didn't bother with a full service/DTO layer for it since it's not really part of what's being evaluated here, just plumbing to make the actual feature demoable.

## Things I'd do differently in a bigger project

- mergeAll currently loads every event and filters in JS to find the ones a user's invited to. Fine at this scale, but a real dataset would want that filtering pushed into the query (a join on the invitees relation) instead.
- No update/list endpoints, since they weren't asked for. `updatedAt` is wired up correctly regardless (via `@UpdateDateColumn`), it's just not exercised by anything except mergeAll's own writes right now.
- `synchronize: true` is convenient for a take-home but isn't something I'd want in a real production setup - that'd be migrations.
- No auth on any of this, since nothing in the spec mentioned it.
