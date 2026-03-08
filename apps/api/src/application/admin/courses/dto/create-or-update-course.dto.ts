import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator'

import { VALID_PATH_PATTERN } from '@/common/constants'
import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'
import { FrequentlyAskedQuestion, LongDescription, Tag } from '@/models/courses.entity'
import { ClassTypeEnum, OrderBy } from '@/models/enums/'
import { SeoContent } from '@/models/seo-setting.entity'

import { UpdatePeriodLessonsDto } from './create-or-update-regular-periods.dto'

export class CourseDTO {
  siteId: number

  institutionId: number

  courseId: number
}

export class CourseWithTypeDTO extends CourseDTO {
  // @ApiProperty({
  //   example: 'regular | appointment | workshop',
  // })
  // @IsNotEmpty()
  // @IsEnum(CourseTypeEnum)
  // type: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  institutionId: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  courseId: number | null
}

class DuplicateCourseDTO extends CourseWithTypeDTO {
  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsNotEmpty()
  path: string

  // @ApiProperty()
  // @IsNotEmpty()
  // type: string;

  @ApiPropertyOptional()
  @IsOptional()
  seoContent: SeoContent

  @ApiPropertyOptional()
  @IsOptional()
  previewImageUrl: string

  @ApiProperty({
    isArray: true,
    example: [LongDescription.example],
    items: LongDescription.type_definition,
    type: LongDescription,
  })
  @ValidateNested({ each: true })
  @Type(() => LongDescription)
  longDescriptions: LongDescription[]

  @ApiProperty()
  @IsOptional()
  registrationMes: string

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  formId: number

  @ApiProperty()
  @IsOptional()
  recruitStart: string

  @ApiProperty()
  @IsOptional()
  recruitEnd: string

  @ApiProperty({
    default: false,
  })
  @IsOptional()
  useQrAttendance: boolean

  @ApiProperty({
    isArray: true,
    items: Tag.type_definition,
    type: Tag,
  })
  @ValidateNested({ each: true })
  @IsOptional()
  @Type(() => Tag)
  tags: Tag[]
}

class CreateCourseDTO extends CourseWithTypeDTO {
  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(VALID_PATH_PATTERN)
  path: string

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => LongDescription)
  longDescriptions?: LongDescription[]

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  published?: boolean
}

class CreateCourseBasicDTO extends CourseWithTypeDTO {
  @ApiPropertyOptional()
  @IsOptional()
  previewImageUrl: string

  @ApiProperty()
  @IsNotEmpty()
  name: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Matches(VALID_PATH_PATTERN)
  path: string

  @ApiProperty()
  @IsOptional()
  courseCode: string

  @ApiPropertyOptional()
  @IsOptional()
  seoContent: SeoContent

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  formId: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  createdBy: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  updatedBy: number

  @ApiProperty()
  @IsOptional()
  recruitStart: string

  @ApiProperty()
  @IsOptional()
  recruitEnd: string

  @ApiProperty({
    default: false,
  })
  @IsOptional()
  useQrAttendance: boolean

  @ApiProperty({
    default: '',
  })
  @IsOptional()
  registrationMes: string

  @ApiProperty({
    default: false,
  })
  @IsOptional()
  tags: Tag[]

  @ApiProperty({
    isArray: true,
    example: [LongDescription.example, LongDescription.example],
    items: LongDescription.type_definition,
    type: LongDescription,
  })
  @ValidateNested({ each: true })
  @Type(() => LongDescription)
  longDescriptions: LongDescription[]
}

class CreateCourseDesDTO extends CourseWithTypeDTO {
  @ApiProperty({
    isArray: true,
    example: [LongDescription.example, LongDescription.example],
    items: LongDescription.type_definition,
    type: LongDescription,
  })
  @ValidateNested({ each: true })
  @Type(() => LongDescription)
  longDescriptions: LongDescription[]
}

class CreateCourseQnaDTO extends CourseWithTypeDTO {
  @ApiProperty({
    isArray: true,
    example: [FrequentlyAskedQuestion.example, FrequentlyAskedQuestion.example],
    items: FrequentlyAskedQuestion.type_definition,
    type: FrequentlyAskedQuestion,
  })
  @ValidateNested({ each: true })
  @Type(() => FrequentlyAskedQuestion)
  faqs: FrequentlyAskedQuestion[]
}

