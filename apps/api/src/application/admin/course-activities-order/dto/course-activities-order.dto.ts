import { ApiProperty } from '@nestjs/swagger'
import { Exclude, Expose } from 'class-transformer'

@Exclude()
export class CourseActivitiesOrderDetailReponse {
  @ApiProperty()
  @Expose()
  id: number

  @ApiProperty()
  @Expose()
  courseId: number

  @ApiProperty()
  @Expose()
  activityOrder: number[]
}
