import { IsInt, IsNotEmpty } from 'class-validator'

export class SetMultipleClassDto {
  @IsNotEmpty()
  @IsInt()
  classId: number
}
