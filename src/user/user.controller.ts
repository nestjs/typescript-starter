import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './create-user.dto';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({
    status: 200,
    description: 'List of all users retrieved successfully',
    type: [User],
  })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @Get('admins')
  @ApiOperation({ summary: 'Get all admin users' })
  @ApiResponse({
    status: 200,
    description: 'List of all admin users retrieved successfully',
    type: [User],
  })
  findAdmins(): Promise<User[]> {
    return this.userService.findAdmins();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
    type: User,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid input data',
  })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }
}
