# Admin User Seeder Implementation Details

This document explains the implementation of an automatic admin user seeder system in the NestJS application.

## 🎯 **Objective**

Implement a system that automatically creates an admin user when the application starts, ensuring there's always at least one administrative user available in the system.

## 📁 **Files Modified/Created**

### 1. **User Entity** (`src/user/user.entity.ts`)

**Changes Made:**

- Added `isAdmin: boolean` field with default value `false`
- This field determines whether a user has administrative privileges

**Before:**

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;
}
```

**After:**

```typescript
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: false })
  isAdmin: boolean;
}
```

### 2. **User Seeder Service** (`src/user/user.seeder.ts`) - **NEW FILE**

**Purpose:** Automatically creates admin users on application startup

**Key Features:**

- Checks if admin user already exists before creating
- Configurable via environment variables
- Comprehensive error handling and logging
- Only runs once per application lifecycle

**Implementation Details:**

```typescript
@Injectable()
export class UserSeeder {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  async seed() {
    // Check existing admin
    const existingAdmin = await this.usersRepository.findOne({
      where: { isAdmin: true },
    });

    if (existingAdmin) {
      this.logger.log('Admin user already exists, skipping seed');
      return;
    }

    // Create admin user with configurable values
    const adminUser = this.usersRepository.create({
      name: this.configService.get<string>('ADMIN_NAME', 'Admin User'),
      email: this.configService.get<string>('ADMIN_EMAIL', 'admin@example.com'),
      isAdmin: true,
    });

    await this.usersRepository.save(adminUser);
  }
}
```

### 3. **User Service** (`src/user/user.service.ts`)

**Changes Made:**

- Added `findAdmins()` method to retrieve all admin users
- Added `findByEmail()` method for user lookup by email
- Enhanced existing `create()` method to handle admin creation

**New Methods:**

```typescript
findAdmins(): Promise<User[]> {
  return this.usersRepository.find({
    where: { isAdmin: true },
  });
}

findByEmail(email: string): Promise<User | null> {
  return this.usersRepository.findOne({
    where: { email },
  });
}
```

### 4. **User Controller** (`src/user/user.controller.ts`)

**Changes Made:**

- Added `GET /users/admins` endpoint to list admin users
- Updated `POST /users` endpoint to handle admin creation
- Integrated with DTO validation

**New Endpoint:**

```typescript
@Get('admins')
findAdmins(): Promise<User[]> {
  return this.userService.findAdmins();
}
```

**Updated Endpoint:**

```typescript
@Post()
create(@Body() createUserDto: CreateUserDto): Promise<User> {
  return this.userService.create(createUserDto);
}
```

### 5. **Create User DTO** (`src/user/create-user.dto.ts`) - **NEW FILE**

**Purpose:** Input validation and type safety for user creation

**Features:**

- Email validation using `@IsEmail()`
- Required field validation using `@IsString()`
- Optional admin field using `@IsOptional()` and `@IsBoolean()`

**Implementation:**

```typescript
export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;
}
```

### 6. **User Module** (`src/user/user.module.ts`)

**Changes Made:**

- Added `UserSeeder` to providers array
- Exported `UserSeeder` for use in other modules

**Updated Module:**

```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UserController],
  providers: [UserService, UserSeeder],
  exports: [UserService, UserSeeder],
})
export class UserModule {}
```

### 7. **App Module** (`src/app.module.ts`)

**Changes Made:**

- Implemented `OnModuleInit` interface
- Added constructor injection for `UserSeeder`
- Added `onModuleInit()` lifecycle hook to run seeder

**Updated Module:**

```typescript
export class AppModule implements OnModuleInit {
  constructor(private readonly userSeeder: UserSeeder) {}

  async onModuleInit() {
    await this.userSeeder.seed();
  }
}
```

### 8. **Main Application** (`src/main.ts`)

**Changes Made:**

- Added global validation pipe
- Enabled whitelist validation
- Added automatic data transformation

**Updated Bootstrap:**

```typescript
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}
```

### 9. **Package Dependencies** (`package.json`)

**New Dependencies Added:**

- `class-validator` - For DTO validation
- `class-transformer` - For data transformation

**Installation Command:**

```bash
npm install class-validator class-transformer
```

### 10. **Documentation** (`README.md`)

**Changes Made:**

- Added environment configuration section
- Added admin user seeder documentation
- Added Swagger API documentation section
- Included configuration examples

### 11. **Swagger Integration** - **NEW FEATURE**

**Purpose:** Provide comprehensive API documentation and interactive testing interface

**New Dependencies Added:**

- `@nestjs/swagger` - NestJS Swagger integration
- `swagger-ui-express` - Swagger UI for Express

**Implementation Details:**

**Main Application (`src/main.ts`):**

```typescript
// Swagger configuration
const config = new DocumentBuilder()
  .setTitle('NestJS Starter API')
  .setDescription('A comprehensive API with admin user seeder functionality')
  .setVersion('1.0')
  .addTag('users', 'User management endpoints')
  .addTag('cats', 'Cat management endpoints')
  .build();

