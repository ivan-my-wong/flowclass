import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString } from 'class-validator'

export class StudentGetSingleSchoolDTO {
  @IsOptional()
  @ApiPropertyOptional()
  @IsString()
  @ApiProperty()
  url: string

  @IsString()
  @ApiProperty()
  domain: string
}
