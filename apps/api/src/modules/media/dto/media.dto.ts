import { Expose } from 'class-transformer'
import { IsInt, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator'
export class CreateMediaDto {
  @IsOptional()
  @IsString()
  fileName: string

  @IsOptional()
  @IsString()
  originalName: string

  @IsOptional()
  @IsString()
  mimeType: string

  @IsOptional()
  @IsInt()
  size: number

  @IsUrl()
  url: string

  @IsOptional()
  @IsNumber()
  siteId?: number

  @IsOptional()
  @IsNumber()
  institutionId?: number
}

export class MediaDetailDto {
  @Expose()
  id: number

  @Expose()
  siteId: number

  @Expose()
  institutionId: number

  @Expose()
  fileName: string

  @Expose()
  originalName: string

  @Expose()
  mimeType: string

  @Expose()
  size: number

  @Expose()
  url: string
}
