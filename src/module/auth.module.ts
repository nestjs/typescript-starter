import { Module } from '@nestjs/common';
import { JWTAuthGuard, LocalAuthGuard } from '../shared/auth.guard';
import { AuthController } from '../controller/auth.controller';
import { UsersModule } from './user.module';
import { AuthService } from '../service/auth.service';
import { LocalStrategy } from '../shared/auth.strategy';
import { PassportModule } from '@nestjs/passport';

@Module({
	imports: [UsersModule,PassportModule],
	controllers: [AuthController],
	providers: [JWTAuthGuard,LocalAuthGuard,AuthService,LocalStrategy],
	exports:[AuthService,JWTAuthGuard,LocalAuthGuard]
})
export class AuthModule { }
