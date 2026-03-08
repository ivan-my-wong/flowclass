import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Inject, Injectable } from '@nestjs/common'
import { Cache } from 'cache-manager'

import { ICacheRepository } from './types/cacheClient'
@Injectable()
export class CacheRepository implements ICacheRepository {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheClient: Cache) {}

  async get(key: string): Promise<string | null> {
    return this.cacheClient.get(key)
  }

  async getJSON(key: string): Promise<Record<string, any> | null> {
    const value: string = await this.cacheClient.get(key)
    if (!value) return null
    return JSON.parse(value)
  }

  async set(key: string, value: string): Promise<void> {
    await this.cacheClient.set(key, value)
  }

  async delete(key: string): Promise<void> {
    await this.cacheClient.del(key)
  }

  async setWithExpiry(key: string, value: string, expiry: number): Promise<void> {
    await this.cacheClient.set(key, value, expiry)
  }
}