const document = SwaggerModule.createDocument(app, config);
SwaggerModule.setup('api', app, document);
```

**DTOs with Swagger Decorators:**

- `CreateUserDto` - User creation with validation examples
- `CatDto` - Cat properties with descriptions and examples

**Controllers with API Documentation:**

- `UserController` - Tagged with 'users', detailed endpoint documentation
- `AppController` - Tagged with 'cats', comprehensive cat API docs

**Features:**

- Interactive API testing interface at `/api`
- Request/response schemas
- Example data for all endpoints
- Parameter descriptions and types
- Response codes and descriptions
- Organized by tags (users, cats)

## 🔧 **Configuration Options**

### Environment Variables

The seeder can be configured using these environment variables:

```bash
# Admin User Configuration
ADMIN_NAME=Admin User          # Default: "Admin User"
ADMIN_EMAIL=admin@example.com  # Default: "admin@example.com"
```

### Database Configuration

```bash
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=nestuser
DATABASE_PASS=nestpass
DATABASE_NAME=nestdb
```

## 🚀 **How It Works**

### 1. **Application Startup Flow**

```
AppModule.onModuleInit() → UserSeeder.seed() → Database Check → Admin Creation
```

### 2. **Seeder Logic**

1. **Check Existing Admin**: Query database for users with `isAdmin: true`
2. **Skip if Exists**: If admin found, log and return early
3. **Create Admin**: If no admin exists, create new admin user
4. **Configuration**: Use environment variables or defaults
5. **Save to Database**: Persist admin user to database
6. **Log Result**: Provide feedback on success/failure

### 3. **Database Schema Changes**

- Added `isAdmin` column to `User` table
- Default value: `false`
- Type: `boolean`

## 📡 **API Endpoints**

### **GET /users**

- **Purpose**: Retrieve all users
- **Response**: Array of User objects
- **Access**: Public
- **Swagger**: Tagged with 'users', includes response schema

### **GET /users/admins**

- **Purpose**: Retrieve all admin users
- **Response**: Array of admin User objects
- **Access**: Public
- **Swagger**: Tagged with 'users', includes response schema

### **POST /users**

- **Purpose**: Create a new user
- **Body**: CreateUserDto
- **Response**: Created User object
- **Access**: Public
- **Validation**: Email format, required fields
- **Swagger**: Tagged with 'users', includes request/response schemas

### **GET /cats/all**

- **Purpose**: Retrieve all cats
- **Response**: Array of Cat objects
- **Access**: Public
- **Swagger**: Tagged with 'cats', includes response schema

### **GET /cats/getById/:id**

- **Purpose**: Retrieve a cat by ID
- **Parameters**: id (number)
- **Response**: Cat object
- **Access**: Public
- **Swagger**: Tagged with 'cats', includes parameter and response schemas

### **POST /cats/create**

- **Purpose**: Create a new cat
- **Body**: CatDto
- **Response**: Created Cat object
- **Access**: Public
- **Swagger**: Tagged with 'cats', includes request/response schemas

### **GET /cats/filter**

- **Purpose**: Filter cats by age and breed
- **Query Parameters**: age (number), breed (boolean)
- **Response**: Array of filtered Cat objects
- **Access**: Public
- **Swagger**: Tagged with 'cats', includes query parameters and response schema

## 🌐 **Swagger Documentation**

### **Access URL**

- **Swagger UI**: `http://localhost:3000/api`

### **Features**

- Interactive API testing interface
- Request/response schemas with examples
- Parameter descriptions and types
- Response codes and descriptions
- Organized by tags (users, cats)
- Automatic validation examples

### **Implementation**

- Global Swagger configuration in `main.ts`
- Decorators on all DTOs and controllers
- Tagged endpoints for organization
- Comprehensive API documentation

## 🧪 **Testing the Implementation**

### 1. **Start the Application**

```bash
npm run start:dev
```

### 2. **Check Logs**

Look for these log messages:

```
[UserSeeder] Admin user 'Admin User' created successfully with email 'admin@example.com'
```

or

```
[UserSeeder] Admin user already exists, skipping seed
```

### 3. **Test API Endpoints**

```bash
# Get all users
curl http://localhost:3000/users

# Get admin users
curl http://localhost:3000/users/admins

# Create a new user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Test User", "email": "test@example.com"}'
```

## 🔒 **Security Considerations**

### 1. **Admin Role Management**

- Admin status is stored in database
- No hardcoded admin credentials
- Configurable via environment variables

### 2. **Input Validation**

- Email format validation
- Required field validation
- Whitelist validation prevents unwanted fields

### 3. **Database Security**

- Uses TypeORM parameterized queries
- No SQL injection vulnerabilities
- Proper error handling

## 🚨 **Error Handling**

### 1. **Seeder Errors**

- Logs errors without crashing application
- Graceful fallback if admin creation fails
- Continues application startup

### 2. **Validation Errors**

- Returns HTTP 400 for invalid input
- Detailed error messages
- Prevents invalid data persistence

### 3. **Database Errors**

- Connection errors logged
- Repository errors handled gracefully
- Application remains functional

## 📈 **Future Enhancements**

### 1. **Additional User Roles**

- Role-based access control (RBAC)
- Multiple admin levels
- Permission-based system

### 2. **Enhanced Seeding**

- Multiple default users
- Role-based seeding
- Environment-specific seeds

### 3. **Admin Management**

- Admin user management endpoints
- Role modification capabilities
- User promotion/demotion

## 🔍 **Troubleshooting**

### Common Issues

1. **Seeder Not Running**
   - Check if `UserSeeder`
