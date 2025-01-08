
## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

## Before all 

Install Docker
Node version LTS 
VSCode with extesions: {{Prettier, Eslint}}
Git 
After instalations run in your terminal 

```bash
$ npm i -g @nestjs/cli && npm i @prisma/client
```

```bash
$ git clone git@github.com:raphael-dias/image-auto-sender-backend.git
```
For dependencies install

```bash
$ npm install && npm install -D ts-node
```
And to configure the environment run this command

```bash
$ npm run start
```

## Utils 
## Docker UP 

```bash
$ npm docker:up
```

## Docker Down

```bash
$ npm docker:down
```

## Prisma Utils

## Create tables in database
```bash
npx prisma migrate dev --name init
```



## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

