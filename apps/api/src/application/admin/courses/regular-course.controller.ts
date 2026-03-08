import { Body, Controller, Delete, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { Transactional } from 'typeorm-transactional'

import { CurrentClassEntity } from '@/common/decorators/current-class-entity.decorator'
import { CurrentCourse } from '@/common/decorators/current-course.decorator'
import { CurrentInstitution } from '@/common/decorators/current-institution.decorator'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { ClassService } from '@/domain/service/class.service'
import { ClassRegularSchedulesV2Service } from '@/domain/service/class-regular-schedules.service'
import { CoursesService } from '@/domain/service/courses.service'
import { ClassEntity } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import { RecurringSchedulesRepository } from '@/models/course-recurring-schedules.entity'
import { Course } from '@/models/courses.entity'
import { ClassTypeEnum, RequireParam, Role } from '@/models/enums/'
import { Institution } from '@/models/institutions.entity'
import { User } from '@/models/user.entity'
import { shallow } from '@/utils/shallow.utils'

import {
  deleteClassSchema,
  detailClassSchema,
  detailLessonSchema,
  responseGetAllClass,
} from './dto/class.schema'
import {
  ClassPageOptionDTO,
  CreateClassWithCourseDTO,
  CreateClassWithoutCourseDTO,
  CreateMultipleClassWithCourseDTO,
  GetDetailClassDTO,
  RegularCoursePageOptionDTO,
  UpdateClassDTO,
} from './dto/create-or-update-class.dto'
import { CreateCourseBasicDTO } from './dto/create-or-update-course.dto'
import { ValidatelessonsDto } from './dto/create-or-update-lessons.dto'
import { CreateRegularPeriodsDto } from './dto/create-or-update-regular-periods.dto'
import { DeleteLessonPhaseDto } from './dto/delete-lesson-phase.dto'
import { SetMultipleClassDto } from './dto/setMultipleClass.dto'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: `This is because the token is expired or user haven't login yet`,
})
@ApiTags('RegularCourse')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('regular-course')
export class RegularCourseController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly classService: ClassService,
    private readonly lessonDateRepository: RecurringSchedulesRepository,
    private readonly classRegularSchedulesV2Service: ClassRegularSchedulesV2Service,
    private readonly classRepository: ClassRepository
  ) {}

  /** ==========================================================================================
   * This api for user use to get all course with type Regular, institutionId is required
   * @param courseId DTO object
   * @param user callee user
   * @returns class created
   */
  @ApiOperation({
    description:
      'This api for user use to get all course with type Regular, institutionId is required',
  })
  @Get('')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async get(@Query() dto: RegularCoursePageOptionDTO) {
    return await this.classService.getAllRegularCourseClasses(dto)
  }

  /** ==========================================================================================
   * This api for user use to get all classes in a course type Regular, courseId is required
   * @param courseId DTO object
   * @param user callee user
   * @returns class created
   */
  @ApiOperation({
    description: 'This api for user use to get all classes of all types',
  })
  @ApiOkResponse({
    schema: responseGetAllClass,
  })
  @Get('classes')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  async getClasses(@Query() dto: ClassPageOptionDTO) {
    return await this.classService.getAllClassesOfCourse(dto)
  }

  /** ==========================================================================================
   * This api for user use to create class for a course type Regular
   * the courseId is required
   * @param createClassDTO DTO object
   * @param user callee user
   * @returns class created
   */

  @ApiOperation({
    summary:
      'This api for user use to create class for a course type Regular, the courseId is required',
    description: `NOTE: All time value must be in ISO 8601 string and UTC time zone
    \n---
    \n __For tuition:__ if currency is HKD or USD the unit is \`cent\`, __NOT__ dollar
    \nexample: tuition = 2000 means $20`,
  })
  @ApiOkResponse({
    schema: detailClassSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @Post('classes/create-with-course')
  @Transactional()
  async createClassWithCourse(
    @Body() createClassDTO: CreateClassWithCourseDTO,
    @CurrentUser() user: User,
    @CurrentCourse() course: Course
  ) {
    createClassDTO.siteId = course.siteId
    createClassDTO.institutionId = course.institutionId

    const fieldsToInclude = Object.keys(createClassDTO).filter(
      (key) =>
        ![
          'id',
          'regularPeriods',
          'recurringSchedules',
          'regularScheduleV2',
          'createdAt',
          'updatedAt',
        ].includes(key)
    )

    const shallowData = shallow({
      source: createClassDTO,
      fields: fieldsToInclude,
    })

    const created = await this.classService.createClass(shallowData, course, user)

    if (
      createClassDTO.type === ClassTypeEnum.REGULAR ||
      createClassDTO.type === ClassTypeEnum.WORKSHOP
    ) {
      created.regularPeriods = await this.classService.createRegularPeriods(
        createClassDTO.regularPeriods,
        created.siteId,
        created.institutionId,
        created.courseId,
        created.id,
        user
      )
    }

    if (createClassDTO.type === ClassTypeEnum.REGULAR_V2) {
      const regularSchedule = await this.classRegularSchedulesV2Service.create({
        classId: created.id,
        siteId: created.siteId,
        institutionId: created.institutionId,
        courseId: created.courseId,
        periodRepeatFormat: createClassDTO.regularScheduleV2?.periodRepeatFormat || undefined,
        gapBetweenPeriods: createClassDTO.regularScheduleV2?.gapBetweenPeriods || undefined,
        periodRepeatCount: createClassDTO.regularScheduleV2?.periodRepeatCount || undefined,
        selectionMode: createClassDTO.regularScheduleV2?.selectionMode || undefined,
      })

      if (createClassDTO.regularScheduleV2?.periodsV2?.length > 0) {
        const updatedSchedule = await this.classRegularSchedulesV2Service.update(
          regularSchedule.id,
          {
            periodsV2: createClassDTO.regularScheduleV2.periodsV2.map((period) => ({
              classId: created.id,
              startTime: period.startTime,
              endTime: period.endTime,
              lessonRepeatFormat: period.lessonRepeatFormat,
            })),
            dateOverrides: createClassDTO.regularScheduleV2.dateOverrides || [],
          }
        )
        created.regularScheduleV2 = updatedSchedule
      } else {
        created.regularScheduleV2 = regularSchedule
      }

      await this.classRepository.update(
        { id: created.id },
        { regularScheduleId: regularSchedule.id }
      )
    }
    if (createClassDTO.type == ClassTypeEnum.SUBSCRIPTION) {
      const updatedRecurringFormats = await this.classService.createOrUpdateRecurringFormats(
        created,
        createClassDTO.recurringFormat
      )
      created.recurringFormat = updatedRecurringFormats
    }

    if (createClassDTO.type == ClassTypeEnum.RECURRING) {
      const updatedRecurringFormats = await this.classService.createOrUpdateRecurringFormats(
        created,
        createClassDTO.recurringFormat
      )
      created.recurringFormat = updatedRecurringFormats

      if (createClassDTO.recurringSchedules && createClassDTO.recurringSchedules.length > 0) {
        const lessonDatesToCreate = createClassDTO.recurringSchedules?.map((item) => {
          // Check if the weekDay value is valid
          if ((!item.weekDay && item.weekDay !== 0) || !item.startTime || !item.endTime) {
            throw new Error(`Invalid lesson date item: ${JSON.stringify(item)}`)
          } else {
            return {
              classId: created.id,
              weekDay: item.weekDay,
              startTime: item.startTime,
              endTime: item.endTime,
            }
          }
        })

        const cleanedLessonDates = lessonDatesToCreate.filter((item) => !!item)
        const createdLessonDates = await this.lessonDateRepository.save(cleanedLessonDates)

        created.recurringSchedules = createdLessonDates
      }
    }

    return created
  }

  @ApiOperation({
    summary:
      'This api for user use to duplicate class for a course type Regular, the courseId is required',
    description: `The returned schedule will be empty, FE must call update class api to update schedule`,
  })
  @ApiOkResponse({
    schema: detailClassSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @Post('classes/duplicate-with-course')
  @Transactional()
  async duplicateClassWithCourse(
    @Body() createClassDTO: CreateClassWithCourseDTO,
    @CurrentUser() user: User,
    @CurrentCourse() course: Course
  ) {
    const originalIsArchived = createClassDTO.isArchived
    createClassDTO.siteId = course.siteId
    createClassDTO.institutionId = course.institutionId
    createClassDTO.name = `${createClassDTO.name ?? 'new-class'}`
    createClassDTO.courseId = course.id

    if (createClassDTO.isArchived === undefined || createClassDTO.isArchived === null) {
      createClassDTO.isArchived = false
    }

    if (originalIsArchived !== undefined) {
      createClassDTO.isArchived = originalIsArchived
    }

    return await this.createClassWithCourse(createClassDTO, user, course)
  }

  @ApiOperation({
    summary:
      'This api for user use to duplicate a list of class for a course type Regular, the courseId is required',
    description: `The returned class is a list of duplicated classes including their schedules`,
  })
  @ApiOkResponse({
    schema: detailClassSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @Post('multiple-classes/duplicate-with-course')
  @Transactional()
  async duplicateMultipleClassesWithCourse(
    @Body() createClassDTOs: CreateMultipleClassWithCourseDTO,
    @CurrentUser() user: User,
    @CurrentCourse() course: Course
  ) {
    const results = []
    for (const dto of createClassDTOs.classes) {
      results.push(await this.duplicateClassWithCourse(dto, user, course))
    }
    return results
  }

  /** ==========================================================================================
   * This api for user use to create class for a course type Regular
   * if the courseId is not provided, a new course will be created
   * @param createClassDTO DTO object
   * @param user callee user
   * @returns class created
   */

  @ApiOperation({
    summary:
      'This api for user use to create class for a course type Regular, a new course will be created before class creation',
    description: `NOTE: All time value must be in ISO 8601 string and UTC time zone
    \n---
    \n __For tuition:__ if currency is HKD or USD the unit is \`cent\`, __NOT__ dollar
    \nexample: tuition = 2000 means $20`,
  })
  @ApiOkResponse({
    schema: detailClassSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Post('classes/create-without-course')
  @Transactional()
  async createClassWithoutCourse(
    @Body() createClassDTO: CreateClassWithoutCourseDTO,
    @CurrentUser() user: User,
    @CurrentInstitution() institution: Institution
  ) {
    createClassDTO.siteId = institution.siteId
    createClassDTO.institutionId = institution.id

    const count = await this.coursesService.countBy(createClassDTO.institutionId)
    const createCourseDto = new CreateCourseBasicDTO()
    createCourseDto.name = `New Course ${count + 1}`
    createCourseDto.siteId = createClassDTO.siteId
    createCourseDto.institutionId = createClassDTO.institutionId
    createCourseDto.createdBy = user.id
    createCourseDto.updatedBy = user.id

    const newCourse = await this.coursesService.create(createCourseDto)
    createClassDTO.courseId = newCourse.id
    const created = await this.classService.createClass(createClassDTO, newCourse, user)
    // create lessons
    const periodJSONs: CreateRegularPeriodsDto[] = createClassDTO.schedule
    const createdLessons = await this.classService.createOrUpdateRegularPeriods(
      periodJSONs,
      institution.siteId,
      institution.id,
      newCourse.id,
      created,
      user
    )
    created.regularPeriods = createdLessons
    return created
  }

  /** ==========================================================================================
   * This api for user use to get detail of class by classId, classId is required
   * @param classId Id of class want to get
   * @returns class record
   */
  @ApiOperation({
    description: 'This api for user use to get detail of class by classId, classId is required',
  })
  @ApiOkResponse({
    schema: detailClassSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  @Get('classes/detail')
  async getDetailClass(
    @Query() _: GetDetailClassDTO,
    @CurrentClassEntity() classEntity: ClassEntity
  ) {
    return classEntity
  }

  @ApiOperation({
    summary:
      'This api for user use to update class for a course type Regular, classId is required.',
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
  @Post('classes/update')
  async updateClass(@Body() updateClassDTO: UpdateClassDTO, @CurrentUser() user: User) {
    const updated = await this.classService.updateClass(updateClassDTO, user)
    // update or create lessons

    if (
      updateClassDTO.type === ClassTypeEnum.REGULAR ||
      updateClassDTO.type === ClassTypeEnum.WORKSHOP
    ) {
      const regularPeriods = await this.classService.createOrUpdateRegularPeriods(
        updateClassDTO.regularPeriods,
        updated.siteId,
        updated.institutionId,
        updated.courseId,
        updated,
        user
      )

      updated.regularPeriods = regularPeriods
    }

    // This is for recurring schedules

    if (updateClassDTO.type === ClassTypeEnum.RECURRING) {
      const updatedRecurringFormats = await this.classService.createOrUpdateRecurringFormats(
        updated,
        updateClassDTO.recurringFormat
      )
      updated.recurringFormat = updatedRecurringFormats
      const updatedRecurringSchedules = await this.classService.updateLessonDates(
        updateClassDTO.recurringSchedules
      )
      updated.recurringSchedules = updatedRecurringSchedules
    }

    return updated
  }

  @ApiOperation({
    summary:
      'This api for user use to delete class for a course type Regular, user have to provide classId and courseId',
  })
  @ApiOkResponse({
    schema: deleteClassSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  @HttpCode(200)
  @Delete('classes/delete')
  async deleteClass(@Query('classId') id: number) {
    return this.classService.deleteClass(+id)
  }

  @ApiOperation({
    summary: 'Archive a class - hides it from students',
  })
  @ApiOkResponse({
    description: 'Class successfully archived',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  @HttpCode(200)
  @Post('classes/:classId/archive')
  async archiveClass(@CurrentClassEntity() cls: ClassEntity) {
    const result = await this.classService.archiveClass(cls.id)

    return {
      message: 'Class is successfully archived',
      data: result,
    }
  }

  @ApiOperation({
    summary: 'Unarchive a class - makes it available again to students (subject to publish)',
  })
  @ApiOkResponse({
    description: 'Class successfully unarchived',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  @HttpCode(200)
  @Post('classes/:classId/unarchive')
  async unarchiveClass(@CurrentClassEntity() cls: ClassEntity) {
    const result = await this.classService.unarchiveClass(cls.id)

    return {
      message: 'Class is successfully unarchived',
      data: result,
    }
  }

  @ApiOperation({
    summary: 'Check if class can be deleted or only archived',
    description:
      'Returns whether a class can be deleted or must be archived due to existing invoices',
  })
  @Get('classes/:classId/deletion-status')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  async getClassDeletionStatus(@CurrentClassEntity() cls: ClassEntity) {
    return await this.classService.getClassDeletionStatus(cls.id)
  }

  @ApiOperation({
    description: 'Get all classes including archived ones with separate counts for accordion UI',
  })
  @Get('classes-with-archive-status')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  async getClassesWithArchiveStatus(@Query() dto: ClassPageOptionDTO) {
    return await this.classService.getClassesWithArchiveStatus(dto)
  }

  // Keep the old endpoint for backward compatibility or rename it
  @ApiOperation({
    summary: 'Soft delete a class (different from archive)',
  })
  @ApiOkResponse({
    schema: deleteClassSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  @HttpCode(200)
  @Delete('classes/soft-delete') // Renamed for clarity
  async softDeleteClass(@Query('classId') id: number) {
    return this.classService.softDeleteClass(+id) // This does soft delete, not archive
  }

  @ApiOperation({
    summary:
      'This api for user use to delete lesson phase for a course type Regular, classId is required.',
  })
  @ApiOkResponse({
    schema: detailLessonSchema,
  })
  @ApiQuery({ name: 'lessonId', type: String })
  @ApiQuery({ name: 'classId', type: String })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  @HttpCode(200)
  @Delete('lesson-phase/delete')
  async deleteLessonPhase(@Query() deleteLessonPhaseDto: DeleteLessonPhaseDto) {
    return this.classService.deleteLessonPhase(deleteLessonPhaseDto)
  }

  @ApiOperation({
    summary:
      'This api for user use to set class as available for multiple class, classId is required.',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  @Post('classes/setMultipleClass')
  async setMultipleClass(@Body() setMultipleClassDto: SetMultipleClassDto) {
    return this.classService.setMultipleClass(setMultipleClassDto)
  }

  @ApiOperation({
    summary: 'This api for user use to validate timeslot, classId is required.',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Post('classes/validate-timeslot')
  async validateTimeslot(
    @Query('institutionId') institutionId: string,
    @Body() payload: ValidatelessonsDto
  ) {
    return this.classService.validateTimeslot(+institutionId, payload)
  }

  @ApiOperation({
    summary: 'Get invoice details for a class',
    description: 'Returns all invoices associated with a class for admin review',
  })
  @Get('classes/:classId/invoices')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  async getClassInvoiceDetails(@CurrentClassEntity() cls: ClassEntity) {
    return await this.classService.getClassInvoiceDetails(cls.id)
  }
}
