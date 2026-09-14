import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, Matches, MaxLength } from 'class-validator'

import { VALID_DOMAIN_PATTERN } from '@/common/constants'
export class RegisterSiteDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(255)
  name: string

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(VALID_DOMAIN_PATTERN, {
    message: 'url must be lowercase and can only contain letters, numbers and dashes',
  })
  url: string
}
