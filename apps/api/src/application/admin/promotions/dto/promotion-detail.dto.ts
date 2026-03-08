import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'
import { IsInt, IsOptional } from 'class-validator'

@Exclude()
export class PromotionDetailDto {
  @ApiProperty()
  @Expose()
  institutionId: number
}
@Exclude()
export class CheckPossiblePromotionsDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'The ID of user to check possible promotions for',
  })
  @Expose()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  userId?: number

  @ApiPropertyOptional({
    type: Number,
    description: 'The ID of class to check possible promotions for',
  })
  @Expose()
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  classId?: number
}