export class WorkshopPageOptionDTO extends PageOptionsDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  institutionId: number
}

export class SessionPageOptionsDto extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: OrderBy,
    default: OrderBy.ID,
  })
  @IsEnum(OrderBy)
  @IsOptional()
  readonly orderBy?: OrderBy = OrderBy.ID

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  courseId: number
}

export class WorkshopDetailDTO {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  id: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  siteId: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  institutionId: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  courseId: number

  @ApiProperty({ example: 'Name' })
  @IsNotEmpty()
  @IsString()
  name: string
}

export class WorkshopPageDTO extends PageDto<WorkshopDetailDTO> {}

export class SessionDetailDTO {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  id: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  siteId: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  institutionId: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  courseId: number

  @ApiProperty({ example: 'Name' })
  @IsNotEmpty()
  @IsString()
  name: string
}

export class GetDetailSessionDTO {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  sessionId: number
}

export class SessionPageDTO extends PageDto<SessionDetailDTO> {}

export class CreateWorkshopSessionWithCourseDTO extends CourseDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  courseId: number

  @ApiProperty({ example: 'session Name' })
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 20 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quota: number

  @ApiProperty({ example: 2000 })
  @IsNotEmpty()
  @Min(0)
  totalFee: number

  @ApiPropertyOptional({ example: null })
  @IsNotEmpty()
  @IsOptional()
  location: string

  @ApiProperty({
    isArray: true,
    example: [UpdatePeriodLessonsDto.example_no_id, UpdatePeriodLessonsDto.example_no_id],
    items: UpdatePeriodLessonsDto.type_definition,
    type: UpdatePeriodLessonsDto,
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdatePeriodLessonsDto)
  sessionDates: UpdatePeriodLessonsDto[]
}

export class CreateMultipleWorkshopSessionWithCourseDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  courseId: number

  @ApiProperty()
  @ValidateNested({ each: true })
  @Type(() => CreateWorkshopSessionWithCourseDTO)
  sessions: CreateWorkshopSessionWithCourseDTO[]
}

export class CreateWorkshopSessionWithoutCourseDTO extends CourseDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  institutionId: number

  @ApiProperty({ example: 'session Name' })
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 20 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quota: number

  @ApiProperty({ example: 2000 })
  @IsNotEmpty()
  @Min(0)
  totalFee: number

  @ApiPropertyOptional({ example: null })
  @IsNotEmpty()
  @IsOptional()
  location: string

  @ApiProperty({
    isArray: true,
    example: [UpdatePeriodLessonsDto.example_no_id, UpdatePeriodLessonsDto.example_no_id],
    items: UpdatePeriodLessonsDto.type_definition,
    type: UpdatePeriodLessonsDto,
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdatePeriodLessonsDto)
  sessionDates: UpdatePeriodLessonsDto[]
}

export class UpdateWorkshopSessionDTO extends CourseDTO {
  @ApiProperty({ example: 'session Name' })
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 20 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quota: number

  @ApiProperty({ example: 2000 })
  @IsNotEmpty()
  @Min(0)
  totalFee: number

  @ApiPropertyOptional({ example: null })
  @IsNotEmpty()
  @IsOptional()
  location: string

  @ApiProperty({
    isArray: true,
    example: [UpdatePeriodLessonsDto.example, UpdatePeriodLessonsDto.example],
    items: UpdatePeriodLessonsDto.type_definition,
    type: UpdatePeriodLessonsDto,
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdatePeriodLessonsDto)
  sessionDates: UpdatePeriodLessonsDto[]
}

export class CreateOrUpdateWorkshopSessionDTO extends CourseDTO {
  @ApiPropertyOptional({ nullable: true, example: 1 })
  @IsInt()
  @IsOptional()
  workshopSessionId?: number

  @ApiProperty({ example: 'session Name' })
  @IsNotEmpty()
  name: string

