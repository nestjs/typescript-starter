import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { LocalAuthGuard } from '../shared/auth.guard';
@Controller()
export class AuthController {
	constructor() { }

	@UseGuards(LocalAuthGuard)
	@Post('api/auth/login')
	async login(@Request() req) {
		return { user: req.user || null };
	}
}