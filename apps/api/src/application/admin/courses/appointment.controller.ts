import { Body, Controller, Delete, Get, HttpCode, Post, Query, UseGuards } from '@nestjs/common'
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

import { schema } from '@/application/admin/courses/dto/course.schema'
import { CurrentCourse } from '@/common/decorators/current-course.decorator'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { AppointmentService } from '@/domain/service/appointment.service'
import { ClassService } from '@/domain/service/class.service'
import { CoursesService } from '@/domain/service/courses.service'
import { Course } from '@/models/courses.entity'
import { ClassTypeEnum, PriceType, RequireParam, Role } from '@/models/enums/'
import { successSchema } from '@/models/schemas/success.schema'
import { User } from '@/models/user.entity'

import { appointmentTimeNote } from './docs/appointment-time-note'
import { CreateWithClassAppointmentDTO, UpdateAppointmentDTO } from './dto/appointment.dto'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: `This is because the token is expired or user haven't login yet`,
})
@ApiTags('Appointment')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('appointment')
export class AppointmentController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly appointmentService: AppointmentService,
    private readonly classService: ClassService
  ) {}

  /** ====================================================================================================
   * TODO This api for user use to update Appointment section for a course type Appointment
   * @param dto Data Transfer Object for this api
   * @returns the session record was created or updated (in table appointment)
   */
  @ApiOperation({
    summary:
      'This api for user use to update Fee and Time section for a Teaching service type Appointment',
    description: `__This api for user use to create or update Fee and Time section for a Teaching service type Appointment__,
      \ncourseId is required, if the appointment (course) does not exist yet an error will throw\n ${appointmentTimeNote}`,
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @Post('create-with-course')
  @Transactional()
  async createWithCourse(
    @Body() dto: CreateWithClassAppointmentDTO,
    @CurrentUser() user: User,
    @CurrentCourse() course: Course
  ) {
    await this.coursesService.updateHistory(course, user)
    dto.siteId = course.siteId
    dto.institutionId = course.institutionId
    // Create a class for this appointment if it doesn't exist
    let classEntity = await this.classService.findOneByName(
      course.siteId,
      course.institutionId,
      course.id,
      'Appointment Class'
    )

    if (!classEntity) {
      classEntity = await this.classService.createClass(
        {
          siteId: course.siteId,
          institutionId: course.institutionId,
          courseId: course.id,
          name: 'Appointment Class',
          classesCode: '',
          type: ClassTypeEnum.APPOINTMENT,
          quota: 1,
          dropIn: false,
          enrollmentOffset: 0,
          discountedPrice: 0,
          teachingLanguage: '',
          locality: '',
          detailAddress: '',
          classDescription: '',
          classMeetingUrl: '',
          classRemark: '',
          createdBy: user.id,
          updatedBy: user.id,
          priceType: PriceType.PER_LESSON,
          priceOptions: [
            {
              priceType: PriceType.PER_LESSON,
              amount: dto.tuition,
              numberOfLessons: 1,
            },
          ],
          regularPeriods: [],
          schedule: [],
          locationId: 0,
          setMultipleClass: false,
          setMultipleApplicant: false,
          instructorId: 0,
          autoPay: false,
          recurringFormat: null,
          recurringSchedules: [],
          tags: [],
        },
        course,
        user
      )
    }

    // Create appointment template for the class
    const appointment = await this.appointmentService.createAppointmentTemplate(
      classEntity,
      dto,
      user
    )
    return appointment
  }

  /** ==========================================================================================
   * This api for user use to get detail about fee and time of appointment, appointmentId is required
   * @param appointmentId Id of appointment want to get
   * @returns appointment record
   */
  @ApiOperation({
    description:
      'This api for user use to get detail about fee and time of appointment, appointmentId is required',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.APPOINTMENT_ID)
  @UseGuards(RequireParamsGuard)
  @Get('/detail')
  async get(@Query('appointmentId') appointmentId: number) {
    return this.appointmentService.getById(appointmentId)
  }

  @ApiOperation({
    summary:
      'This api for user use to update Fee and time for a course type Appointment, appointmentId is required',
    description: `This api for user use to update Fee and Time section for a Teaching service type Appointment,
      \n ${appointmentTimeNote}`,
  })
  @ApiOkResponse({
    schema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.APPOINTMENT_ID)
  @UseGuards(RequireParamsGuard)
  @Post('/update')
  @Transactional()
  async update(
    @Query('appointmentId') id: number,
    @Body() dto: UpdateAppointmentDTO,
    @CurrentUser() user: User
  ) {
    const updated = await this.appointmentService.update(+id, dto, user)

    return updated
  }

  @ApiOperation({
    summary: 'This api for user use to delete appointment',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.APPOINTMENT_ID)
  @UseGuards(RequireParamsGuard)
  @HttpCode(200)
  @Delete('/delete')
  async delete(@Query('appointmentId') id: number) {
    return this.appointmentService.delete(+id)
  }

  @ApiOperation({
    summary: 'This api for user use to create appointment with class',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @Post('create-with-class')
  @Transactional()
  async createWithClass(@Body() dto: CreateWithClassAppointmentDTO, @CurrentUser() user: User) {
    return await this.appointmentService.createWithClass(user, dto)
  }

  @ApiOperation({
    description:
      'This api for user use to get detail about fee and time of appointment, appointmentId is required',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  @Get('/detail-by-class')
  async getByClassId(@Query('classId') classId: number) {
    return this.appointmentService.getByClassId(classId)
  }
}
