import { Module } from '@nestjs/common';
import { AuthGuard } from '../shared/auth.guard';
import { AuthController } from '../controller/auth.controller';

@Module({
	imports: [],
	controllers: [AuthController],
	providers: [AuthGuard]
})
export class AuthModule { }
