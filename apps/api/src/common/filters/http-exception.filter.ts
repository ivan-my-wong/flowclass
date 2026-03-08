import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { Response } from 'express'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(public reflector: Reflector) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const status = exception.getStatus()

    response.status(status).json({
      message: exception.message,
      statusCode: status,
      errorCode: HttpStatus[status],
      data: exception['data'] ? exception['data'] : '',
    })
  }
}
