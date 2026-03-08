import { Injectable, Logger, LoggerService } from '@nestjs/common'

@Injectable()
export class CloudWatchLoggerProvider implements LoggerService {
  private readonly logger = new Logger()

  log(message: string) {
    this.logger.log(message)
  }

  error(message: string, trace?: string) {
    this.logger.error(message, trace)
  }

  warn(message: string) {
    this.logger.warn(message)
  }
}
