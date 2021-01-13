import {
	Injectable,
	CanActivate,
	ExecutionContext,
	HttpException,
	HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../service/auth.service';

@Injectable()
export class JWTAuthGuard implements CanActivate {

	constructor(private authService: AuthService) { }

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest();
		if (request) {
			if (!request.headers.authorization) {
				return false;
			}
			try {
				request.payload = await this.authService.validateToken(request.headers.authorization);
				return true;
			} catch (error) {
				throw new HttpException(error.message, HttpStatus.UNAUTHORIZED)
			}
		}
	}

}

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') { }

