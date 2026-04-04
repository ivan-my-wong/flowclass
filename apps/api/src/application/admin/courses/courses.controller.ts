import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { instanceToInstance } from 'class-transformer'
import { Response } from 'express'

import {
  coursePublishSuccess,
  courseTypeSchema,
  courseUnPublishSuccess,
  paginateListCourse,
  schema,
} from '@/application/admin/courses/dto/course.schema'
import { CurrentCourse } from '@/common/decorators/current-course.decorator'
import { CurrentInstitution } from '@/common/decorators/current-institution.decorator'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { PageDto } from '@/common/pagination/page.dto'
import { CoursesService } from '@/domain/service/courses.service'
import { Course } from '@/models/courses.entity'
import { RequireParam, Role } from '@/models/enums/'
import { Institution } from '@/models/institutions.entity'
import { User } from '@/models/user.entity'

import {
  CourseArchiveActionDTO,
  CourseSettingsDTO,
  CreateCourseBasicDTO,
  CreateCourseDesDTO,
  CreateCourseDTO,
  CreateCourseMessDTO,
  CreateCoursePaymentDTO,
  CreateCourseQnaDTO,
  CreateCourseRecruitmentDTO,
  CreateCourseTagsDTO,
  DuplicateCourseDTO,
  GetAllCourseDTO,
  PublishCourseDTO,
  UnpublishCourseDTO,
} from './dto/create-or-update-course.dto'
import { CreateCourseEmailSettingsDTO } from './dto/create-or-update-email-settings.dto'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: `This is because the token is expired or user haven't login yet`,
})
@ApiTags('Courses')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  /**
   * TODO This api for user use to get all courses of a institution by institutionId
   * @param institutionId
   * @returns
   */
  @ApiOperation({
    summary: 'This api for user use to get all courses of a institution by institutionId',
  })
  @ApiOkResponse({
    schema: paginateListCourse,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('')
  async getAllCourse(@Query() getCourseDto: GetAllCourseDTO): Promise<PageDto<Course>> {
    return this.coursesService.findAllWithPaginate(getCourseDto)
  }

  @ApiOperation({
    summary: 'This api for user use to get all courses of a institution by institutionId',
  })
  @ApiOkResponse({
    schema: paginateListCourse,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('user/:userId')
  async getAllCourseByOwnUserId(
    @Query() getCourseDto: GetAllCourseDTO,
    @Param('userId') userId: number
  ): Promise<PageDto<Course>> {
    const listOfCourses = await this.coursesService.findAllWithPaginate({ ...getCourseDto, userId })

    const listOfCoursesWithClassesOfOwnId = listOfCourses.content
      .map((course) => {
        return {
          ...course,
          classes: course.classes.filter((classes) => classes.instructorId === userId),
        }
      })
      .filter((course) => course.classes.length > 0)

    return {
      ...listOfCourses,
      content: listOfCoursesWithClassesOfOwnId,
    }
  }

  @Get('type')
  @ApiOperation({
    summary: 'This api for user use to get types of course',
  })
  @ApiOkResponse({
    schema: courseTypeSchema,
  })
  getCourseTypes(@Res() res: Response) {
    const courseType = [
      {
        name: 'regular',
        description: 'REGULAR COURSE',
      },
      {
        name: 'appointment',
        description: 'APPOINTMENT LESSON',
      },
      {
        name: 'workshop',
        description: 'EVENT & WORKSHOP',
      },
    ]
    const data = {
      data: courseType,
      status: 200,
      message: 'Success',
    }
    return res.status(200).json(data)
  }

  @ApiOperation({
    summary: 'This api for user use to create a course',
  })
  @ApiOkResponse({
    schema,
  })
  @Post('create')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  createCourse(
    @Body() createCourseDto: CreateCourseDTO,
    @CurrentInstitution() institution: Institution
  ) {
    createCourseDto.siteId = institution.siteId
    createCourseDto.institutionId = institution.id
    return this.coursesService.createCourse(createCourseDto)
  }

  /** =======================================================================================================
   * TODO This api for user use to update basic section for a course,
   * if the courseId is not provided, a new course will be created
   * @param createCourseBasicDto DTO object for this API
   * @param res Response
   * route: /course/basic
   * METHOD: POST
   */
  @ApiOperation({
    summary:
      'This api for user use to update basic section for a course, if the courseId is not provided, a new course will be created.',
  })
  @ApiOkResponse({
    schema,
  })
  @Post('basic')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async createOrUpdateCourseBasic(
    @Body() createCourseBasicDto: CreateCourseBasicDTO,
    @CurrentInstitution() institution: Institution
  ) {
    createCourseBasicDto.siteId = institution.siteId
    createCourseBasicDto.institutionId = institution.id

    const courseResult = await this.coursesService.updateCourseBasic(createCourseBasicDto)
    return instanceToInstance(courseResult, { excludePrefixes: ['__'] })
  }

  /** ==============================================================================
   *  TODO This api for user use to update description section for a course,
   * @param createCourseDesDto
   * @param institution
   * @returns
   */
  @Post('description')
  @ApiOperation({
    summary:
      'This api for user use to update description for a course, if the courseId is not provided, a new course will be created',
  })
  @ApiOkResponse({
    schema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async createOrUpdateDescription(
    @Body() createCourseDesDto: CreateCourseDesDTO,
    @CurrentInstitution() institution: Institution
  ) {
    createCourseDesDto.siteId = institution.siteId
    createCourseDesDto.institutionId = institution.id
    const courseResult = await this.coursesService.updateDescription(createCourseDesDto)

    return instanceToInstance(courseResult, { excludePrefixes: ['__'] })
  }

  /** =================================================================================================
   * To publish a course so it can appear on the student page
   * @param publishCourseDTO
   * @param site siteId header
   * @param user user (callee)
   * @returns 200 if success
   */
  @ApiOperation({
    summary:
      'This api for user use to publish a course, if the course does not exist yet an error will be throw',
  })
  @ApiOkResponse({
    schema: coursePublishSuccess,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @HttpCode(200)
  @Post('publish')
  async publishCourse(@Body() courseIdObject: PublishCourseDTO, @CurrentCourse() course: Course) {
    const { courseId } = courseIdObject
    await this.coursesService.publishCourse(courseId)
    return {
      message: 'Course is successfully published',
    }
  }

  /** =================================================================================================
   * To unpublish a course to hide it from the student page
   * @param unpublishCourseDTO
   * @param site siteId header
   * @param user user (callee)
   * @returns 200 if success
   */
  @ApiOperation({
    summary:
      'This api for user use to unpublish a course, if the course does not exist yet an error will be throw',
  })
  @ApiOkResponse({
    schema: courseUnPublishSuccess,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @HttpCode(200)
  @Post('unpublish')
  async unPublishCourse(@Body() _: UnpublishCourseDTO, @CurrentCourse() course: Course) {
    await this.coursesService.unpublishCourse(course.id)
    return {
      message: 'Course is successfully unpublished',
    }
  }

  @ApiOperation({
    summary: 'Archive a course - hides it from students',
  })
  @ApiOkResponse({
    description: 'Course successfully archived',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @HttpCode(200)
  @Post('archive')
  async archiveCourse(@Body() _: CourseArchiveActionDTO, @CurrentCourse() course: Course) {
    const result = await this.coursesService.archiveCourse(course.id)

    return {
      message: 'Course is successfully archived',
      data: result,
    }
  }

  @ApiOperation({
    summary: 'Unarchive a course - makes it available again to students (subject to publish)',
  })
  @ApiOkResponse({
    description: 'Course successfully unarchived',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @HttpCode(200)
  @Post('unarchive')
  async unarchiveCourse(@Body() _: CourseArchiveActionDTO, @CurrentCourse() course: Course) {
    const result = await this.coursesService.unarchiveCourse(course.id)

    return {
      message: 'Course is successfully unarchived',
      data: result,
    }
  }

  /**
   * Check if a course has any invoices to determine whether to show "Delete" or "Archive" option
   * @param courseId id of the course to check
   * @returns boolean indicating if course has invoices
   */
  @ApiOperation({
    summary: 'Check if a course has invoices to determine delete vs archive eligibility',
    description:
      'Returns true if the course has any invoices, indicating it should be archived instead of deleted',
  })
  @ApiOkResponse({
    description: 'Returns whether the course has invoices',
    schema: {
      type: 'object',
      properties: {
        hasInvoices: {
          type: 'boolean',
          description: 'True if course has invoices, false otherwise',
        },
        courseId: {
          type: 'number',
          description: 'The course ID that was checked',
        },
      },
    },
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @Get('has-invoices')
  async checkCourseHasInvoices(@Query('courseId') _: number, @CurrentCourse() course: Course) {
    const hasInvoices = await this.coursesService.hasInvoices(course.id)

    return {
      hasInvoices,
      courseId: course.id,
    }
  }

  @ApiOperation({
    summary: 'Get all archived courses for an institution',
    description: 'Returns a list of archived courses that can be unarchived',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved archived courses',
    schema: {
      type: 'object',
      properties: {
        courses: {
          type: 'array',
          items: {
            $ref: '#/components/schemas/Course',
          },
        },
        count: {
          type: 'number',
          description: 'Total number of archived courses',
        },
      },
      example: {
        courses: [
          {
            id: 1,
            name: 'Archived Course 1',
            isArchived: true,
            archivedAt: '2024-01-15T10:30:00Z',
            institutionId: 1,
          },
          {
            id: 2,
            name: 'Archived Course 2',
            isArchived: true,
            archivedAt: '2024-02-20T14:45:00Z',
            institutionId: 1,
          },
        ],
        count: 2,
      },
    },
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('archived')
  async getArchivedCourses(@CurrentInstitution() institution: Institution) {
    const archivedCourses = await this.coursesService.getArchivedCourses(institution.id)
    return instanceToInstance(archivedCourses, { excludePrefixes: ['__'] })
  }

  /** ================================================================================================
   * TODO: This api for user use to update Q&A section for a course,
   * if the courseId is not provided, a new course will be created
   * @param createCourseDesDto DTO object (Data Transfer Object)
   * @returns The course that has been updated, or created
   */
  @Post('qna')
  @ApiOperation({
    summary:
      'This api for user use to update Q&A section for a course, if the courseId is not provided, a new course will be created',
  })
  @ApiOkResponse({
    schema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async createOrUpdateQnA(
    @Body() createCourseQnADto: CreateCourseQnaDTO,
    @CurrentInstitution() institution: Institution
  ) {
    createCourseQnADto.siteId = institution.siteId
    createCourseQnADto.institutionId = institution.id
    const courseResult = await this.coursesService.updateQnA(createCourseQnADto)
    return instanceToInstance(courseResult, { excludePrefixes: ['__'] })
  }

  @Post('course-settings')
  @ApiOperation({
    summary: 'This api for user use to update isPrivate section for a course',
  })
  @ApiOkResponse({
    schema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  async updateIsPrivate(@Body() courseSettingDto: CourseSettingsDTO) {
    const courseResult = await this.coursesService.updateCourseSettings(courseSettingDto)
    return instanceToInstance(courseResult, { excludePrefixes: ['__'] })
  }

  /** ================================================================================================
   * TODO: This api for user use to update message section for a course,
   * if the courseId is not provided, a new course will be created
   * @param createCourseMessage DTO object (Data Transfer Object)
   * @returns The course that has been updated, or created
   */
  @Post('message')
  @ApiOperation({
    summary:
      'This api for user use to update message section for a course, if the courseId is not provided, a new course will be created',
  })
  @ApiOkResponse({
    schema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async createOrUpdateCourseMessage(
    @Body() createCourseMessage: CreateCourseMessDTO,
    @CurrentInstitution() institution: Institution
  ) {
    createCourseMessage.siteId = institution.siteId
    createCourseMessage.institutionId = institution.id
    const courseResult = await this.coursesService.updateMessage(createCourseMessage)
    return instanceToInstance(courseResult, { excludePrefixes: ['__'] })
  }

  /** =================================================================================
   * TODO: This api for user use to update payment section for a course,
   * if the courseId is not provided, a new course will be created
   * @param createCoursePaymentDto DTO object (Data Transfer Object)
   */

  @ApiOperation({
    summary:
      'This api for user use to update payment section for a course, if the courseId is not provided, a new course will be created',
  })
  @ApiOkResponse({
    schema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Post('payment')
  async createOrUpdatePayment(
    @Body() createCoursePaymentDto: CreateCoursePaymentDTO,
    @CurrentInstitution() institution: Institution
  ) {
    createCoursePaymentDto.siteId = institution.siteId
    createCoursePaymentDto.institutionId = institution.id
    const courseResult = await this.coursesService.updatePayment(createCoursePaymentDto)
    return instanceToInstance(courseResult, { excludePrefixes: ['__'] })
  }

  /** ============================================================================================================
   * This api for user use to update Recruitment section for a course,
   * if the courseId is not provided, a new course will be created
   * @param createCourseRecruitmentDTO Data Transfer Object for this api
   * @returns the course was created or updated
   */
  @ApiOperation({
    summary:
      'This api for user use to update Recruitment section for a course, if the courseId is not provided, a new course will be created',
    description: `\`startDate\` and \`endDate\` is UTC time
    \n---
    \nex: \`2023-05-17T16:00:00.000Z\` is 2023-05-18 00:00:00 AM GMT+8`,
  })
  @ApiOkResponse({
    schema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Post('recruitment')
  async createOrUpdateRecruitment(
    @Body() createCourseRecruitmentDTO: CreateCourseRecruitmentDTO,
    @CurrentInstitution() institution: Institution
  ) {
    createCourseRecruitmentDTO.siteId = institution.siteId
    createCourseRecruitmentDTO.institutionId = institution.id
    const courseResult = await this.coursesService.updateRecruitment(createCourseRecruitmentDTO)
    return instanceToInstance(courseResult, { excludePrefixes: ['__'] })
  }

  /**
   * TODO get a course by id
   * @param courseId id of the course need to get detail
   */
  @ApiOperation({
    summary: 'This api for user use to get detail of a course by courseId',
  })
  @ApiOkResponse({
    schema,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @Get('detail')
  async getDetailCourse(
    @Query('courseId') _: number,
    @CurrentUser() user: User,
    @CurrentCourse() course: Course
  ) {
    return instanceToInstance(course, { excludePrefixes: ['__'] })
  }

  /** ================================================================================================
   * TODO: This api for user use to update tags for a course,
   * if the courseId is not provided, a new course will be created
   * @param createCourseTagsDto DTO object (Data Transfer Object)
   * @returns The course that has been updated, or created
   */
  @Post('tags')
  @ApiOperation({
    summary:
      'This api for user use to update tags for a course, if the courseId is not provided, a new course will be created',
  })
  @ApiOkResponse({
    schema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async createOrUpdateTags(
    @Body() createCourseTagsDto: CreateCourseTagsDTO,
    @CurrentInstitution() institution: Institution
  ) {
    createCourseTagsDto.siteId = institution.siteId
    createCourseTagsDto.institutionId = institution.id
    const courseResult = await this.coursesService.createOrUpdateTags(createCourseTagsDto)
    return instanceToInstance(courseResult, { excludePrefixes: ['__'] })
  }

  /**
   * TODO delete a course
   * @param courseId id of the course need to delete
   */
  @ApiOperation({
    summary: 'This api for user use to delete a course by courseId',
  })
  @ApiOkResponse({
    schema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @Delete('delete')
  async deleteCourse(@Query('courseId') id: number, @CurrentCourse() course: Course) {
    return await this.coursesService.deleteCourse(course.id)
  }

  @ApiOperation({
    summary: 'This api for user use to duplicate a course',
  })
  @ApiOkResponse({
    schema,
  })
  @Post('duplicate')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  duplicateCourse(
    @Body() duplicateCourseDto: DuplicateCourseDTO,
    @CurrentInstitution() institution: Institution
  ) {
    duplicateCourseDto.siteId = institution.siteId
    duplicateCourseDto.institutionId = institution.id
    return this.coursesService.duplicateCourse(duplicateCourseDto)
  }

  @ApiOperation({
    summary: 'This api for user use to duplicate a course',
  })
  @ApiOkResponse({
    schema,
  })
  @Post('duplicate/institution/:institutionId')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  duplicateCourseToAnotherInstitution(
    @Body() duplicateCourseDto: DuplicateCourseDTO,
    @Param('institutionId') institutionId: number,
    @CurrentInstitution() institution: Institution,
    @CurrentUser() user: User
  ) {
    return this.coursesService.duplicateCourseToAnotherInstitution({
      dto: duplicateCourseDto,
      institutionId,
      originalSiteId: institution.siteId,
      user,
    })
  }

  @Post('email-settings')
  @ApiOperation({
    summary:
      'This api for user use to update email settings for a course, if the courseId is not provided, a new course will be created',
  })
  @ApiOkResponse({
    schema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @UseGuards(RequireParamsGuard)
  async createOrUpdateEmailSettings(
    @Body() createCourseEmailSettingsDto: CreateCourseEmailSettingsDTO
  ) {
    const courseResult = await this.coursesService.createOrUpdateEmailSettings(
      createCourseEmailSettingsDto
    )
    return instanceToInstance(courseResult, { excludePrefixes: ['__'] })
  }
}
