import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class ChangeParentGroupDto {
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
  })
  @IsNumber()
  @IsNotEmpty()
  newParentId: number

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
}
