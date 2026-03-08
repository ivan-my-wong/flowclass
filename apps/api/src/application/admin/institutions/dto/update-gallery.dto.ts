import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString } from 'class-validator'

export class UpdateGalleryDto {
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  id: number

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  institutionId: number

  @ApiPropertyOptional({
    example: 'Gallery caption',
  })
  @IsOptional()
  caption?: string

  @ApiPropertyOptional({
    example: 'tag_1',
  })
  @IsOptional()
  @IsString()
  tags?: string
}
