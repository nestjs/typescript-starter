<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest
  
  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

This [NestJS](https://github.com/nestjs/nest) project offers a platform for event management, seamlessly integrating user functionalities to allow for the creation, update, and deletion of event records alongside user management capabilities. Utilizing [MySQL](https://www.mysql.com/), the application supports complex relationships, such as users attending multiple events, through a clean and intuitive API. With a focus on scalability and maintainability, this setup is ideal for developers looking to build or expand on a comprehensive event scheduling and user management system.

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## API Endpoints

<div style="text-align: justify;">

**Events:**

- **POST /events**: Creates a new event with the given details. Requires a JSON payload with event information such as title, description, status, startTime, endTime, and an array of invitee IDs.

  **Example payload:**

```json
{
  "title": "Team Meeting",
  "description": "Monthly team sync.",
  "status": "TODO",
  "startTime": "2024-04-01T09:00:00Z",
  "endTime": "2024-04-01T10:00:00Z",
  "invitees": [1, 2]
}
```
  - **GET /events**: Retrieves a list of all events.
  - **GET /events/:id**: Retrieves details of a specific event by its ID.
  - **DELETE /events/:id**: Deletes a specific event by its ID.
  - **POST /events/merge**: Merges overlapping events for a specified user. Requires a JSON payload with the user ID.

    **Example payload:**
```json
{
  "userId": 1
}
```

**Users:**

  - **POST /users**: Creates a new user with the given details. Requires a JSON payload with user information such as name and an optional array of event IDs to associate with the user.

    **Example payload:** 
```json
{
  "name": "John Doe",
  "eventIds": [1, 3]
}
```
  - **GET /users**: Retrieves a list of all users.
  - **DELETE /users/:id**: Deletes a specific user by its ID.
</div>

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
## Event `merge` Test Examples
```json
// Event 1: Overlap with event 2
{
    "title": "Team Meeting",
    "description": "Discussing monthly goals.",
    "status": "TODO",
    "startTime": "2024-04-01T09:00:00Z",
    "endTime": "2024-04-01T10:00:00Z",
    "invitees": [1, 2]
}
```
```json
// Event 2: Overlap with event 1
{
  "title": "Project Planning",
  "description": "Planning phase for new project.",
  "status": "IN_PROGRESS",
  "startTime": "2024-04-01T09:30:00Z",
  "endTime": "2024-04-01T11:00:00Z",
  "invitees": [1]
}
```
```json
// Event 3: No overlap
{
  "title": "Team Lunch",
  "description": "Casual lunch with the team.",
  "status": "TODO",
  "startTime": "2024-04-01T12:00:00Z",
  "endTime": "2024-04-01T13:00:00Z",
  "invitees": [1, 2]
}
```


## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## License

  Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
