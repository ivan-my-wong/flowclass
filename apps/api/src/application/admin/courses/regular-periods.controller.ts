import { Body, Controller, Delete, Get, Patch, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { CurrentLesson } from '@/common/decorators/current-lesson.decorator'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { ClassService } from '@/domain/service/class.service'
import { CoursesService } from '@/domain/service/courses.service'
import { RegularPeriodsService } from '@/domain/service/regular-periods.service'
import { RegularPeriods } from '@/models/course-regular-periods.entity'
import { RequireParam, Role } from '@/models/enums/'
import { User } from '@/models/user.entity'

import {
  CreateRegularPeriodsDto,
  UpdateRegularPeriodsDto,
} from './dto/create-or-update-regular-periods.dto'
import { getLessonResponseSchema, lessonResponseSchema } from './dto/lesson.schema'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: "This is because the token is expired or user haven't login yet",
})
@ApiTags('Lessons')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('lessons')
export class RegularPeriodsController {
  constructor(
    private readonly regularPeriodsService: RegularPeriodsService,
    private readonly courseService: CoursesService,
    private readonly classService: ClassService
  ) {}

  /** ===========================================================================================================
   * TODO This api for user use to get all lesson of a class in a course
   * @param classId id of the class want to get
   * @param res list of all lesson in class
   * route: /lessons/{classId}
   * METHOD: GET
   */
  @ApiOperation({
    summary: 'This api for user use to get list of lesson in a class, classId must be provided',
  })
  @ApiOkResponse({
    schema: getLessonResponseSchema,
  })
  @Get('/')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  async getLessonInClass(@Query('classId') classId: number) {
    return await this.regularPeriodsService.getAll(classId)
  }

  /** ===========================================================================================================
   * TODO This api for user use to create lesson for a class in a course,
   * if the course or the class does not exist yet an error will be throw
   * @param createLessonDTO DTO object for this API
   * @param res Response
   * route: /lessons/create
   * METHOD: POST
   */
  @ApiOperation({
    summary:
      'This api for user use to create new lesson for a class, classId and courseId must be provided',
    description: 'Note: time slot must be in ISO 8601 format, UTC timezone',
  })
  @ApiOkResponse({
    schema: lessonResponseSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  @Post('create')
  async createLesson(@Body() createLessonDTO: CreateRegularPeriodsDto, @CurrentUser() user: User) {
    return await this.regularPeriodsService.create(createLessonDTO, user)
  }

  /** ===========================================================================================================
   * TODO This api for user use to get detail of one lesson
   * @param res lessonId id of lesson
   * route: /lessons/:lessonId
   * METHOD: GET
   */
  @ApiOperation({
    summary: 'TODO This api for user use to get detail of one lesson',
  })
  @ApiOkResponse({
    schema: lessonResponseSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.LESSON_ID)
  @UseGuards(RequireParamsGuard)
  @Get('detail')
  async getOneLesson(@Query('lessonId') lessonId: number, @CurrentLesson() lesson: RegularPeriods) {
    return await lesson
  }

  /** ===========================================================================================================
   * TODO This api for user use to update lesson for a class in a course,
   * if the course or the class does not exist yet an error will be throw
   * @param updateLessonDTO DTO object for this API
   * @param res Response
   * route: /lessons/update
   * METHOD: PATCH
   */
  @ApiOperation({
    summary:
      'This api for user use to update a lesson for a class, lessonId, classId and courseId must be provided',
    description: 'Note: time slot must be in ISO 8601 format, UTC timezone',
  })
  @ApiOkResponse({
    schema: lessonResponseSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.PERIOD_ID)
  @UseGuards(RequireParamsGuard)
  @Patch('update')
  async updateRegularPeriods(
    @Body() updateLessonDTO: UpdateRegularPeriodsDto,
    @CurrentUser() user: User
  ) {
    return await this.regularPeriodsService.update(updateLessonDTO, user)
  }

  /** ===========================================================================================================
   * TODO This api for user use to create lesson for a class in a course,
   * if the course or the class does not exist yet an error will be throw
   * @param lessonId Response
   * route: /lessons/delete
   * METHOD: DELETE
   */
  @ApiOperation({
    summary:
      'This api for user use to delete a lesson in a class, lessonId, classId and courseId must be provided',
  })
  @ApiOkResponse({
    schema: lessonResponseSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.LESSON_ID)
  @UseGuards(RequireParamsGuard)
  @Delete('delete')
  async deleteLesson(@CurrentLesson() lesson: RegularPeriods) {
    return await this.regularPeriodsService.delete(lesson.id)
  }
}
