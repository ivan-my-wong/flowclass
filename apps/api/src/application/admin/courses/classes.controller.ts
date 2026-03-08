import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { Transactional } from 'typeorm-transactional'

import { schema } from '@/application/admin/courses/dto/course.schema'
import { CurrentCourse } from '@/common/decorators/current-course.decorator'
import { CurrentInstitution } from '@/common/decorators/current-institution.decorator'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { ClassService } from '@/domain/service/class.service'
import { ClassEntity } from '@/models/classes.entity'
import { Course } from '@/models/courses.entity'
import { RequireParam, Role } from '@/models/enums/'
import { Institution } from '@/models/institutions.entity'
import { User } from '@/models/user.entity'

import { detailClassSchema } from './dto/class.schema'
import {
  BulkUpdateClassDTO,
  CreateClassWithCourseDTO,
  UpdateClassDTO,
} from './dto/create-or-update-class.dto'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: `This is because the token is expired or user haven't login yet`,
})
@ApiTags('Classes')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('classes')
export class ClassesController {
  constructor(private readonly classService: ClassService) {}

  @ApiOperation({
    summary: 'Get all classes for the institution',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved classes',
    type: ClassEntity,
    isArray: true,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('list')
  @Transactional()
  async findAll(@CurrentInstitution() institution: Institution): Promise<ClassEntity[]> {
    return await this.classService.listClasses(institution.id)
  }

  @ApiOperation({
    summary: 'Get detail class',
  })
  @ApiOkResponse({
    description: 'Detail class retrieved successfully',
    type: ClassEntity,
  })
  @ApiNotFoundResponse({
    description: 'Class not found',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  @Get(':classId/detail')
  @Transactional()
  async getDetailClass(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('classId', ParseIntPipe) classId: number
  ): Promise<ClassEntity> {
    return await this.classService.getDetailClass(classId, institutionId)
  }

  @ApiOperation({
    summary: 'Preview class lessons for recurring',
  })
  @ApiOkResponse({
    description: 'List recurring lessons retrieved successfully',
    schema: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Class not found',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  @Get(':classId/preview-recurring-lessons')
  @Transactional()
  async previewRecurringLessons(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('classId', ParseIntPipe) classId: number,
    @Query('date') date: string,
    @Query('lessonDateId', ParseIntPipe) lessonDateId: number
  ): Promise<string[]> {
    return await this.classService.previewRecurringLessons(
      classId,
      institutionId,
      date,
      lessonDateId
    )
  }
  /** ==========================================================================================
   * This api for user use to create class for a course
   * the courseId is required
   * @param createClassDTO DTO object
   * @param user callee user
   * @returns class created
   */
  @ApiOperation({
    summary: 'This api for user use to create a course class',
  })
  @ApiOkResponse({
    schema,
  })
  @Post('create')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async createClass(
    @Body() createClassDTO: CreateClassWithCourseDTO,
    @CurrentUser() user: User,
    @CurrentCourse() course: Course
  ) {
    createClassDTO.siteId = course.siteId
    createClassDTO.institutionId = course.institutionId
    return this.classService.createClass(createClassDTO, course, user)
  }

  @ApiOperation({
    summary: 'This api for user use to update class for a course, classId is required.',
    description: `Each object inside schedule array represent a period of lessons.
       \nTo update a specific period, FE must provide period \`id\`,
       otherwise server will consider it is a new period and add it into database along with other created periods
      \n For delete some period add a key \`"deleted": true\` to the period json along with period \`id\`
      \nNOTE: All time value must be in \`ISO 8601 string and UTC time zone.\`,
      \n---
      \n __For tuition:__ if currency is HKD or USD the unit is \`cent\`, __NOT__ dollar
      \nexample: tuition = 2000 means $20`,
  })
  @ApiOkResponse({
    schema: detailClassSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @Post('update')
  async updateClass(@Body() updateClassDTO: UpdateClassDTO, @CurrentUser() user: User) {
    return this.classService.updateSingleClass(updateClassDTO, user)
  }

  @ApiOperation({
    summary: 'This api for user use to update class for a course, classId is required.',
    description: `Each object inside schedule array represent a period of lessons.
       \nTo update a specific period, FE must provide period \`id\`,
       otherwise server will consider it is a new period and add it into database along with other created periods
      \n For delete some period add a key \`"deleted": true\` to the period json along with period \`id\`
      \nNOTE: All time value must be in \`ISO 8601 string and UTC time zone.\`,
      \n---
      \n __For tuition:__ if currency is HKD or USD the unit is \`cent\`, __NOT__ dollar
      \nexample: tuition = 2000 means $20`,
  })
  @ApiOkResponse({
    schema: detailClassSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @Post('bulk-update')
  async bulkUpdateClass(@Body() bulkUpdateClassDTO: BulkUpdateClassDTO, @CurrentUser() user: User) {
    return this.classService.bulkUpdateClasses(bulkUpdateClassDTO, user)
  }

  @Get('/:classId/time-slot-quota')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({ summary: 'Get per-time-slot quotas for a class (location & class quotas)' })
  async getLocationRoomTimeSlotQuota(@Param('classId', ParseIntPipe) classId: number) {
    return this.classService.getClassQuota(classId)
  }

  @ApiOperation({
    summary: 'Get all classes with their lessons for a specific course',
    description:
      'This endpoint is used in Invoice Campaign to show all classes lessons in one view. It returns all classes in a course along with their lessons.',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved all classes with their lessons',
  })
  @ApiNotFoundResponse({
    description: 'Course not found',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('by-course/:courseId/all-lessons')
  @Transactional()
  async getAllClassesLessonsInCourse(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined

    return await this.classService.getAllClassesLessonsInCourse(courseId, institutionId, start, end)
  }
}
