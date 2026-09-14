import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class RefreshGoogleTokenDto {
  @ApiProperty({
    description: 'Integration calendar ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  integrationCalendarId: number

  @ApiProperty({
    description: 'Integration ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
  integrationId: number

  @ApiProperty({
    description: 'Institution ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  @Type(() => Number)
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
    description: 'Google Calendar access token',
    example: 'ya29.a0AR...',
  })
  @IsString()
  @IsNotEmpty()
  accessToken: string
}
