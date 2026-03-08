import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'

import { StudentGetPayoutPreferenceDto } from '../../../student/request-payout/dto/receive-Payout-Preference.dto'

export class GetPayoutPreferenceWithPageDto extends PageDto<StudentGetPayoutPreferenceDto> {}

export class GetPayoutPreferenceWithPageOptionDto extends PageOptionsDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiPropertyOptional({
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ obj, key }) => {
    return obj[key] === 'true'
  })
  getEnabledOnly: boolean
}
