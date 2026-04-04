import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

import { PageOptionsDto } from '@/common/pagination/page-options.dto'

export class PackageDiscountsObject {
  @ApiProperty()
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  siteId: number

  @ApiProperty()
  @Expose()
  institutionId: number

  @ApiProperty()
  @Expose()
  name: string

  @ApiProperty()
  @Expose()
  amountPerLesson: number
}

export class PackageDiscountsPageOptionDto extends PageOptionsDto {
  @ApiProperty()
  @IsNotEmpty()
  siteId: number

  @ApiProperty()
  @IsNotEmpty()
  institutionId: number
}

export class CreatePackageDiscountDto {
  @ApiProperty()
  @IsString()
  name: string

  @ApiProperty()
  @IsNumber()
  siteId: number

  @ApiProperty()
  @IsNumber()
  institutionId: number

  @ApiProperty()
  @IsNumber()
  amountPerLesson: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAllClasses?: boolean

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  applicableClassIds?: number[]
}

export class UpdatePackageDiscountDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  amountPerLesson?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isAllClasses?: boolean

  @ApiProperty({ type: [Number], required: false })
  @IsOptional()
  @IsArray()
  @Type(() => Number)
  applicableClassIds?: number[]
}
