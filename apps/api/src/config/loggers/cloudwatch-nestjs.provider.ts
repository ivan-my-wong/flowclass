import { PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs'
import { Injectable, LoggerService } from '@nestjs/common'

import { CloudWatchLoggerFactory } from './cloudwatch-factory.provider'

@Injectable()
export class CloudWatchLoggerProvider extends CloudWatchLoggerFactory implements LoggerService {
  constructor() {
    super()
  }

  log(message: string) {
    if (this.isCloudWatch) {
      const command = new PutLogEventsCommand({
        logGroupName: this.logGroupName,
        logStreamName: this.logStreamName,
        logEvents: [
          {
            message,
            timestamp: Date.now(),
          },
        ],
      })

      this.getClient()
        .send(command)
        .then()
        .catch(() => {
          this.defaultLogger.log(message)
        })
    } else {
      this.defaultLogger.log(message)
    }
  }

  error(message: string, trace: string) {
    // You can customize the error log format according to your needs.
    this.log(`[error] ${message} | ${trace}`)
  }

  warn(message: string) {
    this.log(`[warn] ${message}`)
  }
}
