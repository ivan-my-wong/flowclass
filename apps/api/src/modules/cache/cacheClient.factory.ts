import { FactoryProvider, Logger } from '@nestjs/common'
import { Redis } from 'ioredis'

export const redisClientFactory: FactoryProvider<Redis> = {
  provide: 'RedisClient',
  useFactory: () => {
    const logger = new Logger('RedisClient')

    const redisInstance = new Redis({
      host: process.env.REDIS_URL,
      port: +process.env.REDIS_PORT,
      retryStrategy: (times: number) => {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      maxRetriesPerRequest: 3,
      connectTimeout: 10000,
      lazyConnect: true,
      reconnectOnError: (err) => {
        const targetError = 'READONLY'
        if (err.message.includes(targetError)) {
          return true
        }
        return false
      },
    })

    redisInstance.on('error', (error) => {
      logger.error(`Redis connection error: ${error.message}`)
      // Don't throw error, just log it
    })

    redisInstance.on('connect', () => {
      logger.log('Successfully connected to Redis')
    })

    redisInstance.on('reconnecting', () => {
      logger.warn('Reconnecting to Redis...')
    })

    return redisInstance
  },
  inject: [],
}
