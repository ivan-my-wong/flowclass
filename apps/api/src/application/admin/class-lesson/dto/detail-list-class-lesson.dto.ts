import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class DetailListClassLessonDto {
  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  institutionId: number

  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  siteId: number
}

export class CheckNextRecurringLessonDTO extends DetailListClassLessonDto {
  startTime: Date
  endTime: Date
  classId: number
}

export class LessonInvoiceTokenDTO {
  // invoiceToken: string
  invoiceId: number
  enrollCourseId: number
  applicantId: number
  studentLessonIds: number[]
  studentData: {
    name: string
    email: string
    phone: string
  }
  applicationData: {
    courseName: string
    className: string
    startTime: Date
    endTime: Date
  }
}

export class UpdateLessonLocationRoomDTO {
  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  locationId: number
}

export class UpdateLessonInstructorDTO {
  @IsNotEmpty()
  @ApiProperty()
  @IsNumber()
  instructorId: number
}
