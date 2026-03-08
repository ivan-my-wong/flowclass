import { Type } from 'class-transformer'
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator'

/**
 * Data transfer object for location room coordinates
 */
export class CoordinateDto {
  @IsNumber()
  @IsNotEmpty()
  lat: number

  @IsNumber()
  @IsNotEmpty()
  lng: number
}

/**
 * Data transfer object for location room information
 * Used for creating and updating location rooms
 */
export class LocationRoomDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  capacity: number

  @IsString()
  @IsOptional()
  description?: string

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  locationGroups?: string[]

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  equipment?: string[]

  @ValidateNested({
    each: true,
  })
  @Type(() => CoordinateDto)
  @IsOptional()
  coordinate?: CoordinateDto

  @IsString()
  @IsOptional()
  address?: string
}
