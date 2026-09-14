import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class RefreshGoogleMeetTokenDto {
  @ApiProperty({
    description: 'Institution ID',
    example: 1,
  })
  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  institutionId: number

  @ApiProperty({
    description: 'Integration online meeting ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  integrationOnlineMeetingId: number

  @ApiProperty({
    description: 'Firebase ID token',
    example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjFlOWdkazcifQ...',
    format: 'jwt',
  })
  @IsString()
  @IsNotEmpty()
  idToken: string

  @ApiProperty({
    description: 'Google access token',
    example: 'ya29.a0AfB_byDHVYZ...',
    format: 'jwt',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string
}
