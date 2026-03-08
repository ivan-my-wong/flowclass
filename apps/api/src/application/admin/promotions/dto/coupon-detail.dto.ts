import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'
import { IsBoolean, IsEnum, IsNumber } from 'class-validator'

import { DiscountType } from '@/models/enums/'
import { CouponStatus } from '@/models/enums/status'
import { SeoContent } from '@/models/seo-setting.entity'

@Exclude()
export class CouponDetailDto {
  @ApiProperty()
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  siteId: number

  @ApiPropertyOptional()
  @Expose()
  institutionId: number

  @ApiPropertyOptional()
  @Expose()
  courseIds: number[]

  @ApiPropertyOptional()
  @Expose()
  code: string

  @ApiPropertyOptional()
  @Expose()
  quota: number

  @ApiPropertyOptional()
  @Expose()
  multiplePurpose: boolean

  @ApiPropertyOptional()
  @IsEnum(DiscountType)
  @Expose()
  discountType: DiscountType

  @ApiPropertyOptional()
  @Expose()
  amount: number

  @Expose()
  forBundle: number

  @Expose()
  forTrialLesson: number

  @ApiProperty()
  @Expose()
  expireDate: string

  @ApiProperty()
  @Expose()
  @IsEnum(CouponStatus)
  status: CouponStatus

  @ApiProperty()
  @Expose()
  @IsBoolean()
  deletedAt: Date
}

@Exclude()
export class CouponDetailDtoV2 extends CouponDetailDto {
  @ApiPropertyOptional()
  @Expose()
  studentsAssigned: IStudentAssigned[]

  @ApiPropertyOptional()
  @Expose()
  courseAssigned?: ICourseAssigned[]

  @ApiPropertyOptional()
  @Expose()
  @IsNumber()
  usage: number
}

export class IStudentAssigned {
  email: string
  lastName: string
  firstName: string
  id: number
  avatarUrl: string
}

export class ICourseAssigned {
  name: string
  type: string
  seoContent: SeoContent
  id: number
  previewImageName: string
  previewImageUrl: string
  classes: IClassAssigned[]
}

export class IClassAssigned {
  id: number
  name: string
}
