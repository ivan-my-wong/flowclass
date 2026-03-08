import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'

import { GoogleSheetAPITabConfig } from '@/domain/external/integration-google.service'

export class CreateGoogleSheetDto {
  @ApiProperty({
    description: 'The name for the Google Spreadsheet.',
    example: 'My Exported Student Data',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  spreadsheetName: string

  @ApiPropertyOptional({
    description: 'The Google Drive Folder ID where the sheet should be created or found.',
    example: '1a2b3c4d5e6f7g8h9i0jKlMnOpQrStUvWxYz',
  })
  @IsString()
  folderId: string

  @ApiPropertyOptional({
    description: 'The ID of an existing Google Spreadsheet to update/configure.',
    example: '123spreadsheetIdAbcDefGhiJklMnoPqrStuVwxyz1234567890',
  })
  @IsOptional()
  @IsString()
  spreadsheetId?: string | null

  @ApiPropertyOptional({
    description: 'The ID of a specific sheet (tab) within the spreadsheet.',
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  sheetId?: number | null

  @ApiPropertyOptional({
    description: 'The tabs to create in the spreadsheet.',
    example: ['studentCRM', 'paymentProof'],
  })
  @IsArray()
  @IsNotEmpty()
  tabs: GoogleSheetAPITabConfig[]
}
