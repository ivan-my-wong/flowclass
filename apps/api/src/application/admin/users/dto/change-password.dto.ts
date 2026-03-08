import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

// This DTO is used to change password for a user by user himself
export class ChangePasswordDto {
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

// This DTO is used to change password for a user by master admin or site manager
export class ChangeUserPasswordDto {
  @ApiProperty({
    example: 'newFlowclass@2023',
  })
  @IsNotEmpty()
  newPassword: string
}
