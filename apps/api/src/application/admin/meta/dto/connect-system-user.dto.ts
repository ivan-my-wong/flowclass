import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class ConnectSystemUserDto {
  @ApiProperty({ description: 'Institution ID to connect' })
  @IsNumber()
  @IsNotEmpty()
  institutionId: number

  @ApiProperty({ description: 'WhatsApp Business Account ID' })
  @IsString()
  @IsNotEmpty()
  wabaId: string

  @ApiProperty({ description: 'Phone number ID to register and connect' })
  @IsString()
  @IsNotEmpty()
  phoneNumberId: string

  @ApiProperty({ description: '6-digit PIN for WhatsApp Cloud API registration' })
  @IsString()
  @IsNotEmpty()
  pin: string

  @ApiPropertyOptional({ description: 'Optional custom Meta System User Token' })
  @IsString()
  @IsOptional()
  systemUserToken?: string
}
