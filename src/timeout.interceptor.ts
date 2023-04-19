import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    RequestTimeoutException,
} from '@nestjs/common';
import { Observable, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

// timeout exception code that is used in main.ts. didnt work as expected
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            timeout(5000),
            catchError((err) => {
                if (err instanceof TimeoutError) {
                    throw new RequestTimeoutException();
                }
                return err;
            }),
        );
    }
}
