import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, MaxLength } from 'class-validator'

export class SettingSocialDTO {
  siteId: number
  institutionId: number

  @ApiProperty({
    nullable: true,
  })
  @MaxLength(255)
  facebookLink: string

  @ApiProperty({
    nullable: true,
  })
  @MaxLength(255)
  youtubeLink: string

  @ApiProperty({
    nullable: true,
  })
  @MaxLength(255)
  instagramLink: string

  @ApiProperty({
    nullable: true,
  })
  @MaxLength(255)
  twitterLink: string
}

export class CreateSettingSocialDTO extends SettingSocialDTO {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  institutionId: number
}

export class UpdateSettingSocialDTO extends SettingSocialDTO {}
