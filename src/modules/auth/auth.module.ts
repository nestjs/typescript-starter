import { Module } from '@nestjs/common';
import { DbModule } from '@utils';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [DbModule.forFeature()],
  controllers: [AuthController],
  providers: [AuthService],
})
class AuthModule {}

export { AuthModule };
