import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString } from 'class-validator'

import { TypeSupported } from './class-materials.dto'

export class MaterialSearchParamsDto {
  @ApiPropertyOptional({ example: 'search', description: 'Search params' })
  @IsOptional()
  @IsString()
  search: string

  @ApiPropertyOptional({ example: 'type', description: 'Filter by type' })
  @IsOptional()
  @IsString()
  type: TypeSupported

  @ApiPropertyOptional({ example: 'lessonIds', description: 'Filter by lessonIds' })
  @IsOptional()
  @IsString()
  lessonIds?: string

  @ApiPropertyOptional({ example: 'classIds', description: 'Filter by classIds' })
  @IsOptional()
  @IsString()
  classIds?: string

  @ApiPropertyOptional({ example: 'startDate', description: 'Filter by startDate' })
  @IsOptional()
  @IsString()
  startDate?: string

  @ApiPropertyOptional({ example: 'endDate', description: 'Filter by endDate' })
  @IsOptional()
  @IsString()
  endDate?: string
}

export class PaginationParamsDto {
  @ApiPropertyOptional({ default: 1, description: 'Page number' })
  @IsOptional()
  @IsNumber()
  page?: number

  @ApiPropertyOptional({ default: 20, description: 'Items per page' })
  @IsOptional()
  @IsNumber()
  limit?: number
}
