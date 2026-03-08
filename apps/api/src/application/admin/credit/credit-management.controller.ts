import { Body, Controller, Get, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { RequireParams } from '@/common/decorators/require-param.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { CreditManagementService } from '@/domain/service/credit-management.service'
import { CreditSettings } from '@/models/credit-settings.entity'
import { CreditTransactions, CreditTransactionType } from '@/models/credit-transactions.entity'
import { RequireParam } from '@/models/enums'

import { AddOrDeductCreditDTO } from './dto/add-or-deduct-credit.dto'
import { UpdateCreditSettingsDTO } from './dto/update-credit-settings.dto'

@ApiTags('Credit Management')
@ApiUnauthorizedResponse({
  description: 'This response when user not authenticate.',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiBearerAuth('access-token')
@Controller('credit-management')
export class CreditManagementController {
  constructor(private readonly creditManagementService: CreditManagementService) {}

  @ApiOperation({
    summary: 'This endpoint is used to get user credit balance.',
  })
  @UseGuards(RequireParamsGuard)
  @Get('balance')
  async getBalance(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Query('userAliasId', ParseIntPipe) userAliasId: number
  ): Promise<{ balance: number }> {
    const response = await this.creditManagementService.getBalance(institutionId, userAliasId)
    return response
  }

  // history
  @ApiOperation({
    summary: 'This endpoint is used to get credit transactions history.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.USER_ALIAS_ID)
  @UseGuards(RequireParamsGuard)
  @Get('history')
  async getHistory(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Query('userAliasId', ParseIntPipe) userAliasId: number,
    @Query('transactionType') transactionType: CreditTransactionType,
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number
  ): Promise<{ items: CreditTransactions[]; total: number }> {
    const response = await this.creditManagementService.getHistory(
      institutionId,
      userAliasId,
      transactionType,
      page ?? 1,
      limit ?? 10
    )
    return response
  }

  // add
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'This endpoint is used to add credit transactions.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Post('add')
  async addCredit(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Body() payload: AddOrDeductCreditDTO
  ): Promise<CreditTransactions> {
    const response = await this.creditManagementService.addCredit(institutionId, payload)
    return response
  }

  // deduct
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'This endpoint is used to deduct credit transactions.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Post('deduct')
  async deductCredit(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Body() payload: AddOrDeductCreditDTO
  ): Promise<CreditTransactions> {
    const response = await this.creditManagementService.deductCredit(institutionId, payload)
    return response
  }

  // get settings
  @ApiOperation({
    summary: 'This endpoint is used to get credit settings for an institution.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('settings')
  async getSettings(
    @Query('institutionId', ParseIntPipe) institutionId: number
  ): Promise<CreditSettings> {
    const response = await this.creditManagementService.getSettings(institutionId)
    return response
  }

  // update settings
  @UseGuards(AdminAuthGuard)
  @ApiOperation({
    summary: 'This endpoint is used to update credit settings for an institution.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Patch('settings')
  async updateSettings(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Body() settings: UpdateCreditSettingsDTO
  ): Promise<CreditSettings> {
    const response = await this.creditManagementService.updateSettings(institutionId, settings)
    return response
  }

  // check if institution has credit records
  @ApiOperation({
    summary: 'This endpoint is used to check if an institution has any credit management records.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('has-records')
  async hasCreditRecords(
    @Query('institutionId', ParseIntPipe) institutionId: number
  ): Promise<{ hasRecords: boolean }> {
    const response = await this.creditManagementService.hasCreditRecords(institutionId)
    return response
  }
}
