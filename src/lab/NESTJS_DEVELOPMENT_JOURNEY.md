# NestJS TypeScript Starter — Development Journey

---

## 1. Getting Started: Project Setup and Core Structure

### 1.1 NestJS CLI Installation

The NestJS CLI was installed globally to scaffold and manage the project:

```bash
npm install -g @nestjs/cli
```

The project was initialized using the official NestJS **typescript-starter** template repository.

### 1.2 Core File Structure

The foundational files of the project are as follows:

```
src/
├── main.ts                  # Application entry point
├── app.module.ts            # Root module
├── app.controller.ts        # Default controller
├── app.service.ts           # Default service
└── app.controller.spec.ts   # Unit test file
```

**`main.ts` — Application Entry Point**

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(3000);
}
bootstrap();
```

- `NestFactory.create()` — Bootstraps the application (equivalent to `WebApplication.CreateBuilder()` in .NET).
- `useGlobalPipes(new ValidationPipe())` — Enables automatic request validation globally across all endpoints.
- `listen(3000)` — Starts the HTTP server on port 3000.

**`app.module.ts` — Root Module**

```typescript
@Module({
  imports: [LabModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- `imports` — Registers sub-modules into the root module.
- `controllers` — Classes that handle incoming HTTP requests.
- `providers` — Services containing business logic, made available through Dependency Injection.

---

## 2. Architectural Steps: Layered Architecture Compared with .NET

### 2.1 The Module-Controller-Service Triad

The NestJS architecture closely mirrors the layered pattern found in .NET:

| Layer | NestJS | .NET Equivalent | Responsibility |
|---|---|---|---|
| **Module** | `@Module()` | `Program.cs` / `Startup.cs` | Registers services and controllers |
| **Controller** | `@Controller()` | `[ApiController]` | Receives and routes HTTP requests |
| **Service** | `@Injectable()` | Service classes + DI registration | Business logic and data operations |

### 2.2 Scaffolding the Lab Module

A new module, controller, and service were generated using the NestJS CLI:

```bash
nest g mo lab                  # Generates LabModule
nest g co lab --no-spec        # Generates LabController (without test file)
nest g s lab --no-spec         # Generates LabService (without test file)
```

These commands produced the following file structure:

```
src/lab/
├── dto/
│   └── create-lab.dto.ts     # Data Transfer Object
├── lab.module.ts             # Lab module
├── lab.controller.ts         # Lab controller
└── lab.service.ts            # Lab service
```

### 2.3 Detailed Layer Breakdown

**LabModule** — The registration hub

```typescript
@Module({
  controllers: [LabController],
  providers: [LabService]
})
export class LabModule {}
```

> .NET equivalent: Registering services via `services.AddScoped<LabService>()` and mapping controllers in `Program.cs`.

**LabController** — Defines the HTTP endpoints

```typescript
@Controller('lab')
export class LabController {
    constructor(private readonly labService: LabService) { }

    @Get("hello")
    getHello(): string {
        return this.labService.getHello();
    }

    @Post()
    create(@Body() createLabDto: CreateLabDto) {
        return this.labService.create(createLabDto);
    }

    @Get()
    findAll() {
        return this.labService.findAll();
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.labService.findOne(id);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number) {
        return this.labService.remove(id);
    }
}
```

> .NET equivalent: A controller class decorated with `[ApiController]`, using `[HttpGet]`, `[HttpPost]`, and `[HttpDelete]` attributes.

**LabService** — The business logic layer

```typescript
@Injectable()
export class LabService {
    private items = [];

    findAll() { return this.items; }

    findOne(id: number) {
        const item = this.items.find(i => i.id === id);
        if (!item) throw new NotFoundException(`Record with ID ${id} not found!`);
        return item;
    }

    create(dto: CreateLabDto) {
        const newItem = { id: Date.now(), ...dto };
        this.items.push(newItem);
        return newItem;
    }

    remove(id: number) {
        const index = this.items.findIndex(i => i.id === id);
        if (index === -1) throw new NotFoundException('Record to delete not found!');
        this.items.splice(index, 1);
        return { message: 'Successfully deleted' };
    }
}
```

> .NET equivalent: A service class implementing an `ILabService` interface. The `items` array serves as a temporary in-memory store in place of Entity Framework.

### 2.4 Dependency Injection (DI) Scope

In NestJS, providers registered in a module are **Singleton by default** — a single instance is shared across the entire application lifecycle. This is comparable to .NET's `AddSingleton<T>()` behavior.

| DI Scope | NestJS | .NET Equivalent |
|---|---|---|
| **Singleton** (default) | `@Injectable()` | `services.AddSingleton<T>()` |
| **Request-scoped** | `@Injectable({ scope: Scope.REQUEST })` | `services.AddScoped<T>()` |
| **Transient** | `@Injectable({ scope: Scope.TRANSIENT })` | `services.AddTransient<T>()` |

> **Note:** Since `LabService` uses the default scope, there is only one instance of the `items` array throughout the application's runtime. This is why in-memory data persists between requests — a single service instance holds the state. In .NET, achieving the same behavior would require explicitly registering the service with `AddSingleton`.

### 2.5 Error Handling and Exception Filters

NestJS provides a built-in **Exception Filter** layer that automatically intercepts any unhandled exceptions thrown within the application. When a `NotFoundException` is thrown in the service layer, NestJS catches it and returns a standardized JSON response to the client — no manual try/catch blocks are required in the controller.

For example, when `findOne()` throws a `NotFoundException`, the client receives:

```json
{
  "statusCode": 404,
  "message": "Record with ID 42 not found!",
  "error": "Not Found"
}
```

This is analogous to .NET's **Exception Handling Middleware** (`app.UseExceptionHandler()`), where unhandled exceptions are intercepted and converted into structured HTTP error responses. The key built-in exception classes include:

| NestJS Exception | HTTP Status | .NET Equivalent |
|---|---|---|
| `NotFoundException` | 404 | `NotFound()` / custom middleware |
| `BadRequestException` | 400 | `BadRequest()` / `ValidationProblem()` |
| `UnauthorizedException` | 401 | `Unauthorized()` |
| `ForbiddenException` | 403 | `Forbid()` |

> **Note:** For custom error handling logic, NestJS allows creating custom Exception Filters using the `@Catch()` decorator — similar to implementing a custom `IExceptionHandler` in .NET.

---

## 3. Technical Details

### 3.1 class-validator and class-transformer Setup

Two packages were installed to handle incoming data validation:

```bash
npm install class-validator class-transformer
```

| Package | Purpose | .NET Equivalent |
|---|---|---|
| `class-validator` | Defines validation rules on DTO properties | `DataAnnotations` (`[Required]`, `[MinLength]`) |
| `class-transformer` | Transforms plain JSON into class instances | Model Binding mechanism |

### 3.2 Global Validation Pipe

Validation was enabled application-wide in `main.ts`:

```typescript
app.useGlobalPipes(new ValidationPipe());
```

This configuration ensures that every incoming request is automatically validated against the DTO rules before reaching the controller. It mirrors the automatic model validation behavior of .NET's `[ApiController]` attribute.

### 3.3 DTO (Data Transfer Object) Usage

```typescript
import { IsString, MinLength } from "class-validator";

export class CreateLabDto {
    @IsString()
    name: string;

    @MinLength(3, { message: "Must be at least 3 characters" })
    description: string;
}
```

| NestJS Decorator | .NET Equivalent | Description |
|---|---|---|
| `@IsString()` | `[Required]` + type check | The field must be a string |
| `@MinLength(3)` | `[MinLength(3)]` | Minimum 3 characters required |

DTOs act as a gatekeeper for external input. Every piece of data reaching the controller must first pass through these validation rules. Requests that fail validation are automatically rejected with a `400 Bad Request` response.

---

## 4. CLI Commands Reference

All critical commands used throughout the development process, listed in chronological order:

### 4.1 Installation Commands

```bash
# Install the NestJS CLI globally
npm install -g @nestjs/cli

# Install validation packages
npm install class-validator class-transformer
```

### 4.2 Code Generation Commands (NestJS CLI)

```bash
# Generate Lab module
nest g mo lab

# Generate Lab controller (without test file)
nest g co lab --no-spec

# Generate Lab service (without test file)
nest g s lab --no-spec
```

### 4.3 Git Commands

```bash
# Create a new feature branch
git checkout -b feat/initial-analysis-and-docs

# Stage all changes
git add .

# Create a commit
git commit -m "feat: initial project analysis, lab module and validation setup"

# Push changes to the remote repository
git push origin feat/initial-analysis-and-docs
```

---

## 5. Project Architecture — Overview

```
src/
├── main.ts                       # Application bootstrap + Global Pipe
├── app.module.ts                 # Root module (LabModule is imported here)
├── app.controller.ts             # Default "Hello World" endpoint
├── app.service.ts                # Default service
└── lab/
    ├── lab.module.ts             # Lab module (controller + service registration)
    ├── lab.controller.ts         # CRUD endpoints (GET, POST, DELETE)
    ├── lab.service.ts            # In-memory data operations
    └── dto/
        └── create-lab.dto.ts     # Input validation rules
```

---




