import { Body, Controller, Get, Patch, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiExtraModels,
  ApiHeaders,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { CheckQuotaDto } from '@/application/admin/class-lesson/dto/list-class-lesson.dto'
import {
  confirmEnrollCourseSchema,
  createEnrollCourseSchema,
  createEnrollDoc,
  reCreateClientSecretSchema,
  studentCoursesEnrolledSchema,
} from '@/application/admin/enroll-courses/dto/enroll-course.schema'
import {
  StudentReCreateStripeClientSecretDto,
  UpdateInvoicePaymentDto,
} from '@/application/student/enroll-courses/dto/update-enroll-course.dto'
import { CurrentCourse } from '@/common/decorators/current-course.decorator'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { Public } from '@/common/decorators/public.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { PageMetaDto } from '@/common/pagination/page-meta.dto'
import { StripeConnectService } from '@/domain/external/stripe-connect.service'
import { ClassLessonService } from '@/domain/service/class-lesson.service'
import { EnrollCoursesService } from '@/domain/service/enroll-courses.service'
import { InvoiceService } from '@/domain/service/invoice.service'
import { PaymentService } from '@/domain/service/payment.service'
import { StudentOnbService } from '@/domain/service/student-onboard.service'
import { Course } from '@/models/courses.entity'
import { StripeClientSecretType } from '@/models/custom-types/stripe'
import { EnrollCourse, StudentFormResponse } from '@/models/enroll-courses.entity'
import { RequireParam } from '@/models/enums/'
import { Invoice } from '@/models/invoice.entity'
import { StripeConnect } from '@/models/stripe-connect.entity'
import { StudentLesson } from '@/models/student-lesson.entity'
import { User } from '@/models/user.entity'

import {
  PayNowResponse,
  StudentConfirmEnrollDto,
  StudentCreateEnrollCourseDto,
  StudentEnrollCoursePricingInfo,
  StudentEnrollCourseResponse,
} from './dto/create-enroll-course.dto'
import { StudentEnrollmentRecordDTO, StudentInvoiceResponseDto } from './dto/create-invoice.dto'
import {
  StudentEnrollCourseOptionDto,
  StudentEnrollCoursePageDto,
  StudentGetAdditionalFeeDto,
  StudentGetEnrollCourseStudentLessonDto,
} from './dto/enroll-course-pagination.dto'

@ApiTags('Student Enroll Courses')
@ApiUnauthorizedResponse({
  description: 'This response when user not authenticate.',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiResponse({
  description: 'This response when system error.',
  status: 500,
})
@Public()
@Controller('enroll-courses')
export class EnrollCoursesController {
  constructor(
    private readonly enrollCoursesService: EnrollCoursesService,
    private readonly paymentService: PaymentService,
    private readonly invoiceService: InvoiceService,
    private readonly stripeConnectionService: StripeConnectService,
    private readonly studentOnboardService: StudentOnbService,
    private readonly classLessonService: ClassLessonService
  ) {}

  @ApiExtraModels(StudentEnrollCourseResponse, PageMetaDto, PayNowResponse)
  @Get()
  @Public()
  @ApiOperation({
    operationId: 'studentEnrollCoursesGetAll',
    summary: 'This api for student use to get enroll courses',
  })
  @ApiOkResponse({
    schema: studentCoursesEnrolledSchema,
  })
  findAll(
    @Query() pageOptionsDto: StudentEnrollCourseOptionDto,
    @CurrentUser() currentUser
  ): Promise<StudentEnrollCoursePageDto> {
    return this.enrollCoursesService.studentCoursesEnrolled(pageOptionsDto, currentUser)
  }

  @ApiExtraModels(StudentEnrollCourseResponse, PageMetaDto, PayNowResponse)
  @Get('detail/token')
  @RequireParams(RequireParam.TOKEN)
  @Public()
  @ApiOperation({
    operationId: 'studentEnrollCoursesGetDetail',
    summary: 'This api for student use to get the detail of a single enroll course by token',
  })
  @ApiHeaders([
    {
      name: 'token',
      required: true,
      schema: {
        type: 'string',
        default: 'token',
      },
    },
  ])
  @ApiOkResponse({
    schema: studentCoursesEnrolledSchema,
  })
  findOne(@Query('token') token: string): Promise<StudentEnrollCourseResponse> {
    return this.enrollCoursesService.enrollCourseDetail(token)
  }

  @Post()
  @Public()
  @ApiOperation({
    operationId: 'studentEnrollCoursesCreate',
    summary: 'This api for student use to enroll course',
    description: createEnrollDoc,
  })
  @ApiOkResponse({
    schema: createEnrollCourseSchema,
  })
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  async create(
    @Body() createEnrollCourseDto: StudentCreateEnrollCourseDto,
    @CurrentUser() currentUser: User,
    @CurrentCourse() course: Course
  ): Promise<Record<string, any>> {
    createEnrollCourseDto.siteId = course.siteId
    createEnrollCourseDto.institutionId = course.institutionId

    return this.enrollCoursesService.enrollNewClasses({
      createEnrollCourseDto,
      currentUser,
      course,
      isSendEmail: true,
    })
  }

  @Post('multiple')
  @Public()
  @ApiOperation({
    operationId: 'studentEnrollCoursesCreateMultiple',
    summary: 'This api for student use to enroll course',
    description: createEnrollDoc,
  })
  @ApiOkResponse({
    schema: createEnrollCourseSchema,
  })
  async createMultiple(
    @Body() payload: StudentCreateEnrollCourseDto[],
    @CurrentUser() currentUser: User
  ): Promise<Record<string, any>[]> {
    return this.enrollCoursesService.enrollMultipleClasses(currentUser, payload)
  }

  @Patch()
  @Public()
  @ApiOperation({
    operationId: 'studentEnrollCoursesUpdate',
    summary: 'This api for student use to change payment method to enroll course',
    description: createEnrollDoc,
  })
  @ApiOkResponse({
    schema: createEnrollCourseSchema,
  })
  @UseGuards(RequireParamsGuard)
  update(@Body() updateEnrollCourseDto: UpdateInvoicePaymentDto): Promise<Invoice> {
    // updateEnrollCourseDto.meta.type = updateEnrollCourseDto.enrollInto.type as CourseTypeEnum;
    // updateEnrollCourseDto.selectedClassMeta.map((meta) => {
    //   meta.type = updateEnrollCourseDto.enrollInto.type as CourseTypeEnum;
    // });
    return this.enrollCoursesService.updatePayment(updateEnrollCourseDto)
  }

  @Patch('client-secret')
  @Public()
  @ApiOperation({
    operationId: 'studentEnrollCoursesReCreateClientSecret',
    summary: 'This api for student use to re-create stripe based on invoice, amount',
  })
  @ApiOkResponse({
    schema: reCreateClientSecretSchema,
  })
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  reCreateClientSecret(
    @Query('id') id: number,
    @Body() reCreateClientSecretDto: StudentReCreateStripeClientSecretDto,
    @CurrentCourse() course: Course
  ): Promise<StripeClientSecretType> {
    return this.enrollCoursesService.reCreateClientSecret(reCreateClientSecretDto, course)
  }

  /**
   * Check and return calculated price
   * @param confirmEnrollDto
   * @param course
   * @returns
   */
  @ApiExtraModels(StudentEnrollCoursePricingInfo, PageMetaDto)
  @Post('before-payment')
  @Public()
  @ApiOperation({
    operationId: 'studentEnrollCoursesBeforePayment',
    summary: 'This api for student call before go to payment screen, to confirm before payment',
  })
  @ApiOkResponse({
    schema: confirmEnrollCourseSchema,
  })
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  beforePayment(
    @Body() confirmEnrollDto: StudentConfirmEnrollDto,
    @CurrentCourse() course: Course
  ): Promise<StudentEnrollCoursePricingInfo> {
    return this.enrollCoursesService.beforePayment(confirmEnrollDto, course)
  }

  @Post('additional-fee')
  @Public()
  @ApiOperation({
    operationId: 'studentEnrollCoursesGetAdditionalFee',
    summary: 'This api for student call to get additional fee amount',
  })
  @ApiOkResponse({
    schema: confirmEnrollCourseSchema,
  })
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  getAdditionalFee(
    @Body() data: StudentGetAdditionalFeeDto
  ): Promise<Record<string, string | number>> {
    return this.paymentService.getAllAdditionalFee(data)
  }

  @Get('promotion-used')
  @Public()
  @RequireParams(RequireParam.ENROL_ID)
  @ApiOperation({
    operationId: 'studentEnrollCoursesGetPromotions',
    summary: 'This api use to check coupon.',
  })
  findPromotions(@Query() { enrolId }: { enrolId: number }): Promise<any> {
    return this.enrollCoursesService.findPromotion(enrolId)
  }

  // @ApiOperation({
  //   summary:
  //     'This api for student call to get available schedule on a specific appointment (course)',
  //   description: `\`courseId\` is required.
  //   \nTime slot is in \`LOCAL\` timezone set by site owner (not actual local timezone by browser)`,
  // })
  // @RequireParams(RequireParam.COURSE_ID)
  // @UseGuards(RequireParamsGuard)
  // @Public()
  // @Get('appointment-schedule')
  // async getAppointmentSchedule(@Query('courseId') _: number, @CurrentCourse() course: Course) {
  //   const appointments = await course.appointments;
  //   if (!appointments || appointments.length === 0) {
  //     throw new BadRequestException(CourseErrorMessage.APPOINTMENT_NOT_FOUND);
  //   }
  //   let timeZoneOffset = await this.settingWebpageService.getTimeZoneOffset(course.siteId);
  //   if (!timeZoneOffset) {
  //     timeZoneOffset = 0;
  //   }
  //   const appointment = appointments[0];
  //   const data = this.appointmentService.getAppointmentSchedule(
  //     appointment,
  //     timeZoneOffset * 60,
  //     true,
  //   );
  //   return {
  //     statusCode: 200,
  //     data: data,
  //     message: 'Successfully get schedule',
  //   };
  // }

  @Get('stripe-connection')
  @Public()
  @UseGuards(RequireParamsGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @ApiOperation({
    operationId: 'studentEnrollCoursesCheckStripeConnection',
    summary: 'This api use to check whether the instituition has connected to stripe',
  })
  async checkStripeConnection(
    @Query('institutionId') institutionId: number
  ): Promise<StripeConnect> {
    return this.stripeConnectionService.stripeConnection(institutionId)
  }

  @Post('enrollment-record')
  @Public()
  @UseGuards(RequireParamsGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @ApiOperation({
    operationId: 'studentEnrollCoursesGetEnrollmentRecord',
    summary: 'This api for master admin use to get student enrollment record',
  })
  async findEnrollmentRecord(
    @Query('institutionId') institutionId: number,
    @Body() enrollmentRecordDto: StudentEnrollmentRecordDTO
  ): Promise<EnrollCourse> {
    const enrollmentRecord = await this.enrollCoursesService.findOne(
      enrollmentRecordDto,
      institutionId
    )
    const historicalFormData = await this.enrollCoursesService.getUserHistoricalFormData(
      enrollmentRecord.userId,
      enrollmentRecord.userAliasId,
      institutionId
    )

    const studentEnrollment = await this.studentOnboardService.studentEnrollment(
      institutionId,
      enrollmentRecord.userId,
      enrollmentRecord.userAliasId
    )

    if (!studentEnrollment && Object.keys(historicalFormData).length === 0) return enrollmentRecord

    const registrationForm = enrollmentRecord.registrationForm as StudentFormResponse[]

    // Ensure registrationForm is an array before spreading
    if (!Array.isArray(registrationForm)) {
      console.warn(
        `[EnrollCoursesController.findEnrollmentRecord] registrationForm is not an array, using empty array. enrollmentRecordId=${
          enrollmentRecord.id
        }, registrationForm type=${typeof registrationForm}`
      )
    }
    const registrationFormToBeReturned = Array.isArray(registrationForm)
      ? [...registrationForm]
      : []

    // update/add historicalFormData
    Object.keys(historicalFormData).forEach((key) => {
      const existingIndex = registrationFormToBeReturned.findIndex((f) => f.id === key)
      if (existingIndex >= 0) {
        // update existing field
        registrationFormToBeReturned[existingIndex] = historicalFormData[key]
      } else {
        // add new field
        registrationFormToBeReturned.push(historicalFormData[key])
      }
    })

    // update/add studentEnrollment data (highest priority, will cover previous data)
    Object.keys(studentEnrollment || {}).forEach((key) => {
      const existingIndex = registrationFormToBeReturned.findIndex((f) => f.id === key)
      if (existingIndex >= 0) {
        // update existing field
        registrationFormToBeReturned[existingIndex] = { ...studentEnrollment[key], id: key }
      } else {
        // add new field
        registrationFormToBeReturned.push({ ...studentEnrollment[key], id: key })
      }
    })
    enrollmentRecord.registrationForm = registrationFormToBeReturned
    return enrollmentRecord
  }

  @Get('invoice')
  @Public()
  @ApiOperation({
    operationId: 'studentEnrollCoursesGetInvoice',
    summary: 'This api for student to get invoice by token',
  })
  getInvoice(@Query('token') token: string): Promise<StudentInvoiceResponseDto> {
    return this.invoiceService.findByProofToken(token)
  }

  @Get('invoices')
  @Public()
  @ApiOperation({
    operationId: 'studentEnrollCoursesGetInvoices',
    summary: 'This api for student to get invoices by token',
  })
  getInvoices(@Query('token') token: string): Promise<StudentInvoiceResponseDto[]> {
    return this.invoiceService.findInvoicesByProofToken(token)
  }

  @Post('student-lessons')
  @Public()
  @ApiOperation({
    operationId: 'studentEnrollCoursesGetStudentLessons',
    summary: 'This api is for student to get student lessons from enroll course',
  })
  async getStudentLessonFromEnrollCourse(
    @Body() data: StudentGetEnrollCourseStudentLessonDto
  ): Promise<StudentLesson[]> {
    return this.enrollCoursesService.findStudentLessonsWithEnrollIds(data.enrollIds)
  }

  @Patch('update-enrollment-state')
  @Public()
  @ApiOperation({
    operationId: 'studentEnrollCoursesUpdateEnrollmentState',
    summary: 'This api for student use to change enrollment state',
  })
  @ApiOkResponse({
    schema: createEnrollCourseSchema,
  })
  @RequireParams(RequireParam.ENROLLMENTID)
  @UseGuards(RequireParamsGuard)
  updateEnrollmentState(
    @Query('enrollmentId') enrollmentId: number,
    @CurrentUser() currentUser: User,
    @CurrentCourse() course: Course
  ): Promise<EnrollCourse> {
    return this.enrollCoursesService.updateEnrollmentStatus(enrollmentId)
  }

  // @Post('notification-settings/token')
  // @RequireParams(RequireParam.TOKEN)
  // @Public()
  // @ApiOperation({
  //   operationId: 'studentEnrollCoursesAdjustNotificationSettings',
  //   summary: 'This api for student use to adjust notification settings by token',
  // })
  // @ApiOkResponse({
  //   schema: studentNotificationSchema,
  // })
  // adjustNotificationSettings(
  //   @Query('token') token: string,
  //   @Body() payload: StudentNotificationSettings[]
  // ): Promise<StudentNotificationSettings[]> {
  //   return this.enrollCoursesService.adjustNotificationSettings(token, payload)
  // }

  // @Get('notification-settings/token')
  // @RequireParams(RequireParam.TOKEN)
  // @Public()
  // @ApiOperation({
  //   operationId: 'studentEnrollCoursesGetNotificationSettings',
  //   summary: 'This api for student use to get notification settings by token',
  // })
  // @ApiOkResponse({
  //   schema: studentNotificationSchema,
  // })
  // getNotificationSettings(@Query('token') token: string): Promise<StudentNotificationSettings[]> {
  //   return this.enrollCoursesService.getNotificationSettings(token)
  // }

  @Post('/check-quota')
  @Public()
  @ApiOperation({
    summary: 'This api for checking quota of class lesson',
  })
  async checkQuota(@Body() body: CheckQuotaDto) {
    return this.classLessonService.checkQuota(body)
  }
}
