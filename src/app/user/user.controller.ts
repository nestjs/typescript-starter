import { AuthGuard } from '@nestjs/passport';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('user')
//@UseGuards(AuthGuard('jwt'))
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/getall')
  async index() {
    return await this.userService.findAll();
  }

  @Post('/save')
  async store(@Body() body: CreateUserDto) {
    return await this.userService.store(body);
  }

  @Get('/get/:id')
  async show(@Param('id', new ParseIntPipe()) id: number) {
    return await this.userService.findOneOrFail({ where: { id } });
  }

  @Put('/put/:id')
  async update(
    @Param('id', new ParseIntPipe()) id: number,
    @Body() body: UpdateUserDto,
  ) {
    return await this.userService.update(id, body);
  }

  @Delete('/del/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async destroy(@Param('id', new ParseIntPipe()) id: number) {
    await this.userService.destroy(id);
  }
  
}
