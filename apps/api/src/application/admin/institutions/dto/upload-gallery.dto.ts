import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class UploadGalleryDto {
  @ApiPropertyOptional({
    example: 'Gallery caption',
  })
  @IsOptional()
  caption?: string

  // @ApiPropertyOptional({
  //   example: 1,
  // })
  // @IsOptional()
  // @IsNumber()
  // index?: number;

  @ApiPropertyOptional({
    example: 'tag_1, tag_2',
  })
  @IsOptional()
  @IsString()
  tags?: string

  @ApiProperty({
    type: 'file',
    format: 'binary',
  })
  file?: any[]
}
