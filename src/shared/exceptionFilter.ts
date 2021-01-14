import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<FastifyReply>();
    const req = ctx.getRequest<FastifyRequest>();
    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let responseData = {
      statusCode: 500,
      timestamp: new Date().toISOString(),
      error: null,
      path: req.url
    }
    if (exception instanceof Error) {
      responseData.error = {
        message: exception.message,
        code: exception.name.toLocaleUpperCase()
      }
    }
    if (exception instanceof HttpException) {
      status = exception.getStatus()
      responseData.statusCode = exception.getStatus()
      const { message, error,code } = exception.getResponse() as any
      responseData.error = {
        message: message,
        code: code || error
      }
    }

    res.status(status).send(responseData);
  }
}