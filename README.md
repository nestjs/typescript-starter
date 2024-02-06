# NestJS Events Management API

This repository contains a NestJS project developed for managing events. It showcases the creation, retrieval, deletion, and merging of events. It demonstrates REST API design, database interaction using Prisma, and comprehensive testing with Jest.

## Getting Started

Follow these instructions to get the project up and running on your local machine for development and testing purposes.

### Prerequisites

- Docker
- Docker Compose
- Node.js (version 14 or newer)
- npm

### Installation and Setup

#### Step 1: Clone the Repository

```bash
git clone https://github.com/<your-username>/typescipt-starter.git
cd typescipt-starter
```

#### Step 2: Start the Database with Docker

This project uses Docker to run the PostgreSQL database locally. Ensure Docker is running on your machine, then execute:

```bash
docker-compose up -d
```

This command starts a PostgreSQL instance.

#### Step 3: Install Node Dependencies

```bash
npm install
```

#### Step 4: Configure Environment Variables

Adjusting the database credentials and any other configurations to match your Docker setup.

#### Step 5: Run Database Migrations

With your database running, apply Prisma migrations to set up the schema:

```bash
npx prisma migrate dev
```

### Running the Application

To start the application in development mode, use:

```bash
npm run start:dev
```

The API will now be accessible at `http://localhost:3000`.

### Running Tests

To execute all tests, including unit and integration tests:

```bash
npm test
```

## API Endpoints

1. Create an Event: `POST /events`
2. Retrieve an Event: `GET /events/:id`
3. Delete an Event: `DELETE /events/:id`
4. Merge Events for a User: `POST /events/merge-all/`

## Demo

For a demonstration of the API and testing procedures, a video is available <a href="">here</a>.
