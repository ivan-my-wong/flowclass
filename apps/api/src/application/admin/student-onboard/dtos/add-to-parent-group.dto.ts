import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class AddToParentGroupDto {
  @ApiProperty({
    description: 'The ID of the parent group to which the student will be added',
    type: Number,
    example: 123,
  })
  @IsNotEmpty()
  @IsNumber()
  parentId: number

  @ApiProperty({
    description: 'The ID of the user alias to be added to the parent group',
    type: Number,
    example: 456,
  })
  @IsNotEmpty()
  @IsNumber()
  userAliasId: number

  @ApiProperty({
    description: 'The ID of the institution to which the parent group belongs',
    type: Number,
    example: 789,
  })
  @IsNotEmpty()
  @IsNumber()
  institutionId: number
}
