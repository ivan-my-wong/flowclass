import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from 'class-validator'

export class FolderStructureDto {
  @ApiPropertyOptional({
    description: 'Name for class files folder',
    example: 'Class Materials',
  })
  @IsOptional()
  @IsString()
  classFiles?: string

  @ApiPropertyOptional({
    description: 'Name for student files folder',
    example: 'Student Submissions',
  })
  @IsOptional()
  @IsString()
  studentFiles?: string
}

export class SetDriveRootFolderDto {
  @ApiProperty({
    description: 'Google Drive folder ID to use as root',
    example: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  })
  @IsString()
  @IsNotEmpty()
  rootFolderId: string

  @ApiProperty({
    description: 'Display name for the root folder',
    example: 'Flowclass Materials',
  })
  @IsString()
  @IsNotEmpty()
  rootFolderName: string

  @ApiPropertyOptional({
    description: 'Optional folder structure to create within root folder',
    type: FolderStructureDto,
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => FolderStructureDto)
  folderStructure?: FolderStructureDto
}

export class CreateFolderDto {
  @ApiProperty({
    description: 'Name for the new folder',
    example: 'New Class Materials',
  })
  @IsString()
  @IsNotEmpty()
  folderName: string

  @ApiPropertyOptional({
    description: 'Parent folder ID where to create the new folder',
    example: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  })
  @IsOptional()
  @IsString()
  parentFolderId?: string
}

export class ValidateFolderDto {
  @ApiProperty({
    description: 'Google Drive folder ID to validate',
    example: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  })
  @IsString()
  @IsNotEmpty()
  folderId: string
}

export class DownloadByUrlDto {
  @ApiProperty({
    description: 'Google Drive file URL',
    example: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/view',
  })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true, allow_underscores: true })
  driveUrl: string
}

export class UploadFileDto {
  @ApiPropertyOptional({
    description: 'Custom filename (if different from original)',
    example: 'lesson-plan.pdf',
  })
  @IsOptional()
  @IsString()
  fileName?: string

  @ApiPropertyOptional({
    description: 'Target folder type for organization',
    enum: ['classFiles', 'studentFiles'],
    example: 'classFiles',
  })
  @IsOptional()
  @IsIn(['classFiles', 'studentFiles'])
  targetFolder?: 'classFiles' | 'studentFiles'

  @ApiPropertyOptional({
    description: 'Specific parent folder ID (overrides targetFolder)',
    example: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  })
  @IsOptional()
  @IsString()
  parentFolderId?: string
}

export class GoogleDriveUploadDto {
  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    description: 'Files to upload',
  })
  files: any[]

  @ApiProperty({
    type: [String],
    required: false,
    example: ['file1.pdf', 'file2.jpg'],
  })
  fileNames?: string[]

  @ApiProperty({
    enum: ['classFiles', 'studentFiles'],
    required: false,
    example: 'classFiles',
  })
  @IsIn(['classFiles', 'studentFiles'])
  targetFolder?: 'classFiles' | 'studentFiles'

  @ApiProperty({
    type: String,
    required: false,
    example: '1AbCdEfGhIjKlMnOpQrSt',
  })
  parentFolderId?: string
}
