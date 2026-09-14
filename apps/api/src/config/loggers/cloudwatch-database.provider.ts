import { PutLogEventsCommand } from '@aws-sdk/client-cloudwatch-logs'
import { Injectable } from '@nestjs/common'
import { AbstractLogger, LogLevel, LogMessage, QueryRunner } from 'typeorm'

import { CloudWatchLoggerFactory } from './cloudwatch-factory.provider'

@Injectable()
export class CloudWatchDatabaseLoggerProvider extends AbstractLogger {
  private readonly cloudWatch: CloudWatchLoggerFactory

  constructor() {
    super()
    this.cloudWatch = new CloudWatchLoggerFactory()
    this.cloudWatch.setStreamName('postgres')
  }

  /**
   * Write log to specific output.
   */
  protected writeLog(
    level: LogLevel,
    logMessage: LogMessage | LogMessage[],
    queryRunner?: QueryRunner
  ) {
    const messages = this.prepareLogMessages(logMessage, {
      highlightSql: false,
    })

    for (const message of messages) {
      switch (message.type ?? level) {
        case 'log':
        case 'schema-build':
        case 'migration':
          this.logToCloudWatch(message.message.toString())
          break

        case 'info':
        case 'query':
          if (message.prefix) {
            this.logQuery(`[${message.prefix}] ${message.message}`)
          } else {
            this.logQuery(message.message.toString())
          }
          break

        case 'warn':
        case 'query-slow':
          if (message.prefix) {
            this.logSlow(`[${message.prefix}] ${message.message}`)
          } else {
            this.logSlow(message.message.toString())
          }
          break

        case 'error':
        case 'query-error':
          if (message.prefix) {
            this.logError(message.prefix, message.message.toString())
          } else {
            this.logError(message.prefix, message.message.toString())
          }
          break
      }
    }
  }

  logQuery(message: string) {
    this.logToCloudWatch(message)
  }

  logError(message: string, trace: string) {
    this.logToCloudWatch(`[error] ${message} | ${trace}`)
  }

  logSlow(message: string) {
    this.logToCloudWatch(`[slow] ${message}`)
  }

  private logToCloudWatch(message: string) {
    if (this.cloudWatch.isCloudWatch) {
      const command = new PutLogEventsCommand({
        logGroupName: this.cloudWatch.logGroupName,
        logStreamName: this.cloudWatch.getStreamName(),
        logEvents: [
          {
            message,
            timestamp: Date.now(),
          },
        ],
      })

      this.cloudWatch
        .getClient()
        .send(command)
        .catch((e) => {
          this.cloudWatch.defaultLogger.log(e)
        })
    } else {
      this.cloudWatch.defaultLogger.log(message)
    }
  }
}
