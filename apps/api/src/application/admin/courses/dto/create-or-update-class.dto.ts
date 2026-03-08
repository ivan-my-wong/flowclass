import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator'

import { PageOptionsDto } from '@/common/pagination/page-options.dto'
import { ApplicationPeriod, ClassEntity } from '@/models/classes.entity'
import { ClassTypeEnum, PriceType } from '@/models/enums/'

import { CheckQuotaResponseDto } from '../../class-lesson/dto/list-class-lesson.dto'
import { UpdateClassRegularScheduleDto } from '../../class-regular-schedules/dto/class-regular-schedules.dto'
import { CreateRepeatFormatDto } from '../../institutions/dto/institution-repeat-format.dto'

import { AppointmentDTO } from './appointment.dto'
import { ClassPriceOptionDTO } from './class-price-options.dto'
import { CourseDTO } from './create-or-update-course.dto'
import { LessonDateDTO } from './create-or-update-lesson-date.dto'
import {
  CreateRegularPeriodsDto,
  UpdateRegularPeriodsDto,
} from './create-or-update-regular-periods.dto'

export class ClassDTO extends CourseDTO {
  createdBy: number
  updatedBy: number

  @ApiProperty({ example: 'Class Name ' })
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsOptional()
  classesCode: string

  @ApiPropertyOptional({ example: ['Good, better, best'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @ApiProperty({ example: 20 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quota: number

  @ApiProperty({ enum: PriceType, example: PriceType.PER_LESSON })
  @IsNotEmpty()
  @IsEnum(PriceType)
  priceType: PriceType

  @ApiPropertyOptional({
    isArray: true,
    description: 'Price options for the class',
    type: ClassPriceOptionDTO,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ClassPriceOptionDTO)
  priceOptions?: ClassPriceOptionDTO[]

  @ApiProperty({ example: ClassTypeEnum.REGULAR })
  @IsNotEmpty()
  @IsEnum(ClassTypeEnum)
  type: ClassTypeEnum

  @ApiPropertyOptional({
    isArray: true,
    example: [CreateRegularPeriodsDto.example_without_id, UpdateRegularPeriodsDto.example_with_id],
    items: {
      type: 'object',
      properties: {
        ...CreateRegularPeriodsDto.type_definition.properties,
        ...UpdateRegularPeriodsDto.type_definition.properties,
      },
    },
    type: UpdateRegularPeriodsDto,
  })
  @IsNotEmpty()
  @IsOptional()
  regularPeriods: CreateRegularPeriodsDto[] | UpdateRegularPeriodsDto[]

  @ApiPropertyOptional({
    type: UpdateClassRegularScheduleDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateClassRegularScheduleDto)
  regularScheduleV2?: UpdateClassRegularScheduleDto

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  locationId: number

  @ApiProperty({ example: 1 })
  @IsOptional()
  @IsNumber()
  instructorId: number

  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  dropIn: boolean

  @ApiPropertyOptional({ example: 2 })
  @IsInt()
  @Min(0)
  @IsOptional()
  enrollmentOffset?: number

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  discountedPrice?: number

  @ApiPropertyOptional({ example: 'English' })
  @IsOptional()
  teachingLanguage: string

  @ApiPropertyOptional()
  @IsOptional()
  locality: string

  @ApiPropertyOptional()
  @IsOptional()
  detailAddress: string

  @ApiPropertyOptional()
  @IsOptional()
  classDescription: string

  @ApiPropertyOptional()
  @IsOptional()
  classMeetingUrl: string

  @ApiPropertyOptional()
  @IsOptional()
  classRemark: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  setMultipleClass: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  setMultipleApplicant: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoPay: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateRepeatFormatDto)
  recurringFormat: CreateRepeatFormatDto

  @ApiPropertyOptional({
    isArray: true,
    example: [CreateRegularPeriodsDto.example_without_id, UpdateRegularPeriodsDto.example_with_id],
    items: {
      type: 'object',
      properties: {
        ...CreateRegularPeriodsDto.type_definition.properties,
        ...UpdateRegularPeriodsDto.type_definition.properties,
      },
    },
    type: UpdateRegularPeriodsDto,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LessonDateDTO)
  recurringSchedules: LessonDateDTO[]

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  appointmentId?: number

  @IsOptional()
  @ValidateNested({ each: true })
  @ApiPropertyOptional({ type: AppointmentDTO })
  @Type(() => AppointmentDTO)
  appointment?: AppointmentDTO

  @ApiProperty({
    type: ApplicationPeriod,
    required: false,
    description: 'Application period restriction for this class',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ApplicationPeriod)
  applicationPeriod?: ApplicationPeriod
}

export class ClassPageOptionDTO extends PageOptionsDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  courseId: number
}

export class CreateClassWithCourseDTO extends ClassDTO {
  @ApiPropertyOptional({
    isArray: true,
    example: [CreateRegularPeriodsDto.example_without_id],
    items: CreateRegularPeriodsDto.type_definition,
    type: CreateRegularPeriodsDto,
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateRegularPeriodsDto)
  regularPeriods: CreateRegularPeriodsDto[]

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  courseId: number

  @ApiProperty({ example: ClassTypeEnum.REGULAR })
  @IsNotEmpty()
  @IsEnum(ClassTypeEnum)
  type: ClassTypeEnum

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean
}

export class CreateMultipleClassWithCourseDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  courseId: number

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => CreateClassWithCourseDTO)
  classes: CreateClassWithCourseDTO[]
}

export class CreateClassWithoutCourseDTO extends ClassDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  institutionId: number

  @ApiPropertyOptional({
    isArray: true,
    example: [CreateRegularPeriodsDto.example_without_id, UpdateRegularPeriodsDto.example_with_id],
    items: {
      type: 'object',
      properties: {
        ...CreateRegularPeriodsDto.type_definition.properties,
        ...UpdateRegularPeriodsDto.type_definition.properties,
      },
    },
    type: UpdateRegularPeriodsDto,
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateRegularPeriodsDto)
  schedule: CreateRegularPeriodsDto[]

  @ApiProperty({ example: ClassTypeEnum.REGULAR })
  @IsNotEmpty()
  @IsEnum(ClassTypeEnum)
  type: ClassTypeEnum
  isArchived?: boolean
}

export class UpdateClassDTO extends ClassDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  id: number
}

export class BulkUpdateClassDTO {
  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdateClassDTO)
  classes: UpdateClassDTO[]
}

export class DeleteClassDTO extends CourseDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  classId: number

  deletedBy: number
}

export class GetDetailClassDTO {
  // @ApiPropertyOptional({ example: 1 })
  // @IsOptional()
  // @IsInt()
  // siteId: number;

  // @ApiPropertyOptional({ example: 1 })
  // @IsOptional()
  // @IsInt()
  // institutionId: number;

  // @ApiPropertyOptional({ example: 1 })
  // @IsOptional()
  // @IsInt()
  // courseId: number;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  classId: number
}

export class RegularCoursePageOptionDTO extends PageOptionsDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  institutionId: number
}

export class ClassWithEnrolCountModel extends ClassEntity {
  @ApiProperty({
    isArray: true,
    example: [
      {
        lessonId: 1,
        startTime: '2024-01-01T10:00:00Z',
        endTime: '2024-01-01T11:00:00Z',
        enrollCount: 5,
      },
    ],
    type: 'object',
  })
  @IsOptional()
  @Expose()
  classQuota?: CheckQuotaResponseDto[]

  @ApiPropertyOptional({
    example: 2000,
    description:
      'Tuition amount for non-multiple-option classes. Calculated from the first price option.',
  })
  @IsOptional()
  @Expose()
  tuition?: number
}
