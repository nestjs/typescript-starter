# 📆 Event Management API (NestJS)

This is a RESTful API built using the NestJS framework.
It allows users to manage and merge task-like events, with support for full CRUD operations and database persistence via MySQL.

---

## 📦 Features

- Create a new task (event)
- Retrieve a task by ID
- Delete a task by ID
- Merge overlapping events for a user
- Data stored in a MySQL database
- Written using NestJS, TypeORM

---

## 🚀 Getting Started

### 🔧 Installation

```bash
npm install
```
### ⚙️ Environment Setup
Ensure you have MySQL running locally.

1. Create the database:
```
CREATE DATABASE event_manager;
```
2. Create a user:
```
CREATE USER 'nest'@'localhost' IDENTIFIED BY 'password123';
GRANT ALL PRIVILEGES ON *.* TO 'nest'@'localhost';
FLUSH PRIVILEGES;
```
3. Configure TypeORM in `src/app.module.ts`:
```
TypeOrmModule.forRoot({
  type: 'mysql',
  host: '127.0.0.1',
  port: 3306,
  username: 'nest',
  password: 'password123',
  database: 'event_manager',
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: true,
}),
```
### ▶️ Run the Application
```
npm run start
```
API will be available at: http://localhost:3000

## 📌 API Endpoints  
##### ✅ Create a Task  
POST /events
```
{
  "title": "Team Meeting",
  "status": "TODO",
  "startTime": "2025-07-13T14:00:00.000Z",
  "endTime": "2025-07-13T15:00:00.000Z",
  "invitees": [{ "id": 1 }]
}
```
##### ✅ Retrieve a Task  
GET /events/:id  
Example:
```
GET /events/1
```
##### ✅ Delete a Task
DELETE /events/:id  
Example:
```
DELETE /events/1
```
##### ✅ Merge Overlapping Tasks
POST /events/merge-all
```
{
  "userId": 1
}
```
#### 🧪 Running Tests

To run all tests (unit and integration):
```
npm run test
```
Test files:

- `event.controller.spec.ts`
- `event.service.spec.ts`

#### 🎥 Demo Video (To Be Added)

- Creating a task
- Getting and deleting a task
- Merging tasks
- Running tests

#### 👤 Author  
Soo Yeon Ahn — [GitHub Profile](https://github.com/SooYeonAhn1)