  @ApiProperty({ example: 20 })
  @IsNotEmpty()
  @IsInt()
  @IsPositive()
  quota: number

  @ApiProperty({ example: 2000 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  totalFee: number

  @ApiPropertyOptional({ example: null })
  @IsNotEmpty()
  @IsOptional()
  location: string

  @ApiProperty({
    isArray: true,
    example: [UpdatePeriodLessonsDto.example, UpdatePeriodLessonsDto.example],
    items: UpdatePeriodLessonsDto.type_definition,
    type: UpdatePeriodLessonsDto,
  })
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => UpdatePeriodLessonsDto)
  sessionDates: UpdatePeriodLessonsDto[]
}

export class DeleteWorkshopSessionDTO extends CourseDTO {
  @ApiProperty({ example: 1 })
  @IsInt()
  @IsNotEmpty()
  sessionId: number
}

class CreateCoursePaymentDTO extends CourseWithTypeDTO {
  @ApiProperty({ example: true })
  @IsNotEmpty()
  @IsBoolean()
  isOnlineBooking: boolean
}

class CreateCourseMessDTO extends CourseWithTypeDTO {
  @ApiProperty({ example: 'This is the message' })
  @IsNotEmpty()
  message: string
}

class CreateCourseRecruitmentDTO extends CourseWithTypeDTO {
  @ApiProperty({ example: '2023-05-17T16:00:00.000Z' })
  // if want to remove startDate and endDate, set null for both
  // @ValidateIf((o) => o.startDate !== null || o.endDate !== null)
  // @IsNotEmpty()
  // @IsDateString({ strict: true, strictSeparator: true })
  startDate: string | null

  @ApiProperty({ example: '2023-08-17T16:00:00.000Z' })
  // @ValidateIf((o) => o.startDate !== null || o.endDate !== null)
  // @IsNotEmpty()
  // @IsDateString({ strict: true, strictSeparator: true })
  // @IsDateStringCompare('after', 'startDate')
  endDate: string | null
}

class CreateCourseTagsDTO extends CourseWithTypeDTO {
  @ApiProperty({
    isArray: true,
    example: [Tag.example],
    items: Tag.type_definition,
    type: Tag,
  })
  @ValidateNested({ each: true })
  @Type(() => Tag)
  tags: Tag[]
}

export class DeleteCourseDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  siteId: number

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  institutionId: number

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  courseId: number
}

export class GetCourseDTO {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  siteId: number

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  institutionId: number

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  courseId: number
}

export class GetAllCourseDTO extends PageOptionsDto {
  @ApiPropertyOptional({
    enum: ClassTypeEnum,
    default: '',
  })
  @IsEnum(ClassTypeEnum)
  @IsOptional()
  readonly courseType?: ''

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @IsInt()
  institutionId: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  userId?: number
}

export class PublishCourseDTO {
  @ApiProperty({
    example: 1,
  })
  @IsInt()
  courseId: number
}

export class UnpublishCourseDTO {
  @ApiProperty({
    example: 1,
  })
  @IsInt()
  courseId: number
}

export class CourseArchiveActionDTO {
  @ApiProperty({ example: 1, description: 'Course ID to archive/unarchive' })
  @IsInt()
  @Min(1)
  courseId: number
}

export class CourseSettingsDTO {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsPositive()
  courseId: number

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  isPrivate?: boolean

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  requireEmailVerification?: boolean

  @ApiPropertyOptional({ example: true })
  @IsBoolean()
  @IsOptional()
  blockDuplicateEmailEnrollment?: boolean
}

export class UpdateRequireEmailVerificationDTO {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsPositive()
  courseId: number

  @ApiProperty({
    example: true,
    description:
      'If true, the student will be required to verify their email before they can access the application',
  })
  @IsBoolean()
  requireEmailVerification: boolean
}

export {
  CreateCourseBasicDTO,
  CreateCourseDesDTO,
  CreateCourseDTO,
  CreateCourseMessDTO,
  CreateCoursePaymentDTO,
  CreateCourseQnaDTO,
  CreateCourseRecruitmentDTO,
  CreateCourseTagsDTO,
  DuplicateCourseDTO,
}
