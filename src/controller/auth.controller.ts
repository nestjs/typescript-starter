import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../shared/auth.guard';
@Controller('api/auth')
@UseGuards(new AuthGuard())
export class AuthController {
	constructor() { }

	@Get()
	getHello(): string {
		return null;
	}
}