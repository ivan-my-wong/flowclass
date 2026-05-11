import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  Sse,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { randomUUID } from 'crypto'
import { existsSync, mkdirSync } from 'fs'
import { diskStorage } from 'multer'
import { extname } from 'path'

import {
  PayNowResponse,
  StudentEnrollCourseResponse,
} from '@/application/student/enroll-courses/dto/create-enroll-course.dto'
import { ApiResult } from '@/common/api-formats/api-result'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { Public } from '@/common/decorators/public.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { StudentOnbService } from '@/domain/service/student-onboard.service'
import { EnrollCourse } from '@/models/enroll-courses.entity'
import { RequireParam, Role } from '@/models/enums/'
import { StudentForm, StudentFormMetadata } from '@/models/student-form.entity'
import { User, UserStatus } from '@/models/user.entity'
import { SSEService } from '@/modules/sse/sse.service'

import { AddFieldsToStudentRecordDto } from './dtos/add-fields-to-student-record.dto'
import { AddToParentGroupDto } from './dtos/add-to-parent-group.dto'
import { ChangeParentGroupDto } from './dtos/change-parent-group.dto'
import { DeleteFieldFromStudentRecordDto } from './dtos/delete-field-from-student-record.dto'
import { RemoveFromParentGroupDto } from './dtos/remove-from-parent-group.dto'
import { SetParentAccountDto } from './dtos/set-parent-account.dto'
import {
  CreateAndUpdateStudentContactInfoDto,
  CreateOrUpdateStudentContactInfoV2Dto,
  StudentNotificationSettings,
} from './dtos/student-memo.dto'
import {
  AddTeachingServiceDto,
  CheckImportStuDto,
  CreateExtraLessonDto,
  CreateStudentDto,
  CsvHeadersMappingDto,
  DeleteTeachingServiceDto,
  ExportStuDto,
  GetEnrolledLessonsDto,
  GetStudentDetailResponseDto,
  GetStudentFormFieldsDto,
  GetTeachingServiceByInvoiceDto,
  GetTeachingServiceOptDto,
  ImportStuDto,
  MergeStudentDto,
  StudentChangeLessonDto,
  StudentChangeLessonOptDto,
  StudentCouponDto,
  StudentFormDto,
  StudentOnbDeleteDto,
  StudentOnbDetailtByAliasIdDto,
  StudentOnbFilterListDto,
  StudentOnbListDto,
  UpdateEnrollCourseDto,
  UpdateLessonAttendanceDto,
  UpdateStatusDto,
  UpdateStudentFormDto,
} from './dtos/student-onboard.dto'

// Create a reusable pipe for CSV/Excel file validation (top-level, outside the class)
const parseCsvFilePipe = new ParseFilePipe({
  validators: [
    new FileTypeValidator({
      fileType:
        /(text\/csv|application\/(vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|vnd\.ms-excel))/,
      skipMagicNumbersValidation: true,
    }),
  ],
})

@Controller('student-onboard')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@UseInterceptors(ClassSerializerInterceptor)
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiResponse({
  description: 'This response when system error.',
  status: 500,
})
export class StudentOnbController {
  constructor(
    private readonly studentOnboardService: StudentOnbService,
    private readonly sseService: SSEService
  ) {}

