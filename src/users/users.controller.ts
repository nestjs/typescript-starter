import { Controller, Get, Body, Post, Delete, Param, Put, HttpException, HttpStatus } from '@nestjs/common';
import { User } from './users.entity';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {

    constructor(
        private service: UsersService
    ) {}

    @Get()
    getAll(){
       return this.service.getAll();
    }

    @Get(':id')
        
        getById(@Param() parameter): User {
            const user = this.service.getById(parameter.id);
            if(user == undefined) throw new HttpException(`Could not find a user with the id ${parameter.id}`, HttpStatus.NOT_FOUND);
            return user;
        }

    @Post()
        create(@Body() input: any): User {
            const user = this.service.create(input.lastname, input.firstname, input.age);
            return user;
        }

    @Put(':id')
        modifyUser(@Param() parameter, @Body() input: any): User {
            const user = this.service.modifyUser(parameter.id, input.lastname, input.firstname, input.age);
            if(user == undefined) throw new HttpException(`Could not find a user with the id ${parameter.id}`, HttpStatus.NOT_FOUND);
            return user;
        }

    @Delete(':id')
        deleteUser(@Param() parameter): boolean{
            const success = this.service.deleteUser(parameter.id);
            if(!success) throw new HttpException(`Could not find a user with the id ${parameter.id}`, HttpStatus.NOT_FOUND);
            return success;
        }
        
}
