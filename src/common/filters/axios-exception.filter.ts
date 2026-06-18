import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common'
import { AxiosError } from 'axios'

@Catch(AxiosError)
export class AxiosExceptionFilter implements ExceptionFilter {
    catch(exception: AxiosError, host: ArgumentsHost) {
        const ctx = host.switchToHttp()
        const res = ctx.getResponse()
        const status = exception.response?.status ?? HttpStatus.BAD_GATEWAY
        const body = exception.response?.data ?? { message: exception.message }

        res.status(status).json(body)
    }
}
