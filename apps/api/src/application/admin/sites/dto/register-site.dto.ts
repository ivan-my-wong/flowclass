import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty, Matches, MaxLength } from 'class-validator'

import { VALID_FREE_FORM_DOMAIN_PATTERN } from '@/common/constants'

export class RegisterSiteDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(255)
  name: string

  @ApiProperty({
    description: 'Free-form domain (e.g. example.com, localhost, my-school.local)',
  })
  @IsNotEmpty()
  @MaxLength(255)
  @Transform(({ value }) => (typeof value === 'string' ? value.toLowerCase().trim() : value))
  @Matches(VALID_FREE_FORM_DOMAIN_PATTERN, {
    message: 'url must be lowercase; use localhost or a valid domain (e.g. example.com)',
  })
  url: string
}
