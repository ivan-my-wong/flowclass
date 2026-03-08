import { PartialType } from '@nestjs/swagger'

import { CreateEnrollCourseDto } from './create-enroll-course.dto'

export class UpdateEnrollCourseDto extends PartialType(CreateEnrollCourseDto) {}
