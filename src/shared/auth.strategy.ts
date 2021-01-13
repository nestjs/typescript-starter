import { Strategy as StrategyLocal } from 'passport-local';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { ExtractJwt,Strategy as StrategyJwt } from 'passport-jwt';

@Injectable()
export class LocalStrategy extends PassportStrategy(StrategyLocal) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
		const user = await this.authService.validateUser(username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}


@Injectable()
export class JwtStrategy extends PassportStrategy(StrategyJwt) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username };
  }
}
