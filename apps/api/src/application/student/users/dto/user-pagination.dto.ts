import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'

import { StudentUserDetailDto } from './user-detail.dto'

export class UserPageDto extends PageDto<StudentUserDetailDto> {}

export class StudentUserPageOptionDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  email: string

  @ApiPropertyOptional()
  @IsOptional()
  firstName: string

  @ApiPropertyOptional()
  @IsOptional()
  lastName: string

  @ApiPropertyOptional()
  @IsOptional()
  siteId: string

  @ApiPropertyOptional()
  @IsOptional()
  institutionId: string
}
