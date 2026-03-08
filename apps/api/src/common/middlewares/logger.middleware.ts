import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'

import { CloudWatchLoggerProvider } from '@/config/loggers/cloudwatch-nestjs.provider'

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(private readonly logger: CloudWatchLoggerProvider) {}

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request
    const userAgent = request.get('user-agent') || ''

    response.on('finish', () => {
      const { statusCode, statusMessage } = response
      const logObject = {
        query: request.query,
        body: request.body,
      }
      if (statusCode >= 400) {
        this.logger.error(
          `${method.toUpperCase()} ${originalUrl} ${statusCode}(${statusMessage}) - ${userAgent} ${ip}`,
          JSON.stringify(logObject)
        )
      }
      if (statusCode < 300) {
        this.logger.log(
          `${method.toUpperCase()} ${originalUrl} ${statusCode}(${statusMessage}) - ${userAgent} ${ip}`
        )
      }
    })

    next()
  }
}
