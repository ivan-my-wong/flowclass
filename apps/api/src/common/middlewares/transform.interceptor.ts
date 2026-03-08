import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, IResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<IResponse<T>> {
    return next.handle().pipe(
      map((data: any) =>
        data?.isApiResult
          ? data
          : {
              data,
              statusCode: context.switchToHttp().getResponse().statusCode,
              message: data?.message || '',
            }
      )
    )
  }
}

export interface IResponse<T> {
  statusCode: number
  data: T
  message: string[] | string | null
}
