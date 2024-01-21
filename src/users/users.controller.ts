import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Put,
    HttpCode,
    HttpStatus,
    Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { Response } from 'express';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createUser(@Body() createUserDTo: CreateUserDto) {
        return this.usersService.create(createUserDTo);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK)
    async getUserById(@Res() res: Response, @Param('id') id: number) {
        const user = await this.usersService.getUserById(id);
        if (!user) {
            return res.status(404).send({
                message: 'User not found',
            });
        }
        return res.status(200).send(user);
    }

    @Put(':id')
    @HttpCode(HttpStatus.OK)
    async mergeAllEvents(@Param('id') id: number) {
        return this.usersService.mergeAllEvents(id);
    }
}
