import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class StudentChangePasswordDto {
  @ApiProperty({
    example: 'oldFlowclass@2023',
  })
  @IsNotEmpty()
  password: string

  @ApiProperty({
    example: 'newFlowclass@2023',
  })
  @IsNotEmpty()
  newPassword: string
}
