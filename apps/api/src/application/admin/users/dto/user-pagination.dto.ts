import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional } from 'class-validator'

import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'

import { UserDetailDto } from './user-detail.dto'

export class UserPageDto extends PageDto<UserDetailDto> {}

export class UserPageOptionDto extends PageOptionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  email: string

  @ApiPropertyOptional()
  @IsOptional()
  firstName: string

  @ApiPropertyOptional()
  @IsOptional()
  lastName: string

  @ApiProperty()
  @IsNotEmpty()
  siteId: string

  @ApiPropertyOptional()
  @IsOptional()
  institutionId: string
}
