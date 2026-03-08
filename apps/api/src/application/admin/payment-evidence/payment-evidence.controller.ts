import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { PaymentEvidenceService } from '@/domain/service/payment-evidence.service'
import { RequireParam, Role } from '@/models/enums/'
import { User } from '@/models/user.entity'

import {
  ConfirmMultiplePaymentEvidenceResponse,
  DeleteMultiplePaymentEvidenceResponse,
  RejectMultiplePaymentEvidenceResponse,
  ResetMultiplePaymentEvidenceResponse,
  SendPaymentProofReminderDTO,
} from './dto/confirm-state-payment-evidence.dto'
import { PaymentEvidenceDto } from './dto/payment-evidence.dto'
import {
  confirmMultiplePaymentEvidenceSchema,
  deletePaymentEvidenceSchema,
  getAllPaymentEvidencSchema,
  rejectMultiplePaymentEvidenceSchema,
  resendReminderPaymentEvidenceSchema,
  resetMultiplePaymentEvidenceSchema,
} from './dto/payment-evidence.schema'
import {
  PaymentEvidencePageDto,
  PaymentEvidencePageOptionDto,
} from './dto/payment-evidence-pagination.dto'

@ApiTags('Admin Payment Evidence')
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
@Controller('payment-evidence')
export class PaymentEvidenceController {
  constructor(private readonly paymentEvidenceService: PaymentEvidenceService) {}

  @ApiExtraModels(PaymentEvidenceDto)
  @Get()
  @UseGuards(RequireParamsGuard, RolesGuard)
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @ApiOperation({
    summary: 'This api for admin use to get list payment evidence',
  })
  @ApiOkResponse({
    schema: getAllPaymentEvidencSchema,
  })
  async findAll(
    @Query() pageOptionsDto: PaymentEvidencePageOptionDto
  ): Promise<PaymentEvidencePageDto> {
    return await this.paymentEvidenceService.findAll(pageOptionsDto)
  }

  @Post('confirm')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for admin use to confirm multiple payment evidences',
  })
  @ApiOkResponse({
    schema: confirmMultiplePaymentEvidenceSchema,
  })
  async confirmMultiplePayments(
    @Body() confirmMultiplePaymentEvidenceDto: ConfirmMultiplePaymentEvidenceResponse,
    @CurrentUser() user: User
  ): Promise<PaymentEvidenceDto[]> {
    return await this.paymentEvidenceService.confirmMultiplePayments(
      confirmMultiplePaymentEvidenceDto,
      user
    )
  }

  @Post('reject')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for admin use to reject multiple payment evidences',
  })
  @ApiOkResponse({
    schema: rejectMultiplePaymentEvidenceSchema,
  })
  async rejectPayment(
    @Body() rejectMultiplePaymentEvidenceDto: RejectMultiplePaymentEvidenceResponse,
    @CurrentUser() user: User
  ): Promise<PaymentEvidenceDto[]> {
    return await this.paymentEvidenceService.rejectMultiplePayments(
      rejectMultiplePaymentEvidenceDto,
      user
    )
  }

  @Post('reset')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for admin use to reset multiple payment evidence statuses',
  })
  @ApiOkResponse({
    schema: resetMultiplePaymentEvidenceSchema,
  })
  async resetMultiplePayments(
    @Body() resetMultiplePaymentEvidenceDto: ResetMultiplePaymentEvidenceResponse,
    @CurrentUser() user: User
  ): Promise<PaymentEvidenceDto[]> {
    return await this.paymentEvidenceService.resetMultiplePayments(
      resetMultiplePaymentEvidenceDto,
      user
    )
  }

  @Post('delete')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for admin use to reset multiple payment evidence statuses',
  })
  @ApiOkResponse({
    schema: deletePaymentEvidenceSchema,
  })
  async deletePaymentEvidence(
    @CurrentUser() user: User,
    @Body() deletePaymentEvidence: DeleteMultiplePaymentEvidenceResponse
  ) {
    await this.paymentEvidenceService.deletePaymentEvidence(deletePaymentEvidence, user)
  }

  @Post('send-reminder')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary:
      'This api for admin use to resend payment reminder, resend qrCode and resend payment successfully reminder',
  })
  @ApiOkResponse({
    schema: resendReminderPaymentEvidenceSchema,
  })
  async sendReminder(
    @CurrentUser() user: User,
    @Body() resendPaymentProofReminderDto: SendPaymentProofReminderDTO
  ) {
    await this.paymentEvidenceService.sendPaymentProofReminder(resendPaymentProofReminderDto, user)
  }
}
