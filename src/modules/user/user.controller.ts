import {
  Controller,
  Get,
  Headers,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Response } from '@shared';
import { UserService } from './user.service';

@Controller('user')
class UserController {
  /**
   * Logger instance
   */
  private readonly l = new Logger('UserService', true);
  /**
   * Inject dependencies
   */
  constructor(private readonly userService: UserService) {}
  /**
   * Get user info route
   */
  @Get('/info')
  public async info(
    @Headers() headers: { authorization: string },
  ): Promise<Response> {
    try {
      const { authorization } = headers;
      const token = authorization.replace('Bearer ', '');
      const result = await this.userService.info(token);
      return result;
    } catch (error) {
      this.l.error('exception', error);
      throw new InternalServerErrorException(error.message);
    }
  }
}

export { UserController };
