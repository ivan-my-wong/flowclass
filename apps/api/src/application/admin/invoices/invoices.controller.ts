import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { getAllEnrollCourseSchema } from '@/application/admin/enroll-courses/dto/enroll-course.schema'
import {
  FindInvoiceStatisticsByDateRangeDto,
  InvoicesOptionDto,
  InvoicesPageDto,
} from '@/application/admin/enroll-courses/dto/invoices-option.dto'
import { ApiResult } from '@/common/api-formats/api-result'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { PageMetaDto } from '@/common/pagination/page-meta.dto'
import { InvoiceService } from '@/domain/service/invoice.service'
import { InvoiceStatisticsService } from '@/domain/service/invoice-statistics.service'
import { RequireParam, Role } from '@/models/enums/'
import { Invoice } from '@/models/invoice.entity'
import { PayoutMethod } from '@/models/payout-method.entity'
import InvoiceWorker from '@/modules/worker/invoice.worker'

import { EnrollCoursesService } from '../../../domain/service/enroll-courses.service'
import { UpdateInvoicePaymentStateDto } from '../student-onboard/dtos/student-onboard.dto'

import {
  GenerateInvoicesNextMonthDTO,
  SendCustomMessagesDto,
  UpdateInvoiceRemarkDto,
} from './dto/invoices.dto'
import {
  DashboardStatisticsDto,
  DropoutStudentsQueryDto,
  LessonDetailQueryDto,
  LessonListQueryDto,
  StudentByStudentQueryDto,
  StudentCourseDetailsQueryDto,
  StudentStatisticsDto,
} from './dto/statistics.dto'

@ApiTags('Admin Invoices')
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
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('invoices')
export class InvoicesController {
  constructor(
    private readonly enrollCoursesService: EnrollCoursesService,
    private readonly invoiceService: InvoiceService,
    private readonly invoiceWorker: InvoiceWorker,
    private readonly statisticsService: InvoiceStatisticsService
  ) {}

