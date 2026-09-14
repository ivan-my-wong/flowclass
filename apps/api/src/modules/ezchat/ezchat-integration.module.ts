import { Module } from '@nestjs/common'
import axios from 'axios'

import { EZCHAT_CLIENT, EZCHAT_TOKEN } from '@/common/constants/provider-keys'

import { EzchatService } from './ezchat-integration.service'

@Module({
  providers: [
    {
      provide: EZCHAT_CLIENT,
      useFactory: () => {
        const token = process.env.EZCHAT_TOKEN

        const fetchClient = axios.create({
          baseURL: process.env.EZCHAT_BASE_URL,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        })
        return fetchClient
      },
    },
    {
      provide: EZCHAT_TOKEN,
      useFactory: () => {
        return process.env.EZCHAT_TOKEN
      },
    },
    EzchatService,
  ],
  exports: [EZCHAT_CLIENT, EZCHAT_TOKEN, EzchatService],
})
export class EzchatIntegrationModule {}
