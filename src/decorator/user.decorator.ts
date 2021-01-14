import { createParamDecorator, ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_RESPONSE } from '../constant/ErrorResponse';

export const TokenPayload = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (request.payload) {
      if (data in request.payload) {
        return request.payload[data]
      } else {
        return request.payload;
      }
    } else {
      throw new HttpException(ERROR_RESPONSE.INVALID_TOKEN, HttpStatus.UNAUTHORIZED)
    }
  },
);