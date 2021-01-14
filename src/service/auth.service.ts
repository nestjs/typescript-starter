import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './user.service';
import * as jwt from 'jsonwebtoken';
import { ERROR_RESPONSE } from '../constant/ErrorResponse';
@Injectable()
export class AuthService {
	constructor(
		private usersService: UsersService,
		private configService: ConfigService
	) { }

	async validateUser(username: string, pass: string): Promise<any> {
		const user = await this.usersService.findOne(username);
		if (!user) {
			throw new HttpException(ERROR_RESPONSE.NOT_FOUND_USER, HttpStatus.BAD_REQUEST);
		}
		if (user && user.password === pass) {
			const { password, ...result } = user;
			return result;
		} else {
			throw new HttpException(ERROR_RESPONSE.INVALID_PASSWORD, HttpStatus.BAD_REQUEST);
		}
	}
	async validateToken(auth: string) {
		if (auth.split(' ')[0] !== 'Bearer') {
			throw new Error('Invalid token');
		}
		try {
			const token = auth.split(' ')[1];
			const secret = this.configService.get('JWT_SECRET');
			const decoded: any = await jwt.verify(token, secret);
			return decoded;
		} catch (error) {
			const err = ERROR_RESPONSE.INVALID_TOKEN
			err.message = 'Token error: ' + (error.message || error.name);
			throw new HttpException(error, HttpStatus.UNAUTHORIZED);
		}
	}
	async encodeToken(payload: any) {
		try {
			const secret = this.configService.get('JWT_SECRET');
			const encode = jwt.sign(payload, secret)
			return encode;
		} catch (error) {
			throw new Error(error.message);
		}

	}
}