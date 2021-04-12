import {
  Body,
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
  Logger,
  Post,
  Res,
} from '@nestjs/common';
import { Response, SigninDto, SignupDto } from '@shared';
import { Response as ServerResponse } from 'express';
import { AuthService } from './auth.service';

@Controller('auth')
class AuthController {
  /**
   * Logger instance
   */
  private readonly l = new Logger('AuthService', true);
  /**
   * Inject dependencies
   */
  constructor(private readonly authService: AuthService) {}

  /**
   * Signup route
   */
  @Post('/signup')
  public async signup(
    @Body() body: SignupDto,
    @Res() res: ServerResponse,
  ): Promise<void> {
    try {
      const result = await this.authService.signup(body);
      res
        .status(HttpStatus.CREATED)
        .send(new Response({ status: true, data: result, message: 'ok' }));
    } catch (error) {
      this.l.error('exception', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Signin route
   */
  @Post('/signin')
  public async signin(
    @Body() body: SigninDto,
    @Res() res: ServerResponse,
  ): Promise<ServerResponse> {
    try {
      const { status, message, token } = await this.authService.signin(body);
      if (status) {
        return res.status(HttpStatus.CREATED).send(
          new Response({
            message: 'ok',
            status,
            data: {
              token,
            },
          }),
        );
      }
      return res
        .status(HttpStatus.ACCEPTED)
        .send(new Response({ message, status }));
    } catch (error) {
      this.l.error('exception', error);
      throw new InternalServerErrorException(error.message);
    }
  }

  /**
   * Logout route
   */
  @Get('/logout')
  public async logout(@Res() res: ServerResponse): Promise<ServerResponse> {
    //TODO: Needs rework
    try {
      return res
        .header({ Autorization: '' })
        .status(HttpStatus.CREATED)
        .send(new Response({ message: 'ok', status: true }));
    } catch (error) {
      throw new Error(error.message);
    }
  }
}

export { AuthController };
