import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class GetInstitutionDto {
  @ApiProperty({
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  limit = 10

  @ApiProperty({
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  page = 0

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  siteId: number
}

export class SearchUserManagementDto {
  @ApiProperty({
    example: 'ABC',
  })
  @IsOptional()
  @IsString()
  keyword: string
}

export class AssignManagementDto {
  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number

  @ApiProperty({
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number
}