  @ApiExtraModels(Invoice, PageMetaDto)
  @Post('all')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for master admin use to get student invoices',
  })
  @ApiOkResponse({
    schema: getAllEnrollCourseSchema,
  })
  async findAllInvoices(@Body() pageOptionsDto: InvoicesOptionDto): Promise<InvoicesPageDto> {
    return this.invoiceService.findInstitutionInvoices(pageOptionsDto)
  }

  @Get('detail/:invoiceId')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @UseGuards(RequireParamsGuard)
  async findSingleInvoice(@Param('invoiceId', ParseIntPipe) invoiceId: number) {
    return this.invoiceService.findSingleInvoiceByInvoiceId(invoiceId)
  }

  // Function to get invoices by a user Id, by filtering only the course that is assigned to that user
  @Post('all/user/:userId')
  @ApiOperation({
    summary: 'This api for master admin use to get student invoices by user id',
  })
  @ApiOkResponse({
    schema: getAllEnrollCourseSchema,
  })
  @ApiBadRequestResponse({
    type: ApiResult,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async findByUserId(
    @Param('userId') userId: number,
    @Body() pageOptionsDto: InvoicesOptionDto
  ): Promise<InvoicesPageDto> {
    const listOfInvoices = await this.invoiceService.findInstitutionInvoices(pageOptionsDto)

    const listOfInvoicesOfUser = listOfInvoices.content.filter((invoice) =>
      invoice.studentSchedules.some((studentSchedule) => {
        return studentSchedule?.class?.instructorId === userId
      })
    )

    return {
      content: listOfInvoicesOfUser,
      meta: listOfInvoices.meta,
    }
  }

  @Get('statistics/basic')
  @ApiOperation({
    summary: 'This api for master admin use to get student invoices statistics',
  })
  @ApiOkResponse({
    type: Invoice,
    isArray: true,
  })
  @ApiBadRequestResponse({
    type: ApiResult,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  findInvoiceStatisticsByDateRange(@Query() params: FindInvoiceStatisticsByDateRangeDto) {
    return this.invoiceService.findInvoiceStatisticsByDateRange(params)
  }

  @Get('statistic/metrics')
  @ApiOperation({
    summary: 'Get dashboard statistics metrics',
  })
  @ApiOkResponse({
    description: 'Statistics retrieved successfully',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getStatisticMetrics(@Query() query: DashboardStatisticsDto) {
    const { start, end, ...rest } = query

    if (isNaN(Date.parse(start)) || isNaN(Date.parse(end))) {
      throw new BadRequestException('Invalid date format. Use ISO YYYY-MM-DD.')
    }

    const startDate = new Date(start)
    const endDate = new Date(end)

    // Normalize to full month
    const startOfMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    const endOfMonth = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 1)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use ISO YYYY-MM-DD.')
    }

    return this.invoiceService.getDashboardStatistics({
      ...rest,
      startDate: startOfMonth,
      endDate: endOfMonth,
    })
  }

  @Get('statistic/basic')
  @Get('statistic/students')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getStudentStatisticsByStudent(@Query() query: StudentStatisticsDto) {
    const { start, end, institutionId, siteId, studentName, classId, teacherId } = query
    const startDate = new Date(start)
    const endDate = new Date(end)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use ISO YYYY-MM-DD.')
    }

    return this.invoiceService.getStudentStatisticsByStudent({
      startDate,
      endDate,
      institutionId,
      siteId,
      studentName,
      classId,
      teacherId,
    })
  }

  @Get('statistic/students/:studentId/courses')
  @ApiOperation({
    summary: 'Get course details for a specific student',
  })
  @ApiOkResponse({
    description: 'Student course details retrieved successfully',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getStudentCourseDetails(
    @Param('studentId', ParseIntPipe) studentId: number,
    @Query() query: StudentCourseDetailsQueryDto
  ) {
    const { start, end, institutionId, siteId } = query
    const startDate = new Date(start)
    const endDate = new Date(end)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use ISO YYYY-MM-DD.')
    }

    return this.invoiceService.getStudentCourseDetails(studentId, {
      startDate,
      endDate,
      institutionId,
      siteId,
    })
  }

  @Get('statistic/lessons')
  @ApiOperation({
    summary: 'Get paginated list of lessons with filters',
  })
  @ApiOkResponse({
    description: 'Lesson list retrieved successfully',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getLessonList(@Query() query: LessonListQueryDto) {
    const {
      startDate,
      endDate,
      page = 1,
      limit = 50,
      courseId,
      classId,
      instructorId,
      studentName,
      lessonId,
      lessonName,
      siteId,
      institutionId,
    } = query

    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format. Use ISO YYYY-MM-DD.')
    }

    return this.invoiceService.getLessonList({
      startDate: start,
      endDate: end,
      page,
      limit,
      courseId,
      classId,
      instructorId,
      studentName,
      lessonId,
      lessonName,
      siteId,
      institutionId,
    })
  }

  @Get('statistic/lessons/:lessonId')
  @ApiOperation({
    summary: 'Get detailed student payments and attendance for a lesson',
  })
  @ApiOkResponse({
    description: 'Lesson detail retrieved successfully',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getLessonDetail(
    @Param('lessonId', ParseIntPipe) lessonId: number,
    @Query() query: LessonDetailQueryDto
  ) {
    const { siteId, institutionId } = query

    return this.invoiceService.getLessonDetail({
      lessonId,
      siteId,
      institutionId,
    })
  }

  @Get('statistic/dropouts')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getDropoutStudents(@Query() query: DropoutStudentsQueryDto) {
    const { classId, start, end, institutionId, siteId } = query

    const startDate = new Date(start)
    const endDate = new Date(end)

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use ISO YYYY-MM-DD.')
    }

    return this.invoiceService.getDropoutStudents({
      classId,
      startDate,
      endDate,
      institutionId,
      siteId,
    })
  }

  @Get('statistic/students/by-student')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getStudentStatsByStudent(@Query() query: StudentByStudentQueryDto) {
    const { start, end, institutionId, siteId, studentName, classId, teacherId } = query

    if (isNaN(Date.parse(start)) || isNaN(Date.parse(end))) {
      throw new BadRequestException('Invalid date format. Use ISO YYYY-MM-DD.')
    }

    // Convert string dates to Date objects
    const startDate = new Date(start)
    const endDate = new Date(end)

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format. Use ISO YYYY-MM-DD.')
    }

    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date.')
    }

    return this.invoiceService.getStudentStatisticsByStudent({
      startDate,
      endDate,
      institutionId,
      siteId,
      studentName,
      classId,
      teacherId,
    })
  }

  @Post('/update-payment-state')
  @ApiOperation({
    summary: 'This api for update enroll course.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when update enroll course',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async updateInvoicePaymentState(@Body() params: UpdateInvoicePaymentStateDto) {
    return this.invoiceService.updatePaymentState(params.invoiceId, params.paymentState)
  }

  @ApiExtraModels(Invoice, PageMetaDto)
  @Get('enrollment')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.SITE_MANAGER)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for master admin use to get all student invoices by enroll Id',
  })
  @ApiOkResponse({
    schema: getAllEnrollCourseSchema,
  })
  findEnrollmentInvoices(@Query('enrollId') enrollId: number): Promise<Invoice[]> {
    return this.invoiceService.findByEnrollId(enrollId)
  }

  @ApiOperation({
    summary: 'This api for master admin use to preview generate invoices for next month',
  })
  @Post('generate-invoice/preview')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async previewGenerateInvoices(
    @Query('institutionId') institutionId: number,
    @Body() dto: GenerateInvoicesNextMonthDTO
  ) {
    return this.invoiceWorker.previewInvoicesNextMonth(institutionId, dto)
  }

  @ApiOperation({
    summary: 'This api for master admin use to generate invoices for next month',
  })
  @Post('generate-invoice')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async generateInvoices(@Body() dto: GenerateInvoicesNextMonthDTO) {
    return this.invoiceWorker.generateInvoiceForNextMonth(dto)
  }

  @ApiOperation({
    summary: 'This api for master admin use to send custom messages to students by invoice ids',
  })
  @Post('send-custom-messages')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async sendCustomMessages(@Body() dto: SendCustomMessagesDto) {
    return this.invoiceWorker.sendCustomMessages(dto)
  }

  @Post('update-payment-amount')
  @ApiOperation({
    summary: 'This api for master admin use to update payment amount for invoice',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when update payment amount for invoice',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async updatePaymentAmount(@Body() params: { invoiceId: number; paymentAmount: number }) {
    return this.invoiceService.updatePaymentAmount(params.invoiceId, params.paymentAmount)
  }

  @Post('update-amount-paid')
  @ApiOperation({
    summary: 'Update amount paid for invoice',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when update amount paid for invoice',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async updateAmountPaid(@Body() params: { invoiceId: number; amountPaid: number }) {
    return this.invoiceService.updateAmountPaid(params.invoiceId, params.amountPaid)
  }

  @Put('remark/:invoiceId')
  @ApiOperation({
    summary: 'This api for master admin use to update remark for invoice',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when update remark for invoice',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async updateRemark(
    @Param('invoiceId') invoiceId: number,
    @Body() params: UpdateInvoiceRemarkDto
  ) {
    return this.invoiceService.updateRemark(invoiceId, params.remark)
  }

  @Delete('remark/:invoiceId')
  @ApiOperation({
    summary: 'This api for master admin use to delete remark for invoice',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when delete remark for invoice',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async deleteRemark(@Param('invoiceId') invoiceId: number) {
    return this.invoiceService.deleteRemark(invoiceId)
  }

  @Post('update-pay-later-method')
  @ApiOperation({
    summary: 'This api for master admin use to update pay later method for invoice',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when update payment amount for invoice',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async updatePayLaterMethod(@Body() params: { invoiceId: number; payLaterMethod?: PayoutMethod }) {
    return this.invoiceService.updatePayLaterMethod(params.invoiceId, params.payLaterMethod)
  }

  @Post('update-payment-date')
  @ApiOperation({
    summary: 'This api for master admin use to update payment date for invoice',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when update payment date for invoice',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async updatePaymentDate(@Body() params: { invoiceId: number; paymentDate: string }) {
    return this.invoiceService.updatePaymentDate(params.invoiceId, {
      paymentDate: params.paymentDate,
    })
  }
}
