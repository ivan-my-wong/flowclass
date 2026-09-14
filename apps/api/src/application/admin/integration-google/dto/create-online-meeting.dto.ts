import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateIntegrationOnlineMeetingDto {
  @ApiProperty({
    description: 'Institution ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  institutionId: number

  @ApiProperty({
    description: 'Firebase ID token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkazcifQ...',
    format: 'jwt',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string

  @ApiProperty({
    description: 'Google OAuth access token',
    example: 'ya29.a0AfB_byC7R...',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string
}
