import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

import { InstructorDataDto } from '../../instructors/dto/instructor-data.dto'

import { Permission } from './user-role.dto'

@Exclude()
export class UserDetailDto {
  @ApiProperty()
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  email: string

  @ApiProperty()
  @Expose()
  firstName: string

  @ApiProperty()
  @Expose()
  lastName: string

  @ApiProperty()
  @Expose()
  isEmailVerified: boolean

  @ApiProperty()
  @Expose()
  phone: string

  @ApiProperty()
  @Expose()
  lastActiveTime: Date

  @ApiProperty()
  @Expose()
  avatarUrl: string

  @ApiProperty()
  @Expose()
  company: string

  @ApiProperty()
  @Expose()
  position: string

  @ApiProperty()
  @Expose()
  social: string

  @ApiProperty()
  @Expose()
  country: string

  @ApiProperty()
  @Expose()
  deletedAt: Date

  @ApiProperty()
  @Expose()
  visibility: string

  @Expose()
  @Type(() => Permission)
  permissions: Permission[]
}

export class UpComingClassesDto extends InstructorDataDto {
  @ApiProperty({
    example: true,
    description: 'Exclude future classes',
  })
  @IsBoolean()
  @IsOptional()
  includeFuture?: boolean
}

export class InstructorLessonExportDto {
  @ApiProperty({
    example: 1,
    description: 'The ID of the instructor',
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  instructorId: number

  @ApiProperty({
    example: 1,
    description: 'The ID of the institution',
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  institutionId: number

  @ApiProperty({
    example: 1,
    description: 'The ID of the Site',
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  siteId: number

  @ApiProperty({
    example: [1, 2, 3],
    required: false,
    description: 'The IDs of the courses',
  })
  @IsArray()
  @IsOptional()
  courseIds?: number[]

  @ApiProperty({
    example: [1, 2, 3],
    required: false,
    description: 'The IDs of the classes',
  })
  @IsArray()
  @IsOptional()
  classIds?: number[]

  @ApiProperty({
    example: [1, 2, 3],
    required: false,
    description: 'The IDs of the locations',
  })
  @IsArray()
  @IsOptional()
  locationIds?: number[]
}
