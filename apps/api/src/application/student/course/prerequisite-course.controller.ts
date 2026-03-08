import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { CheckPrerequisitesConditionDto } from '@/application/admin/courses/dto/prerequesites.dto'
import { CurrentCourse } from '@/common/decorators/current-course.decorator'
import { Public } from '@/common/decorators/public.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { PrerequisitesCoursesService } from '@/domain/service/prerequisites-course.service'
import { Course } from '@/models/courses.entity'
import { RequireParam } from '@/models/enums'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: `This is because the token is expired or user haven't login yet`,
})
@ApiTags('StudentPrerequisitesCourses')
@Controller('prerequisites-courses')
export class StudentPrerequisitesCourseController {
  constructor(private readonly prerequisitesCourseService: PrerequisitesCoursesService) {}

  @ApiOperation({
    operationId: 'studentPrerequisitesCourseCheck',
    summary: 'Check prerequisites of course',
  })
  @Post('check')
  @Public()
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  async checkPrerequisitesCourse(
    @Body() payload: CheckPrerequisitesConditionDto,
    @CurrentCourse() course: Course
  ) {
    return await this.prerequisitesCourseService.checkPrerequisitesCourse(
      payload,
      course.institutionId
    )
  }
}
