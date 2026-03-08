import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'

import { CourseActivitiesOrderDetailReponse } from './course-activities-order.dto'

export class CourseActivitiesOrderPageDto extends PageDto<CourseActivitiesOrderDetailReponse> {}

export class CourseActivitiesOrderPageOptionDto extends PageOptionsDto {}
