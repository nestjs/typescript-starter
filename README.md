# Event Management API

This project extends the NestJS TypeScript starter with an event management feature built for the assignment requirements.

It provides:

- User creation
- Event creation
- Event lookup by id
- Event deletion by id
- Merging all overlapping events for a specific user

The application uses NestJS, TypeORM, and SQLite for local development and automated tests.

## Tech Stack

- NestJS
- TypeORM
- SQLite
- Jest
- Supertest

## Data Model

### User

- `id`: auto-generated numeric identifier
- `name`: required string
- `events`: many-to-many relation with events

### Event

- `id`: auto-generated numeric identifier
- `title`: required string
- `description`: optional string
- `status`: enum value: `TODO`, `IN_PROGRESS`, `COMPLETED`
- `createdAt`: auto-generated timestamp
- `updatedAt`: auto-generated timestamp
- `startTime`: event start timestamp
- `endTime`: event end timestamp
- `invitees`: many-to-many relation with users

Events and users are modeled as a many-to-many relationship using TypeORM. This allows merge operations to combine invitees across overlapping events and persist the updated associations correctly.

## Setup

Install dependencies:

```bash
npm install
```

## Run the Application

Start the server:

```bash
npm run start
```

For development mode:

```bash
npm run start:dev
```

By default, the app uses a local SQLite database file:

```text
dev.sqlite
```

You can override the database path with:

```bash
DB_PATH=custom.sqlite
```

On PowerShell:

```powershell
$env:DB_PATH="custom.sqlite"
npm run start
```

## Run Tests

Unit tests:

```bash
npm test -- --runInBand
```

End-to-end tests:

```bash
npm run test:e2e -- --runInBand
```

Build:

```bash
npm run build
```

## API

### Create a User

`POST /users`

Request body:

```json
{
  "name": "Alice"
}
```

### Create an Event

`POST /events`

Request body:

```json
{
  "title": "Planning",
  "description": "Sprint planning",
  "status": "TODO",
  "startTime": "2026-03-13T14:00:00.000Z",
  "endTime": "2026-03-13T15:00:00.000Z",
  "inviteeIds": [1, 2]
}
```

### Get an Event by Id

`GET /events/:id`

### Delete an Event by Id

`DELETE /events/:id`

### Merge All Overlapping Events for a User

`POST /users/:id/events/merge-all`

This endpoint finds all events linked to the target user, merges overlapping groups, updates the database, and returns the user's updated event list.

## Merge Rules

### Overlap

Only strictly overlapping events are merged.

Examples:

- `2:00 PM - 3:00 PM` and `2:45 PM - 4:00 PM` are merged
- `2:00 PM - 3:00 PM` and `3:00 PM - 4:00 PM` are not merged

### Merged Event Fields

- `startTime`: earliest start time in the merged group
- `endTime`: latest end time in the merged group
- `invitees`: union of all invitees across the merged events, deduplicated by user id
- `title`: unique titles joined with ` | `
- `description`: unique non-empty descriptions joined with line breaks

### Status Priority

Merged event status uses this priority order:

```text
IN_PROGRESS > TODO > COMPLETED
```

That means:

- if any event in the merged group is `IN_PROGRESS`, the merged status is `IN_PROGRESS`
- otherwise, if any event is `TODO`, the merged status is `TODO`
- otherwise, the merged status is `COMPLETED`

## Database Update Behavior

`POST /users/:id/events/merge-all` performs real persistence changes:

- overlapping source events are deleted
- merged replacement events are created
- many-to-many user/event relations are updated through TypeORM

## Test Coverage

The test suite covers:

- user creation
- event creation
- event retrieval
- event deletion
- invitee relation creation and response payloads
- merge-all behavior with and without overlap
- continuous overlap chain merging
- adjacent non-overlapping events
- missing user handling

## Notes

- Validation is enabled globally with NestJS `ValidationPipe`
- DTO validation is implemented with `class-validator`
- Test runs use a separate SQLite database file
