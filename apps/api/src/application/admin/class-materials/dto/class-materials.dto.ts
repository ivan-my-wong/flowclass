import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsUrl,
  ValidateIf,
  ValidateNested,
} from 'class-validator'

export enum TypeSupported {
  DOCUMENT = 'DOCUMENT',
  ONLINE_RECORDING = 'ONLINE_RECORDING',
  LINK = 'LINK',
}

export enum FileTypeEnum {
  PDF = 'application/pdf',
  WORD = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  POWERPOINT = 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  EXCEL = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  TEXT = 'text/plain',
  CSV = 'text/csv',
  IMAGE_PNG = 'image/png',
  IMAGE_JPEG = 'image/jpeg',
  IMAGE_GIF = 'image/gif',
  IMAGE_WEBP = 'image/webp',
  IMAGE_SVG = 'image/svg+xml',
  VIDEO_MP4 = 'video/mp4',
  VIDEO_MOV = 'video/quicktime',
  VIDEO_AVI = 'video/x-msvideo',
  VIDEO_WMV = 'video/x-ms-wmv',
  VIDEO_FLV = 'video/x-flv',
  VIDEO_WEBM = 'video/webm',
  VIDEO_3GP = 'video/3gpp',
  VIDEO_MKV = 'video/x-matroska',
  ZIP = 'application/zip',
  RAR = 'application/x-rar-compressed',
}
export const FILE_TYPE_MAP = {
  [TypeSupported.DOCUMENT]: [
    FileTypeEnum.PDF,
    FileTypeEnum.WORD,
    FileTypeEnum.POWERPOINT,
    FileTypeEnum.EXCEL,
    FileTypeEnum.TEXT,
    FileTypeEnum.CSV,
    FileTypeEnum.ZIP,
    FileTypeEnum.RAR,
    FileTypeEnum.IMAGE_PNG,
    FileTypeEnum.IMAGE_JPEG,
    FileTypeEnum.IMAGE_GIF,
    FileTypeEnum.IMAGE_WEBP,
    FileTypeEnum.IMAGE_SVG,
    FileTypeEnum.VIDEO_MP4,
    FileTypeEnum.VIDEO_MOV,
    FileTypeEnum.VIDEO_AVI,
    FileTypeEnum.VIDEO_WMV,
    FileTypeEnum.VIDEO_FLV,
    FileTypeEnum.VIDEO_WEBM,
    FileTypeEnum.VIDEO_3GP,
    FileTypeEnum.VIDEO_MKV,
  ],
  [TypeSupported.ONLINE_RECORDING]: [],
}

export class MediaMaterialsDto {
  @ApiProperty({
    example: TypeSupported.DOCUMENT,
    description: 'Type',
  })
  @IsEnum(TypeSupported)
  type: TypeSupported

  @ApiProperty({
    example: FileTypeEnum.PDF,
    description: 'File Type',
  })
  @ValidateIf((o) => o.type === TypeSupported.DOCUMENT)
  @IsEnum(FileTypeEnum)
  fileType?: FileTypeEnum

  @ApiProperty({
    example: 'https://www.google.com',
    description: 'Link',
  })
  @ValidateIf((object) => object.fileType === TypeSupported.LINK)
  @IsString()
  @IsNotEmpty()
  @IsUrl()
  link?: string

  @ApiProperty({
    example: 1,
    description: 'Name',
  })
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({
    example: '2025-12-31T23:59:59Z',
    description: 'Expiry Date (ISO 8601)',
  })
  @IsDateString()
  expiryDate?: Date
}

export class ClassMaterialsDto {
  @ApiProperty({
    example: 1,
    description: 'Class Lesson ID',
  })
  @IsNotEmpty()
  classLessonId: number
  @ApiProperty({
    example: 1,
    description: 'Class ID',
  })
  @IsNotEmpty()
  classId: number
  @ApiProperty({
    example: 1,
    description: 'Course ID',
  })
  @IsNotEmpty()
  courseId: number

  @ApiProperty({
    example: [MediaMaterialsDto],
    description: 'Media Materials',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MediaMaterialsDto)
  mediaMaterials: MediaMaterialsDto[]
}

export class SendClassMaterialDto {
  @ApiProperty({
    example: 1,
    description: 'Send Via Email',
  })
  @IsBoolean()
  sendViaEmail: boolean

  @ApiProperty({
    example: false,
    description: 'Send Via Whatsapp',
  })
  @IsBoolean()
  @Type(() => Boolean)
  sendViaWhatsapp: boolean

  @ApiProperty({
    example: 'Hi {{Name}}, new class materials for {{className}} are available.',
    description: 'whatsapp content',
  })
  @ValidateIf((object) => object.sendViaWhatsapp)
  @IsString()
  @IsNotEmpty()
  whatsappContent?: string
}

export class UpdateMediaMaterialExpiryDto {
  @ApiProperty({
    example: '2024-12-31T23:59:59.000Z',
    description: 'New expiry date for the media material',
  })
  @IsDateString()
  expiryDate: string
}

export class UpdateClassMaterialsStudentExpiryDto {
  @ApiProperty({
    example: 1,
    description: 'Student ID',
  })
  @IsNotEmpty()
  studentId: number
  @ApiProperty({
    example: '2024-12-31T23:59:59.000Z',
    description: 'New expiry date for the class materials',
  })
  @IsDateString()
  expiryDate: string
}
