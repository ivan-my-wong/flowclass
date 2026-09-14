import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class SubmitQuoteDto {
  @ApiProperty({
    description: 'Contact name',
    example: 'John Doe',
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: 'Contact email',
    example: 'john@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string

  @ApiProperty({
    description: 'Contact phone number',
    example: '+1234567890',
  })
  @IsString()
  @IsNotEmpty()
  phone: string

  @ApiProperty({
    description: 'Company name',
    example: 'ABC Company',
    required: false,
  })
  @IsString()
  @IsOptional()
  company?: string

  @ApiProperty({
    description: 'Company website',
    example: 'https://example.com',
    required: false,
  })
  @IsString()
  @IsOptional()
  website?: string

  @ApiProperty({
    description: 'Total calculated price',
    example: '$299/month',
  })
  @IsString()
  @IsNotEmpty()
  totalPrice: string

  @ApiProperty({
    description: 'Recommended subscription plan',
    example: 'Professional',
  })
  @IsString()
  @IsNotEmpty()
  recommendedPlan: string

  @ApiProperty({
    description: 'Selected currency',
    example: 'USD',
  })
  @IsString()
  @IsNotEmpty()
  currency: string

  @ApiProperty({
    description: 'Selected duration',
    example: 'Monthly',
  })
  @IsString()
  @IsNotEmpty()
  duration: string

  @ApiProperty({
    description: 'Selected class types',
    example: ['Group Classes', 'Private Lessons'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  classTypes: string[]

  @ApiProperty({
    description: 'Selected premium features',
    example: ['Advanced Analytics', 'Custom Branding'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  premiumFeatures: string[]

  @ApiProperty({
    description: 'Selected notification channels',
    example: ['Email', 'SMS', 'WhatsApp'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  notificationChannels: string[]

  @ApiProperty({
    description: 'Selected promotion features',
    example: ['Discount Codes', 'Referral Program'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  promotionFeatures: string[]

  @ApiProperty({
    description: 'Number of students range',
    example: '11-50',
  })
  @IsString()
  @IsNotEmpty()
  studentCount: string

  @ApiProperty({
    description: 'Number of schools range',
    example: '1-3',
  })
  @IsString()
  @IsNotEmpty()
  schoolCount: string

  @ApiProperty({
    description: 'Setup assistance required',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  setupAssistance: boolean

  @ApiProperty({
    description: 'Number of admin staff range',
    example: '1-5',
  })
  @IsString()
  @IsNotEmpty()
  adminStaff: string

  @ApiProperty({
    description: 'Number of tutors range',
    example: '6-20',
  })
  @IsString()
  @IsNotEmpty()
  tutorCount: string
}
