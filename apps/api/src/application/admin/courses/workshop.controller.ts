import { Body, Controller, Delete, Get, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { Transactional } from 'typeorm-transactional'

import { CurrentCourse } from '@/common/decorators/current-course.decorator'
import { CurrentInstitution } from '@/common/decorators/current-institution.decorator'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CoursesService } from '@/domain/service/courses.service'
import { WorkshopService } from '@/domain/service/workshop.service'
import { Course } from '@/models/courses.entity'
import { RequireParam, Role } from '@/models/enums/'
import { Institution } from '@/models/institutions.entity'
import { successSchema } from '@/models/schemas/success.schema'
import { User } from '@/models/user.entity'

import {
  CreateCourseBasicDTO,
  CreateMultipleWorkshopSessionWithCourseDTO,
  CreateWorkshopSessionWithCourseDTO,
  CreateWorkshopSessionWithoutCourseDTO,
  SessionPageOptionsDto,
  UpdateWorkshopSessionDTO,
  WorkshopPageOptionDTO,
} from './dto/create-or-update-course.dto'
import {
  allWorkshopResponseSchema,
  deleteSessionResponseSchema,
} from './dto/workshop-session.schema'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: `This is because the token is expired or user haven't login yet`,
})
@ApiTags('Workshop')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('workshop')
export class WorkshopController {
  constructor(
    private readonly workshopService: WorkshopService,
    private readonly coursesService: CoursesService
  ) {}

