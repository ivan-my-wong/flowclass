import { ApiProperty } from '@nestjs/swagger'
import { IsArray } from 'class-validator'

import { PageMetaDto } from './page-meta.dto'

export class PageDto<T> {
  @IsArray() @ApiProperty({ isArray: true }) content: T[]

  @ApiProperty({ type: () => PageMetaDto }) readonly meta: PageMetaDto

  constructor(content: T[], meta: PageMetaDto) {
    this.content = content
    this.meta = meta
  }
}
