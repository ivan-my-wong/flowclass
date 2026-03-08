import { ApiProperty } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsString } from 'class-validator'

import { GoogleServiceType } from '@/models/integration-google.entity'

export class HandleGoogleOAuthCallbackDto {
  @ApiProperty({
    description: 'The authorization code received from Google OAuth callback.',
    example: '4/0AY0e-g78A...ActualCode...a1b2c3d4e5f',
  })
  @IsString()
  @IsNotEmpty()
  authCode: string

  @ApiProperty({
    description: 'The type of Google service this callback is for.',
    enum: GoogleServiceType,
    example: GoogleServiceType.SHEETS,
  })
  @IsEnum(GoogleServiceType)
  serviceType: GoogleServiceType

  @ApiProperty({
    description: 'The redirect URI that was used to obtain the authorization code.',
    example: 'http://localhost:5173/integrations/google-sheet',
  })
  @IsString()
  @IsNotEmpty()
  redirectUri: string
}
