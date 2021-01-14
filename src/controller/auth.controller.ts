import { Controller, Get, Post, UseGuards, Request, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { LocalAuthGuard, JWTAuthGuard } from '../shared/auth.guard';
import { IsInt, IsString } from 'class-validator';
import { UserLoginDto } from '../dto/auth/auth.dto';
import { AuthService } from '../service/auth.service';
@Controller()
export class AuthController {
	constructor(private readonly authService: AuthService) { }
	@Post('api/auth/login')
	async login(@Body() body: UserLoginDto) {
		try {
			const user = await this.authService.validateUser(body.username, body.password)
			const token = await this.authService.encodeToken({ ...user })
			return { access_token: token }
		} catch (error) {
			throw error
		}
	}

	@ApiBearerAuth()
	@UseGuards(JWTAuthGuard)
	@Get('api/auth/token-valid')
	async validateToken(@Request() req) {
		return {
			payload: req.payload
		}
	}
}