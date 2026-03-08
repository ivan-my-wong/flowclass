import { CacheModule } from '@nestjs/cache-manager'
import { Global, Module } from '@nestjs/common'

import { CacheRepository } from './cacheClient.repository'

@Global()
@Module({
  imports: [
    CacheModule.register({
      store: 'memory',
    }),
  ],
  controllers: [],
  providers: [CacheRepository],
  exports: [CacheRepository],
})
export class CacheClientModule {}