  @Post('list-student')
  @ApiOperation({
    summary: 'This api for list all student onboard of flowclass.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getListStudent(@Query() params: StudentOnbListDto): Promise<GetStudentDetailResponseDto[]> {
    return await this.studentOnboardService.getAllStudentsInInstitutionQueryBuilder(params)
  }

  @Post('list-student/user/:userId')
  @ApiOperation({
    summary: 'This api for list all student onboard of flowclass.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getListStudentByOwnUserId(
    @Query() params: StudentOnbListDto,
    @Param('userId') userId: number
  ): Promise<GetStudentDetailResponseDto[]> {
    return await this.studentOnboardService.getAllStudentsInInstitutionQueryBuilder({
      ...params,
      userId,
    })
  }

  @Post('/delete')
  @ApiOperation({
    summary: 'This api for delete student onboard of flowclass.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async delete(@Body() params: StudentOnbDeleteDto): Promise<User[]> {
    return await this.studentOnboardService.deleteStudentRecord(params)
  }

  @Post('merge-student')
  @ApiOperation({
    summary: 'Merge all data from one student alias into another, then soft-delete the source.',
  })
  @ApiOkResponse({ type: ApiResult })
  @ApiBadRequestResponse({ description: 'Source or target alias not found' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async mergeStudent(@Body() params: MergeStudentDto) {
    const result = await this.studentOnboardService.mergeStudentRecord(params)
    return new ApiResult().success(result)
  }

  @Post('create')
  @ApiOperation({
    summary: 'This api for create student onboard of flowclass.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user after create',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async create(@Body() params: CreateStudentDto) {
    const result = await this.studentOnboardService.createStudentRecord(params)

    if (result.status === UserStatus.INACTIVE) {
      // return unchanged 304 not modified
      return new ApiResult().notModified(result)
    }

    return new ApiResult().success(result)
  }

  @Post('filter/custom-field')
  @ApiOperation({
    summary: 'This api for list all student onboard of flowclass by custom field filter rules.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  async getWithCustomFieldFilter(
    @Body() params: StudentOnbFilterListDto
  ): Promise<GetStudentDetailResponseDto[]> {
    return await this.studentOnboardService.getStudentOnbByCustomFieldFilter(params)
  }

  @Get('/view/:id')
  @ApiOperation({
    summary:
      'This API retrieves the onboard details of a student, including phone, email, name and enrolled classes. This is used in the <StudentDetail />',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getStudent(
    @Query() params: StudentOnbDetailtByAliasIdDto
  ): Promise<GetStudentDetailResponseDto> {
    return await this.studentOnboardService.viewById(params)
  }

  @ApiOperation({
    summary: 'Get student lessons',
    description: 'Retrieves all lessons for a student with pagination support.',
  })
  @ApiQuery({
    name: 'userId',
    type: Number,
    required: true,
    description: 'The ID of the student',
  })
  @ApiQuery({
    name: 'institutionId',
    type: Number,
    required: true,
    description: 'The ID of the institution',
  })
  @Get('student-lessons')
  @ApiOperation({
    summary: 'This api for get student lessons',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getStudentLessons(
    @Query('userId', new ParseIntPipe()) userId: number,
    @Query('institutionId', new ParseIntPipe()) institutionId: number
  ) {
    return await this.studentOnboardService.getAllStudentLessonsOfUser({ userId, institutionId })
  }

  @Post('/update-status')
  @ApiOperation({
    summary: 'This api for update student status onboard of flowclass.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user after update status',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async updateStatus(@Body() params: UpdateStatusDto, @CurrentUser() user) {
    const result = await this.studentOnboardService.updateStatus(params, user)

    return new ApiResult().success(result)
  }

  @Get('get-student-teaching-service')
  @ApiOperation({
    summary: 'This api for list all student teaching service of flowclass.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when user teaching service already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getTeachingService(@Query() params: GetTeachingServiceByInvoiceDto) {
    const result = await this.studentOnboardService.getTeachingService(params)
    return new ApiResult().success(result)
  }

  @Get('teaching-service-opt')
  @ApiOperation({
    summary: 'This api for get teaching service option for add.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when user teaching service already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getTeachingServiceOpt(@Query() params: GetTeachingServiceOptDto) {
    const result = await this.studentOnboardService.getTeachingServiceOpt(params)

    return new ApiResult().success(result)
  }

  @Get('teaching-service-opt/subscription')
  @ApiOperation({
    summary: 'This api for get teaching service option for add.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when user teaching service already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getTeachingServiceOptSubscription(@Query() params: GetTeachingServiceOptDto) {
    const result = await this.studentOnboardService.getTeachingServiceOptSubscription(params)

    return new ApiResult().success(result)
  }

  @Post('/add-teaching-service')
  @ApiOperation({
    summary: 'This api for add teaching service.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when add teaching service',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async addTeachingService(
    @Body() params: AddTeachingServiceDto
  ): Promise<StudentEnrollCourseResponse[] | PayNowResponse[]> {
    return await this.studentOnboardService.addTeachingService(params)
  }

  @Post('/bulk-add-teaching-service')
  @ApiOperation({
    summary: 'This api for bulk add teaching service.',
    description: `
      Bulk add teaching service for multiple students. Returns a jobId for SSE streaming.
      Connect to /stream/{jobId} to receive real-time progress updates.
      
      Progress events include:
      - status: 'processing' | 'completed' | 'error'
      - current: current item index
      - total: total items to process
      - percentage: completion percentage
      - currentStudent: current student name being processed
      - results: array of results (only in final event)
    `,
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when bulk add teaching service',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async bulkAddTeachingService(@Body() params: AddTeachingServiceDto): Promise<{ jobId: string }> {
    const jobId = randomUUID()
    const bulkAssignCourse = params.bulkAssignCourse || []

    if (bulkAssignCourse.length === 0) {
      throw new BadRequestException('bulkAssignCourse array cannot be empty')
    }

    // Process asynchronously and emit progress via SSE
    this.processBulkTeachingService(jobId, params, bulkAssignCourse).catch((error) => {
      this.sseService.emitEvent(jobId, {
        status: 'error',
        error: error.message,
        current: bulkAssignCourse.length,
        total: bulkAssignCourse.length,
        percentage: 100,
      })
    })

    return { jobId }
  }

  @Public()
  @Get('stream/:jobId')
  @Sse()
  @ApiOperation({
    summary: 'Stream bulk teaching service assignment progress via Server-Sent Events',
    description: `
      Connect to this endpoint to receive real-time progress updates for bulk teaching service assignments.
      
      Usage:
      - Call POST /bulk-add-teaching-service to start the process and get a jobId
      - Connect to this endpoint with the jobId to receive progress updates
      
      Event format:
      {
        status: 'processing' | 'completed' | 'error',
        current: number,        // Current item index (0-based)
        total: number,          // Total items to process
        percentage: number,    // Completion percentage (0-100)
        currentStudent: string, // Name of student currently being processed
        error?: string,         // Error message (only if status is 'error')
        results?: array         // Final results array (only when status is 'completed')
      }
      
      Example:
      GET /admin/student-onboard/stream/c90ad871-b82c-4d4e-a421-140a9678cdc7
      
      Events:
      - Progress updates during processing
      - Completion notification with results
      - Error notifications for individual items or overall failure
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'SSE stream for bulk teaching service assignment progress',
  })
  async streamBulkTeachingServiceStatus(@Param('jobId') jobId: string) {
    return this.sseService.getEvent(jobId)
  }

  private async processBulkTeachingService(
    jobId: string,
    params: AddTeachingServiceDto,
    bulkAssignCourse: Array<{ userAliasId: number; email?: string; phone: string; name: string }>
  ): Promise<void> {
    const result: (StudentEnrollCourseResponse[] | PayNowResponse[])[] = []
    const total = bulkAssignCourse.length
    const pauseBetweenItems = 500 // 500ms pause between items

    // The reason we have to split into two is because if we run everything in one function,
    // The second records afterwards will create its own class lessons and student lessons
    // because the first row will take too long to create and the second row will not be able to find
    // the class lesson created by the first row
    // I don't know why but it's quite fun to write comments like this. Been coding for 10 hours and so tired.

    // Process first item
    const firstRow = bulkAssignCourse[0]
    this.sseService.emitEvent(jobId, {
      status: 'processing',
      current: 0,
      total,
      percentage: 0,
      currentStudent: firstRow.name,
    })

    try {
      const firstResult = await this.studentOnboardService.addTeachingService({
        ...params,
        userAliasId: firstRow.userAliasId,
        email: firstRow.email,
        phone: firstRow.phone,
        name: firstRow.name,
      })
      result.push(firstResult)

      this.sseService.emitEvent(jobId, {
        status: 'processing',
        current: 1,
        total,
        percentage: Math.round((1 / total) * 100),
        currentStudent: firstRow.name,
      })
    } catch (error) {
      this.sseService.emitEvent(jobId, {
        status: 'error',
        current: 1,
        total,
        percentage: Math.round((1 / total) * 100),
        currentStudent: firstRow.name,
        error: error.message,
      })
      throw error
    }

    // Process remaining items sequentially with pauses
    for (let i = 1; i < bulkAssignCourse.length; i++) {
      // Add pause between items to prevent overwhelming the system
      if (i > 1) {
        await new Promise((resolve) => setTimeout(resolve, pauseBetweenItems))
      }

      const row = bulkAssignCourse[i]

      this.sseService.emitEvent(jobId, {
        status: 'processing',
        current: i,
        total,
        percentage: Math.round((i / total) * 100),
        currentStudent: row.name,
      })

      try {
        const itemResult = await this.studentOnboardService.addTeachingService({
          ...params,
          userAliasId: row.userAliasId,
          email: row.email,
          phone: row.phone,
          name: row.name,
        })
        result.push(itemResult)

        this.sseService.emitEvent(jobId, {
          status: 'processing',
          current: i + 1,
          total,
          percentage: Math.round(((i + 1) / total) * 100),
          currentStudent: row.name,
        })
      } catch (error) {
        this.sseService.emitEvent(jobId, {
          status: 'error',
          current: i + 1,
          total,
          percentage: Math.round(((i + 1) / total) * 100),
          currentStudent: row.name,
          error: error.message,
        })
        // Continue processing other items even if one fails
        result.push([])
      }
    }

    // Emit final completion event
    this.sseService.emitEvent(jobId, {
      status: 'completed',
      current: total,
      total,
      percentage: 100,
      results: result,
    })
  }

  @Post('/add-extra-lesson')
  @ApiOperation({
    summary: 'This api for add extra lessons for students.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when add extra lesson',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  // @UseGuards(RolesGuard)
  async addExtraLesson(@Body() params: CreateExtraLessonDto) {
    return this.studentOnboardService.addExtraLesson(params)
  }

  @Patch('/update-remarks')
  @ApiOperation({ summary: 'Update remarks for a student alias.' })
  @ApiOkResponse({ type: ApiResult })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  async updateRemarks(@Body() params: { userAliasId: number; remarks: string | null }) {
    return this.studentOnboardService.updateRemarks(params.userAliasId, params.remarks)
  }

  @Post('/update-contact-info')
  @ApiOperation({
    summary: 'This api for add student memo.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when add student memo',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  async editContactInfo(@Body() params: CreateAndUpdateStudentContactInfoDto) {
    const result = await this.studentOnboardService.editStudentContactInfo(params)
    return result
  }

  // New version of update contact info api
  @Post('/update-contact-info-v2')
  @ApiOperation({
    summary: 'This api for update student contact info.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when update student contact info',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  // @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async updateContactInfoV2(@Body() params: CreateOrUpdateStudentContactInfoV2Dto) {
    const result = await this.studentOnboardService.updateContactInfoV2(params)
    return result
  }

  @Patch('/update-teaching-service/:enrolId')
  @ApiOperation({
    summary: 'This api for updating teaching service.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when updating teaching service',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.ENROL_ID)
  async updateTeachingService(
    @Body() params: AddTeachingServiceDto,
    @Param('enrolId', new ParseIntPipe()) enrolId: number
  ): Promise<EnrollCourse> {
    const result = await this.studentOnboardService.updateTeachingService({
      params,
      enrolId,
    })

    return result
  }

  @Post('/delete-teaching-service')
  @ApiOperation({
    summary: 'This api for delete teaching service.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when delete teaching service',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async deleteTeachingService(@Body() params: DeleteTeachingServiceDto) {
    const result = await this.studentOnboardService.deleteTeachingService(params)

    return new ApiResult().success(result)
  }

  @Get('coupon')
  @ApiOperation({
    summary: 'This api for get coupon assign for student.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when assign coupon to user ',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getCoupons(@Query() params: StudentCouponDto) {
    const result = await this.studentOnboardService.getCoupons(params)

    return new ApiResult().success(result)
  }

  @Post('/update-enroll-course')
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
  async updateEnrollCourse(@Body() params: UpdateEnrollCourseDto) {
    const result = await this.studentOnboardService.updateEnrollCourse(params)

    return new ApiResult().success(result)
  }

  @Get('student-change-lesson-opt')
  @ApiOperation({
    summary: 'This api for get class lesson.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when class lesson exist ',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getStudentChangeLesson(@Query() params: StudentChangeLessonOptDto) {
    const result = await this.studentOnboardService.getStudentChangeLesson(params)

    return new ApiResult().success(result)
  }

  @Post('get-enroll-student-lesson')
  @ApiOperation({
    summary: 'This api for get enrolled student lessons',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when class lesson exist ',
  })
  // @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  // @UseGuards(RolesGuard)
  // @RequireParams(RequireParam.INSTITUTION_ID)
  async getEnrollStudentLesson(@Body() body: GetEnrolledLessonsDto) {
    const result = await this.studentOnboardService.getEnrolledStudentLessonsForScanning(body)

    return new ApiResult().success(result)
  }

  @Post('student-change-lesson')
  @ApiOperation({
    summary: 'This api for update student lesson.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when update student lesson',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async changeStudentLesson(@Body() params: StudentChangeLessonDto, @CurrentUser() user) {
    const result = await this.studentOnboardService.changeStudentLesson(params, user)

    return new ApiResult().success(result)
  }

  @Patch('/update-attendance')
  @ApiOperation({
    summary: 'This api for update student lesson attendance.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when update student lesson attendance',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  // @UseGuards(RolesGuard)
  // @RequireParams(RequireParam.INSTITUTION_ID)
  async updateLessonAttendance(@Body() params: UpdateLessonAttendanceDto) {
    const result = await this.studentOnboardService.updateLessonAttendance(params)

    return new ApiResult().success(result)
  }

  @Patch('/update-student-lesson-remarks')
  @ApiOperation({ summary: 'Update remarks for a student lesson.' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  async updateStudentLessonRemarks(
    @Body() params: { studentLessonId: number; remarks: string | null }
  ) {
    const result = await this.studentOnboardService.updateStudentLessonRemarks(
      params.studentLessonId,
      params.remarks
    )
    return new ApiResult().success(result)
  }

  @Delete('/delete-lesson/:id')
  @ApiOperation({
    summary: 'This api for delete student lesson.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when update student lesson',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  async deleteStudentLesson(@Param('id', new ParseIntPipe()) id: number) {
    const result = await this.studentOnboardService.deleteSingleStudentLesson(id)

    return new ApiResult().success(result)
  }

  @Get('/student-enrollment')
  @ApiOperation({
    summary: 'This api for get student Enrollment.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when get student Enrollment',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async studentEnrollment(@Query() params: StudentFormDto) {
    return this.studentOnboardService.studentEnrollment(
      params.institutionId,
      params.userId,
      params.userAliasId
    )
  }

  @Post('/update-student-enrollment')
  @ApiOperation({
    summary: 'This api for update student enrollment.',
  })
  @ApiBadRequestResponse({
    description: 'This response may be when update student enrollment',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async updateStudentEnrollment(
    @Body() params: UpdateStudentFormDto
  ): Promise<ApiResult<StudentForm[]>> {
    const result = await this.studentOnboardService.updateStudentForm(params)

    const resultWithoutNull = result.filter((item) => !!item)

    return new ApiResult<StudentForm[]>().success(resultWithoutNull)
  }

  @Post('/column-names')
  @ApiOperation({
    summary: 'This api for get column of csv file',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when get column of csv file',
  })
  // @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  // @UseGuards(RolesGuard)
  // @RequireParams(RequireParam.INSTITUTION_ID)
  async getColumnCSV(@Req() req) {
    const result = await this.studentOnboardService.getColumnCSV(req.files[0])

    return new ApiResult().success(result)
  }

  @Post('/get-charge-frequency-values')
  @ApiOperation({
    summary: 'This api for get charge frequency values after mapping header',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request for get charge frequency values ',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CheckImportStuDto,
  })
  // @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  // @UseGuards(RolesGuard)
  // @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.SITE_ID)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (
          req: Express.Request,
          file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void
        ) => {
          const uploadPath = process.env.FILE_UPLOAD_LOCATION
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true })
          }
          cb(null, uploadPath)
        },
        filename(req, file, cb) {
          cb(null, `${randomUUID()}${extname(file.originalname)}`)
        },
      }),
    })
  )
  async getChargeFrequencyValues(
    @UploadedFile(parseCsvFilePipe)
    file: Express.Multer.File,
    @Body() body: CsvHeadersMappingDto
  ) {
    const result = await this.studentOnboardService.getChargeFrequencyValues(file, body.fields)
    return new ApiResult().success(result)
  }

  @Post('/check-csv')
  @ApiOperation({
    summary: 'This api for check import csv file',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'Bad Request for check CSV file',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CheckImportStuDto,
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (
          req: Express.Request,
          file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void
        ) => {
          const uploadPath = process.env.FILE_UPLOAD_LOCATION
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true })
          }
          cb(null, uploadPath)
        },
        filename(req, file, cb) {
          cb(null, `${randomUUID()}${extname(file.originalname)}`)
        },
      }),
    })
  )
  async checkImportCSV(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({
            fileType:
              /(text\/csv|application\/(vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|vnd\.ms-excel))/,
            skipMagicNumbersValidation: true,
          }),
        ],
      })
    )
    file: Express.Multer.File,
    @Body() body: CheckImportStuDto,
    @Query('institutionId') institutionId?: number,
    @Query('siteId') siteId?: number
  ) {
    const result = await this.studentOnboardService.checkImportCsvValid(file, {
      institutionId,
      siteId,
      mapDbValue: body.mapDbValue,
    })

    return new ApiResult().success(result)
  }

  @Post('import')
  @ApiOperation({
    summary: 'This api for import data from csv file',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when import csv file',
  })
  async importCSV(@Body() body: ImportStuDto) {
    const result = await this.studentOnboardService.importCSV(body)

    return new ApiResult().success(result)
  }

  @Post('/student-form-field')
  @ApiOperation({
    summary: 'This api for get form fields answer',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when get student register form',
  })
  async getStudentFormFieldsAnswer(@Body() body: GetStudentFormFieldsDto) {
    const result = await this.studentOnboardService.getStudentFormField(body)

    return new ApiResult().success(result)
  }

  @Post('/export')
  @ApiOperation({
    summary: 'This api for export student record',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when export student record',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async export(@Body() body: ExportStuDto) {
    const result = await this.studentOnboardService.exportCSV(body)

    return new ApiResult().success(result)
  }

  @Post('add-fields-to-student-record')
  @ApiOperation({
    summary: 'This api for student use to add fields to student record',
  })
  @ApiBody({ type: AddFieldsToStudentRecordDto })
  @RequireParams(RequireParam.USER_ID, RequireParam.INSTITUTION_ID)
  addFieldsToStudentRecord(
    @Body()
    data: {
      userId: number
      userAliasId: number
      institutionId: number
      fields: StudentFormMetadata | StudentFormMetadata[]
    }
  ): Promise<StudentForm[]> {
    const fieldsArray = Array.isArray(data.fields) ? data.fields : [data.fields]
    return this.studentOnboardService.addFieldsToStudentRecord({
      userId: data.userId,
      userAliasId: data.userAliasId,
      institutionId: data.institutionId,
      newFields: fieldsArray,
    })
  }

  @Delete('delete-field-from-student-record')
  @ApiOperation({
    summary: 'This api for deleting a single field from a student record',
  })
  @ApiBody({ type: DeleteFieldFromStudentRecordDto })
  @RequireParams(RequireParam.USER_ID, RequireParam.INSTITUTION_ID)
  async deleteFieldFromStudentRecord(
    @Body()
    data: {
      userId: number
      userAliasId?: number
      institutionId: number
      fieldId: string
      invoiceId?: number
    }
  ): Promise<ApiResult<void>> {
    await this.studentOnboardService.deleteFieldFromStudentRecord(data)
    return new ApiResult<void>().success()
  }

  @Get('notification-setting')
  @ApiOperation({
    summary: 'This api for admin use to get notification setting',
  })
  @RequireParams(RequireParam.USER_ID, RequireParam.INSTITUTION_ID)
  async getNotificationSetting(
    @Query()
    data: {
      userId: number
      institutionId: number
    }
  ): Promise<StudentNotificationSettings[]> {
    return this.studentOnboardService.getNotificationSetting(data)
  }

  @Post('notification-setting')
  @ApiOperation({
    summary: 'This api for admin use to set notification setting',
  })
  @RequireParams(RequireParam.USER_ID, RequireParam.INSTITUTION_ID)
  async setNotificationSetting(
    @Body()
    data: {
      userId: number
      institutionId: number
      data: StudentNotificationSettings[]
    }
  ): Promise<StudentNotificationSettings[]> {
    return this.studentOnboardService.setNotificationSetting(data)
  }

  @Get('get-parent-account')
  @ApiOperation({
    summary: 'This api for admin use to get parent account of student',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getParentAccount(@Query('institutionId', ParseIntPipe) institutionId: number) {
    return this.studentOnboardService.getParentAccount(institutionId)
  }

  @Post('set-parent-account')
  @ApiOperation({
    summary: 'This api for admin use to set parent account for student',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  async setParentAccount(@Body() data: SetParentAccountDto) {
    return this.studentOnboardService.setParentAccount(data)
  }

  @Post('add-to-parent-group')
  @ApiOperation({
    summary: 'This api for admin use to add student to parent group',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  async addToParentGroup(@Body() data: AddToParentGroupDto) {
    return this.studentOnboardService.addToParentGroup(data)
  }

  @Post('change-parent-group')
  @ApiOperation({
    summary: 'This api for admin use to change parent group of student',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  async changeParentGroup(@Body() data: ChangeParentGroupDto) {
    return this.studentOnboardService.changeParentGroup(data)
  }

  @Post('remove-from-parent-group')
  @ApiOperation({
    summary: 'This api for admin use to remove student from parent group',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  async removeFromParentGroup(@Body() data: RemoveFromParentGroupDto) {
    return this.studentOnboardService.removeFromParentGroup(data)
  }

  // get details of student onboard by aliasId
  @Get('detail-account-group/:aliasId')
  @ApiOperation({
    summary: 'This api for get details of student onboard by aliasId',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getDetailAccountGroup(
    @Param('aliasId', ParseIntPipe) aliasId: number,
    @Query('institutionId', ParseIntPipe) institutionId: number
  ): Promise<GetStudentDetailResponseDto> {
    return this.studentOnboardService.getDetailAccountGroup(aliasId, institutionId)
  }

  // get tthe same phone number students
  @Get('get-students-by-phone')
  @ApiOperation({
    summary: 'This api for get students by phone number',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getStudentsByPhone(
    @Query('phone') phone: string,
    @Query('institutionId', ParseIntPipe) institutionId: number
  ) {
    return this.studentOnboardService.getStudentsByPhone(phone, institutionId)
  }
}
