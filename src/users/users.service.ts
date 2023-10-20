import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { User } from './users.entity';

let id: number = 1;

const users : User[] = [
    {
        id: 0,
        lastname: 'Doe',
        firstname: 'John',
        age: 23
    }
]

@Injectable()
export class UsersService {
    getAll(): User[] {
        return users;
    }

    getById(id: number): User {
        const result = users.filter((user)=> user.id==id);
        return result[0];
    }

    create(lastname: string, firstname: string, age: number): User {
        const newUser = new User(id, lastname, firstname, age);
        id = id+1;
        users.push(newUser);
        return newUser;
    }

    modifyUser(id: number, lastname: string, firstname: string, age: number): User {
        const result = users.filter((user)=> user.id==id);
        if(firstname !== undefined){
            result[0].firstname = firstname;
        }
        if(lastname !== undefined){
            result[0].lastname = lastname;
        }
        return result[0];
    }

    deleteUser(id: number): boolean{
        const result = users.filter((user)=> user.id==id);
        const index = users.indexOf(result[0]);
        if(index===-1){
            return false;
        }
        else{
            users.splice(index,1);
            return true;
        }
    }
}
