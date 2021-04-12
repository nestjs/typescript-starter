import { Module } from '@nestjs/common';
import { DbModule } from '@utils';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [DbModule.forFeature()],
  controllers: [UserController],
  providers: [UserService],
})
class UserModule {}

export { UserModule };
