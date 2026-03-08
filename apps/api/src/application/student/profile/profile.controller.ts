import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { SendPaymentProofReminderDTO } from '@/application/admin/payment-evidence/dto/confirm-state-payment-evidence.dto'
import { resendReminderPaymentEvidenceSchema } from '@/application/admin/payment-evidence/dto/payment-evidence.schema'
import { StudentNotificationSettings } from '@/application/admin/student-onboard/dtos/student-memo.dto'
import { GetTeachingServiceOptDto } from '@/application/admin/student-onboard/dtos/student-onboard.dto'
import { ApiResult } from '@/common/api-formats/api-result'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { Public } from '@/common/decorators/public.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { StudentAuthGuard } from '@/common/guards/student-auth.guard'
import { PaymentEvidenceService } from '@/domain/service/payment-evidence.service'
import { ProfileService } from '@/domain/service/profile.service'
import { StudentOnbService } from '@/domain/service/student-onboard.service'
import { RequireParam } from '@/models/enums'
import { User } from '@/models/user.entity'

import {
  FilterPaymentRecordDTO,
  RequestTimeChangeDTO,
  StudentCheckProfileDTO,
  StudentResendPaymentRecordDTO,
  StudentSendQuestionDTO,
} from './dto/profile.dto'
import { StudentChangeAliasPasswordDto } from './dto/student-change-alias-password.dto'
import { StudentLoginWithAliasPasswordDto } from './dto/student-login-with-alias-password.dto'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: "This is because the token is expired or user haven't login yet",
})
@ApiTags('Student Profile')
@Public()
@Controller('profile')
export class ProfileStudentController {
  constructor(
    private readonly profileService: ProfileService,
    private readonly paymentEvidenceService: PaymentEvidenceService,
    private readonly studentOnboardService: StudentOnbService
  ) {}

  @RequireParams(RequireParam.INSTITUTION_ID)
  @ApiOperation({
    summary: 'This api for user use to get website settings',
  })
  @Get('settings')
  async getSettings(@Query('institutionId') institutionId: number) {
    return this.profileService.getSettings(institutionId)
  }

  @ApiOperation({
    operationId: 'studentProfileCheck',
    summary: 'This api for user use to check student profile',
  })
  @Post('check')
  async checkProfile(@Body() payload: StudentCheckProfileDTO) {
    return this.profileService.checkProfile(payload)
  }

  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(StudentAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    operationId: 'studentProfileNotificationGet',
    summary: 'This api for user use to get student notification settings',
  })
  @Get('notification')
  async getNotification(@CurrentUser() user: User, @Query('institutionId') institutionId: number) {
    return this.profileService.getNotification(user, institutionId)
  }

  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(StudentAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    operationId: 'studentProfileNotificationUpdate',
    summary: 'This api for user use to update student notification settings',
  })
  @Post('notification')
  async updateNotification(
    @CurrentUser() user: User,
    @Query('institutionId') institutionId: number,
    @Body() payload: StudentNotificationSettings[]
  ) {
    return this.profileService.updateNotification(user, institutionId, payload)
  }

  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(StudentAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    operationId: 'studentProfilePaymentRecordsGet',
    summary: 'This api for user use to get student payment records',
  })
  @Post('payment-records')
  async getPaymentRecords(@CurrentUser() user: User, @Body() payload: FilterPaymentRecordDTO) {
    return this.profileService.getPaymentRecords(user, payload)
  }

  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(StudentAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    operationId: 'studentProfilePastLessonsGet',
    summary: 'This api for user use to get student past lessons',
  })
  @Post('past-lessons')
  async getPastLessons(@CurrentUser() user: User, @Body() payload: FilterPaymentRecordDTO) {
    return this.profileService.getUpcomingLessons(user, payload, true)
  }

  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(StudentAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'This api for user use to get student lesson detail',
  })
  @Get('student-lesson/:studentLessonId/detail')
  async getDetailStudentLesson(
    @CurrentUser() user: User,
    @Param('studentLessonId') studentLessonId: number
  ) {
    return this.profileService.getDetailStudentLessons(user, studentLessonId)
  }

  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(StudentAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    operationId: 'studentProfileUpcomingLessonsGet',
    summary: 'This api for user use to get student upcoming lessons',
  })
  @Post('upcoming-lessons')
  async getUpcomingLessons(@CurrentUser() user: User, @Body() payload: FilterPaymentRecordDTO) {
    return this.profileService.getUpcomingLessons(user, payload)
  }

  @UseGuards(StudentAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    operationId: 'studentProfilePaymentRecordsResend',
    summary: 'This api for user use to resend payment record',
  })
  @Post('payment-records/resend')
  async resendPaymentRecord(@Body() payload: StudentResendPaymentRecordDTO) {
    return this.profileService.resendPaymentRecord(payload)
  }

  @UseGuards(StudentAuthGuard)
  @Post('payment-records/send-reminder')
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @ApiOperation({
    summary:
      'This api for student use to resend payment reminder, resend qrCode and resend payment successfully reminder',
  })
  @ApiOkResponse({ schema: resendReminderPaymentEvidenceSchema })
  async sendReminder(@CurrentUser() user: User, @Body() payload: SendPaymentProofReminderDTO) {
    await this.paymentEvidenceService.sendPaymentProofReminder(payload, user)
    return { message: 'Reminder has been sent successfully.' }
  }

  @UseGuards(StudentAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    operationId: 'studentProfileSendQuestion',
    summary: 'This api for user use to send a question',
  })
  @Post('send-question')
  async sendQuestion(@Body() payload: StudentSendQuestionDTO) {
    return this.profileService.sendQuestion(payload)
  }

  @UseGuards(StudentAuthGuard)
  @Get('teaching-service-opt')
  @ApiOperation({
    summary: 'This api for get teaching service option for add.',
  })
  @ApiOkResponse({ type: ApiResult })
  @ApiBadRequestResponse({
    description: 'This response may be when user teaching service already exist in our system',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getTeachingServiceOpt(@Query() params: GetTeachingServiceOptDto) {
    const result = await this.studentOnboardService.getTeachingServiceOpt(params)

    return new ApiResult().success(result)
  }

  @UseGuards(StudentAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    operationId: 'studentProfileRequestTimeChange',
    summary: 'This api for user use to request time change',
  })
  @Post('request-time-change')
  async requestTimeChange(@CurrentUser() user: User, @Body() payload: RequestTimeChangeDTO) {
    return this.profileService.requestTimeChange(user, payload)
  }

  @Post('login-with-alias-password')
  @ApiOperation({
    operationId: 'studentProfileLoginWithAliasPassword',
    summary: 'This api for student to login using phone number and alias password',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when phone number or alias password is invalid',
  })
  @ApiUnauthorizedResponse({
    description: 'This response when authentication fails',
  })
  async loginWithAliasPassword(@Body() payload: StudentLoginWithAliasPasswordDto) {
    const result = await this.profileService.loginWithAliasPassword(payload)
    return new ApiResult().success(result)
  }

  @Post('change-alias-password')
  @UseGuards(StudentAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    operationId: 'studentProfileChangeAliasPassword',
    summary:
      "This api for student to change their own alias password or their children's alias passwords",
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description:
      'This response may be when old password is incorrect, new password is invalid, or user alias not found',
  })
  @ApiUnauthorizedResponse({
    description:
      'This response when authentication fails or user tries to change password for unauthorized alias',
  })
  async changeAliasPassword(
    @CurrentUser() user: User,
    @Body() payload: StudentChangeAliasPasswordDto
  ) {
    const result = await this.profileService.changeAliasPassword(user, payload)
    return new ApiResult().success(result)
  }
}
