import { Global, Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Media } from '@/models/media.entity'
import { MediaRepository } from '@/models/media.repository'

import { MediaController } from './media.controller'
import { MediaService } from './media.service'

@Global()
@Module({
  imports: [
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    TypeOrmModule.forFeature([Media]),
  ],
  exports: [TypeOrmModule, MediaService],
  controllers: [MediaController],
  providers: [MediaService, MediaRepository],
})
export class MediaModule {}
