import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional } from 'class-validator'

export class RemoveFromParentGroupDto {
  @ApiProperty({
    description: 'The ID of the old parent group',
    type: Number,
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  oldParentId: number

  @ApiProperty({
    description: 'The ID of the new parent group',
    type: Number,
    example: 2,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  newParentId?: number

  @ApiProperty({
    description: 'The ID of the user alias',
    type: Number,
    example: 123,
  })
  @IsNumber()
  @IsNotEmpty()
  userAliasId: number

  @ApiProperty({
    description: 'The ID of the institution',
    type: Number,
    example: 10,
  })
  @IsNumber()
  @IsNotEmpty()
  institutionId: number

  @ApiProperty({
    description: 'Indicates if the record should be marked as deleted',
    type: Boolean,
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  isDeleted: boolean
}
