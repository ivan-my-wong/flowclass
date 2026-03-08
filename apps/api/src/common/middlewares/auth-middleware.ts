import { Injectable, NestMiddleware } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { AuthorizationException } from 'src/exceptions/authorization.exception'

import { CloudWatchLoggerProvider } from '@/config/loggers/cloudwatch-nestjs.provider'

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly logger: CloudWatchLoggerProvider
  ) {}

  async use(req: any, res: any, next: () => void): Promise<void> {
    const { ip, method, originalUrl } = req

    const bearToken: string = req.headers['authorization']

    if (!bearToken) {
      throw AuthorizationException.unauthorizedException()
    }

    const token: string = req.headers['authorization'].split(' ')[1]

    try {
      await this.jwtService.verify(token)

      next()
    } catch (error) {
      this.logger.error(
        `Request ${method} - ${originalUrl} - ${ip} invalid credentials`,
        error.stack
      )

      if (error.name === 'TokenExpiredError') {
        throw AuthorizationException.tokenExpiredException()
      }

      throw AuthorizationException.tokenInvalidException(error.message)
    }
  }
}
