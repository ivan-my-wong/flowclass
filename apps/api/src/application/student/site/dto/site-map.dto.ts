import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
@Exclude()
export class StudentSiteMapDto {
  @ApiProperty()
  @Expose()
  url: string

  @ApiProperty()
  @Expose()
  lastmod: Date
}
