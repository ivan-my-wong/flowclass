import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsEnum, IsNotEmpty, IsOptional } from 'class-validator'

class StudentMemoBaseDto {
  @ApiProperty({ example: 75 })
  @IsNotEmpty()
  userId: number

  @ApiProperty({ example: 75 })
  @IsNotEmpty()
  institutionId: number
}

export class CreateAndUpdateStudentContactInfoDto extends StudentMemoBaseDto {
  @ApiProperty({ example: 'example@gmail.com' })
  @IsOptional()
  contactEmail: string

  @ApiProperty({ example: '+85212345678' })
  @IsOptional()
  contactPhone: string

  @ApiProperty({ example: 'Chan Tai Man' })
  @IsOptional()
  contactName: string
}

export class CreateOrUpdateStudentContactInfoV2Dto extends StudentMemoBaseDto {
  @ApiProperty({ example: 1, description: 'User alias id' })
  @IsNotEmpty()
  userAliasId: number

  @ApiProperty({ example: 'Chan Tai Man', description: 'Name (Alias)' })
  @IsOptional()
  alias: string

  @ApiProperty({ example: '+85212345678', description: 'Phone number' })
  @IsOptional()
  phone: string

  @ApiProperty({ example: 'test@email.com', description: 'Email' })
  @IsOptional()
  email?: string

  @ApiProperty({ example: 123, description: 'Invoice id' })
  @IsOptional()
  invoiceId?: number
}

export enum StudentNotificationType {
  PAYMENT_REMINDER = 'paymentReminder',
  OVERDUE_REMINDER = 'overdueReminder',
  LESSON_REMINDER = 'lessonReminder',
}

export class StudentNotificationSettings {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  id: number

  @ApiProperty({ example: StudentNotificationType.PAYMENT_REMINDER })
  @IsEnum(StudentNotificationType)
  @IsNotEmpty()
  notificationType: StudentNotificationType

  @ApiProperty({ example: true })
  @IsNotEmpty()
  email: boolean

  @ApiProperty({ example: false })
  @IsNotEmpty()
  whatsapp: boolean
}

export class SubmitStudentNotificationDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  institutionId: number

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  studentId: number

  @ApiProperty({ example: [{ type: 'paymentReminder', email: true, whatsapp: false }] })
  @IsNotEmpty()
  @IsArray()
  data: StudentNotificationSettings[]
}
