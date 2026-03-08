import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class StudentGetSingleSiteDTO {
  @IsString()
  @ApiProperty()
  domain: string
}
