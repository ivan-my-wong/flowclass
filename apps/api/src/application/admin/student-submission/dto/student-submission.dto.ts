import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from 'class-validator'

export class NotificationSettingDto {
  @ApiProperty({
    example: false,
    description: 'Send Email',
  })
  @IsNotEmpty()
  @IsBoolean()
  sendViaEmail: boolean

  @ApiProperty({
    example: false,
    description: 'Send Whatsapp',
  })
  @IsNotEmpty()
  @IsBoolean()
  sendViaWhatsapp: boolean

  @ApiProperty({
    example: 'Whatsapp Content',
    description: 'Whatsapp Content',
  })
  @ValidateIf((object) => object.sendViaWhatsapp)
  @IsNotEmpty()
  @IsString()
  whatsappContent?: string
}

export class BulkUploadTeacherFeedbackDto {
  @ApiProperty({
    example: {
      sendViaEmail: false,
      sendViaWhatsapp: false,
    },
    description: 'Notification settings applied to this bulk run',
    required: false,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => NotificationSettingDto)
  notificationSettings?: NotificationSettingDto

  @ApiProperty({
    example: 1,
    description: 'Class Lesson ID',
  })
  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  classLessonId: number

  @ApiProperty({
    example: {
      'file1.pdf': ['1234567890', '1234567891'],
      'file2.pdf': ['1234567892', '1234567893'],
    },
    description: 'File Student Map, key is file name, value is array of student lesson ids',
  })
  @IsNotEmpty()
  @IsObject()
  fileStudentMap: Record<string, string[]> // <== key is file name, value is array of student lesson ids
}
