import { ApiProperty } from '@nestjs/swagger'
import { IsNumber } from 'class-validator'

export class RemoveGalleryDto {
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  siteId: number

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  galleryId: number
}
