import {
	Injectable,
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JWTAuthGuard implements CanActivate {
	configService: ConfigService
	constructor() {
		this.configService = new ConfigService()
	}
	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		if (request) {
			if (!request.headers.authorization) {
				return false;
			}
			request.user = await this.validateToken(request.headers.authorization);
			return true;
		}
	}
	async validateToken(auth: string) {
		if (auth.split(' ')[0] !== 'Bearer') {
			throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
		}
		
		try {
			const token = auth.split(' ')[1];
			const secret = this.configService.get('JWT_SECRET');
			const decoded: any = await jwt.verify(token, secret);
			return decoded;
		} catch (err) {
			const message = 'Token error: ' + (err.message || err.name);
			throw new HttpException(message, HttpStatus.UNAUTHORIZED);
		}
	}
}

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}