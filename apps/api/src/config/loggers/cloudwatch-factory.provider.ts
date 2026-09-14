import {
  CloudWatchLogsClient,
  CreateLogStreamCommand,
  DescribeLogStreamsCommand,
} from '@aws-sdk/client-cloudwatch-logs'
import { Injectable, Logger } from '@nestjs/common'

@Injectable()
export class CloudWatchLoggerFactory {
  readonly defaultLogger = new Logger()
  private client
  readonly logGroupName: string
  protected logStreamName: string
  isCloudWatch = false

  constructor() {
    this.logStreamName = `${new Date().toISOString().split('T')[0]}`
    if (process.env.APP_ENV === 'production' || process.env.APP_ENV === 'staging') {
      try {
        this.client = new CloudWatchLogsClient({
          region: process.env.AWS_REGION,
          // credential will be injected via AWS
          // credentials: {},
        })
        this.logGroupName = process.env.CLOUDWATCH_LOG_GROUP_NAME

        // Check if the log stream exists, and create it if it doesn't
        this.isCloudWatch = true
        this.createCloudWatchLogStream()
      } catch (e) {
        this.defaultLogger.error(e)
      }
    } else {
      this.client = this.defaultLogger
    }
  }

  private async createCloudWatchLogStream() {
    const describeLogStreamsCommand = new DescribeLogStreamsCommand({
      logGroupName: this.logGroupName,
      logStreamNamePrefix: this.logStreamName,
    })

    try {
      const result = await this.client.send(describeLogStreamsCommand)
      const logStreams = result.logStreams

      if (logStreams && logStreams.length > 0) {
        // Log stream already exists, do not create a new one
        return
      }
    } catch (e) {
      this.defaultLogger.log(e)
    }

    // Log stream does not exist, create a new one
    const createLogStreamCommand = new CreateLogStreamCommand({
      logGroupName: this.logGroupName,
      logStreamName: this.logStreamName,
    })

    try {
      await this.client.send(createLogStreamCommand)
    } catch (e) {
      this.defaultLogger.log(e)
    }
  }

  setStreamName(streamName: string) {
    this.logStreamName = `${new Date().toISOString().split('T')[0]}/${streamName}`
    if (this.isCloudWatch) {
      this.createCloudWatchLogStream()
    }
  }

  getStreamName() {
    return this.logStreamName
  }

  getClient() {
    return this.client
  }
}
