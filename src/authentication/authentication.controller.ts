import {
  Body,
  Req,
  Controller,
  HttpCode,
  Post,
  Res,
  Get,
  SerializeOptions,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthenticationService } from './authentication.service';
import RegisterDto from './dto/register.dto';
import RequestWithUser from './request-with-user.interface';
import { UsersService } from '../users/users.service';
import { Public } from '../shared/decorators/public.decorator';
import { LocalAuthenticationGuard } from './local-authentication.guard';
import JwtRefreshGuard from './jwt-refresh.guard';

@Controller('authentication')
@SerializeOptions({
  strategy: 'excludeAll',
})
export class AuthenticationController {
  constructor(
    private readonly authenticationService: AuthenticationService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Get('refresh')
  refresh(@Req() request: RequestWithUser) {
    const accessTokenCookie =
      this.authenticationService.createCookieWithJwtAccessToken(
        request.user.id,
      );

    request.res.setHeader('Set-Cookie', accessTokenCookie);
    return request.user;
  }

  @Public()
  @Post('register')
  async register(@Body() registrationData: RegisterDto) {
    return this.authenticationService.register(registrationData);
  }

  @Get()
  authenticate(@Req() request: RequestWithUser) {
    const user = request.user;
    user.password = undefined;
    return user;
  }

  @HttpCode(200)
  @Public()
  @UseGuards(LocalAuthenticationGuard)
  @Post('log-in')
  async logIn(@Req() request: RequestWithUser) {
    const { user } = request;
    const accessTokenCookie =
      this.authenticationService.createCookieWithJwtAccessToken(user.id);
    const refreshTokenCookie =
      this.authenticationService.createCookieWithJwtRefreshToken(user.id);

    await this.usersService.setCurrentRefreshToken(
      refreshTokenCookie.token,
      user.id,
    );

    request.res.setHeader('Set-Cookie', [
      accessTokenCookie,
      refreshTokenCookie.cookie,
    ]);
    return user;
  }

  @Post('log-out')
  @HttpCode(200)
  async logOut(@Req() request: RequestWithUser) {
    await this.usersService.removeRefreshToken(request.user.id);
    request.res.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookieForLogOut(),
    );
  }

  @Delete('user')
  async delete(@Req() request: RequestWithUser, @Res() response: Response) {
    response.setHeader(
      'Set-Cookie',
      this.authenticationService.getCookieForLogOut(),
    );
    const deletedUser = await this.usersService.delete(request.user.id);
    if (deletedUser) {
      return response.sendStatus(200);
    }
  }
}
