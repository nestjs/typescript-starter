
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

### The Task management app rest API has the following features:
- Create a new task
- Retrive a task by ID
- Delete a task by ID
- Display all tasks

## Known issues: 
- one known issue for the app is that when retriving an ID that doesn't exist, it's not showing exceptions but with a 200 http status not returning anything. I tried to catch the error by using http exceptions and also tried to use timeout interceptors but neither of them work. 
- Was trying to use docker for MySQL integration but didn't make it to work due to the time limit.

## For running the project, follow the steps below:

## 1. Clone the repo to local machine

```bash
$ git clone /_Repo_link_here_/
```

## 2. Installation

```bash
$ npm install
```

## 3. Running the app

```bash
# start the dev server 
$ npm run start:dev
```
- Start a local mysql server, change the username, password, and database name in the app.modules.ts.
- Open postman and goto localhost at port 3000 to test out different requests.
- Supported requests are:
  - GET 'http://localhost:3000/api/tasks' displays all tasks
  - POST 'http://localhost:3000/api/tasks' create a new task
  - GET 'http://localhost:3000/api/tasks/{id}' get a task with the {id} == task.id
  - DELETE 'http://localhost:3000/api/tasks/{id}' delete a task with the {id} == task.id

## 4. Test
In the terminal, run these commands to run the test cases and see test coverage. 
```bash
# unit tests to run all the test cases
$ npm run test

# e2e tests to run integration test
$ npm run test:e2e

# test coverage to see the teat covarage table 
$ npm run test:cov
```

