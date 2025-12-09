import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable, tap } from 'rxjs'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest()
    const res = context.switchToHttp().getResponse()

    const { method, originalUrl } = req

    return next.handle().pipe(
      tap(() => {
        console.log(`${method} ${originalUrl} - ${res.statusCode}`)
      }),
    )
  }
}
