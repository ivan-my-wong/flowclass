import { Global, Module } from '@nestjs/common'

import { SSEController } from '@/modules/sse/sse.controller'
import { SSEService } from '@/modules/sse/sse.service'

@Global()
@Module({
  providers: [SSEService],
  controllers: [SSEController],
  exports: [SSEService],
})
export class SSEModule {}