  private async handleSessionDuplication(
    createSessionDTO: CreateWorkshopSessionWithCourseDTO,
    user: User,
    course: Course,
    duplicateCourse = false
  ) {
    const session = createSessionDTO.sessionDates
    createSessionDTO.siteId = course.siteId
    createSessionDTO.institutionId = course.institutionId
    createSessionDTO.courseId = course.id
    createSessionDTO.name = duplicateCourse
      ? `${createSessionDTO.name}`
      : `${createSessionDTO.name ?? 'new-session'}-copy`
    createSessionDTO.sessionDates = []
    const createdSession = await this.createWithCourse(
      createSessionDTO,
      user,
      course,
      duplicateCourse
    )
    const updateSessionDTO = {
      ...createdSession,
      id: createdSession.id,
      sessionDates: session,
    }
    const updatedSession = await this.workshopService.updateWorkshopSession(
      createdSession.id,
      updateSessionDTO,
      user
    )

    return updatedSession
  }
  /** ===============================================================================================
   * This API to get all course type workshop in a specific institution
   * @param getAllWorkshopDTO Data Transfer Object for this api
   * @returns list of all course with type workshop in this institution
   */
  @ApiOperation({
    summary: 'This API to get all course type workshop in a specific institution',
  })
  @ApiOkResponse({
    schema: allWorkshopResponseSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('')
  async getAllWorkshop(@Query() getAllWorkshopDTO: WorkshopPageOptionDTO) {
    const listCourses = await this.workshopService.getAllWorkshopWithSession(getAllWorkshopDTO)
    return listCourses
  }

  /** ===============================================================================================
   * This API to get all sessions in a specific workshop
   * @param getAllWorkshopDTO Data Transfer Object for this api
   * @returns list of all sessions in this workshop
   */
  @ApiOperation({
    summary: 'This API to get all sessions in a specific workshop',
  })
  // @ApiOkResponse({
  //   schema: allWorkshopResponseSchema,
  // })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @Get('/sessions')
  async getAllSession(@Query() pageOptionDto: SessionPageOptionsDto) {
    const listSession = await this.workshopService.getAllSessionWithDate(pageOptionDto)
    return listSession
  }

  /** ====================================================================================================
   * TODO This api for user use to update Workshop session section for a course type Workshop,
   * if the course does not exist yet a new one will be created
   * @param createWorkshopSessionDTO Data Transfer Object for this api
   * @returns the session record was created or updated (in table workshop_session)
   */
  @ApiOperation({
    summary: 'This api for user use to create or update session for a course type Workshop',
    description: `\`courseId\` is required. If the course does not exist yet an error will throw
      \n__For sessionDates:__ the time string must convert to UTC time before submit
      \n---
      \n __For totalFee:__ if currency is HKD or USD the unit is \`cent\`, __NOT__ dollar
      \nexample: totalFee = 2000 means $20`,
  })
  @ApiOkResponse({
    schema: deleteSessionResponseSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @Post('sessions/create-with-course')
  async createWithCourse(
    @Body() createWorkshopSessionDTO: CreateWorkshopSessionWithCourseDTO,
    @CurrentUser() user: User,
    @CurrentCourse() course: Course,
    duplicateCourse = false
  ) {
    if (!duplicateCourse) await this.coursesService.updateHistory(course, user)
    createWorkshopSessionDTO.siteId = course.siteId
    createWorkshopSessionDTO.institutionId = course.institutionId
    const updated = await this.coursesService.createOrUpdateSession(createWorkshopSessionDTO, user)
    return updated
  }

  /** ====================================================================================================
   * TODO This api for user use to update Workshop session section for a course type Workshop,
   * if the course does not exist yet a new one will be created
   * @param createWorkshopSessionDTO Data Transfer Object for this api
   * @returns the session record was created or updated (in table workshop_session)
   */
  @ApiOperation({
    summary:
      'This api for user use to create or update Workshop session section for a course type Workshop',
    description: `__If the course does not exist yet a new one will be created__
      \n__For sessionDates:__ the time string must convert to UTC time before submit
      \n---
      \n __For totalFee:__ if currency is HKD or USD the unit is \`cent\`, __NOT__ dollar
      \nexample: totalFee = 2000 means $20`,
  })
  @ApiOkResponse({
    schema: deleteSessionResponseSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Post('sessions/create-without-course')
  async createWithoutCourse(
    @Body() createWorkshopSessionDTO: CreateWorkshopSessionWithoutCourseDTO,
    @CurrentUser() user: User,
    @CurrentInstitution() institution: Institution
  ) {
    const createCourseDto = new CreateCourseBasicDTO()
    createCourseDto.siteId = institution.siteId
    createCourseDto.institutionId = institution.id
    createCourseDto.createdBy = user.id
    createCourseDto.updatedBy = user.id

    const newCourse = await this.coursesService.create(createCourseDto)
    createWorkshopSessionDTO.courseId = newCourse.id
    createWorkshopSessionDTO.siteId = newCourse.siteId
    createWorkshopSessionDTO.institutionId = newCourse.institutionId

    const updated = await this.coursesService.createOrUpdateSession(createWorkshopSessionDTO, user)

    return updated
  }

  /** ===============================================================================================
   * This API to get detail of one sessions in a specific workshop
   * @param getAllWorkshopDTO Data Transfer Object for this api
   * @returns detail of a session
   */
  @ApiOperation({
    summary: 'This API to get a session in a specific workshop',
  })
  // @ApiOkResponse({
  //   schema: allWorkshopResponseSchema,
  // })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.WORKSHOP_SESSION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('/sessions/detail')
  async detail(@Query('workshopSessionId') id: number) {
    const session = await this.workshopService.getDetailSession(+id)
    return session
  }

  @ApiOperation({
    summary:
      'This api for user use to update class for a course type Regular, courseId, siteId, institution is required',
    description: `To update a specific session, FE need provide \`id\` for each item of sessionDates array,
      if any item don't have id, it will be considered as new item and server will add it to DB along with other created session's dates\
      \nTo delete some date, add \`"deleted": true\` in to the item you want to delete
      \n---
      \n__For sessionDates:__ the time string must convert to UTC time before submit
      \n---
      \n __For totalFee:__ if currency is HKD or USD the unit is \`cent\`, __NOT__ dollar
      \nexample: totalFee = 2000 means $20`,
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.WORKSHOP_SESSION_ID)
  @UseGuards(RequireParamsGuard)
  @Post('sessions/update')
  @Transactional()
  async update(
    @Query('workshopSessionId') id: number,
    @Body() dto: UpdateWorkshopSessionDTO,
    @CurrentUser() user: User
  ) {
    const updated = await this.workshopService.updateWorkshopSession(id, dto, user)
    return updated
  }

  /** ====================================================================================================
   * TODO This api for user use to delete a session in a course type Workshop
   * @param deleteWorkshopSessionDTO Data Transfer Object for this api
   * @returns the session record was created or updated (in table workshop_session)
   */
  @ApiOperation({
    summary: 'This api for user use to delete a session in a course type Workshop',
  })
  @ApiOkResponse({
    schema: deleteSessionResponseSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.WORKSHOP_SESSION_ID)
  @UseGuards(RequireParamsGuard)
  @Delete('sessions/delete')
  async delete(@Query('workshopSessionId') id: number) {
    return this.workshopService.remove(+id)
  }

  /** ====================================================================================================
   * TODO This api for user use to update Workshop session section for a course type Workshop,
   * if the course does not exist yet a new one will be created
   * @param createWorkshopSessionDTO Data Transfer Object for this api
   * @returns the session record was created or updated (in table workshop_session)
   */
  @ApiOperation({
    summary: 'This api for user use to duplicate session for a course type Workshop',
    description: `The returned session date will be empty, FE must call update class api to update schedule`,
  })
  @ApiOkResponse({
    schema: deleteSessionResponseSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @Post('sessions/duplicate-with-course')
  async duplicateSessionWithCourse(
    @Body() createWorkshopSessionDTO: CreateWorkshopSessionWithCourseDTO,
    @CurrentUser() user: User,
    @CurrentCourse() course: Course
  ) {
    const updatedSession = this.handleSessionDuplication(createWorkshopSessionDTO, user, course)

    return updatedSession
  }

  @ApiOperation({
    summary: 'This api for user use to duplicate a list of session for a course type Workshop',
    description: `The returned session is the duplicated list of sessions including their schedules`,
  })
  @ApiOkResponse({
    schema: deleteSessionResponseSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @Post('multipleSessions/duplicate-with-course')
  async duplicateMultipleSessionWithCourse(
    @Body()
    createWorkshopSessionDTO: CreateMultipleWorkshopSessionWithCourseDTO,
    @CurrentUser() user: User,
    @CurrentCourse() course: Course
  ) {
    const resultSession = []
    for (const session of createWorkshopSessionDTO.sessions) {
      resultSession.push(await this.handleSessionDuplication(session, user, course, true))
    }
    return resultSession
  }
}
