import { Body, Controller, Delete, Get, HttpStatus, Post, Query, Res, UseGuards } from '@nestjs/common'
import { Response } from 'express'
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { RequestPayoutService } from '@/domain/service/request-payout.service'
import { RequireParam, Role } from '@/models/enums/'

import { DeletePayoutPreferenceDto } from './dto/delete-payout-preference.dto'
import { PayoutPreferenceDto } from './dto/receive-Payout-Preference.dto'
import {
  GetPayoutPreferenceWithPageDto,
  GetPayoutPreferenceWithPageOptionDto,
} from './dto/receive-payout-preference-paginate.dto'

@ApiTags('Payout Methods')
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
@Controller('payout-methods')
export class RequestPayoutController {
  constructor(private readonly requestPayoutService: RequestPayoutService) {}

  @Post()
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for institution manager use to set receive payout preference.',
  })
  @ApiOkResponse({
    description: 'Payout reference is edit/update',
  })
  @ApiCreatedResponse({
    description: 'Payout reference is created',
  })
  async setPayoutMethodPreference(
    @Body() receivePayoutPreferenceDto: PayoutPreferenceDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<{ item: PayoutPreferenceDto; status: HttpStatus }> {
    const result = await this.requestPayoutService.setPayoutMethodPreference(
      receivePayoutPreferenceDto
    )
    // POST always returns 201 in Nest by default; reflect 200 on update so the
    // frontend can distinguish create-vs-update in toast/UX layers.
    res.status(result.status)
    return result
  }

  @Get()
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for institution manager use to get receive payout preference.',
  })
  async getPayoutMethodPreference(
    @Query() getPayoutPreferenceDto: GetPayoutPreferenceWithPageOptionDto
  ): Promise<GetPayoutPreferenceWithPageDto> {
    return await this.requestPayoutService.getPayoutMethodPreference(getPayoutPreferenceDto)
  }

  @Delete('delete')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for institution manager use to delete payout preference.',
  })
  async deletePayoutMethodPreference(
    @Body() deletePayoutPreferenceDto: DeletePayoutPreferenceDto
  ): Promise<PayoutPreferenceDto> {
    return await this.requestPayoutService.delPayoutMethodPreference(deletePayoutPreferenceDto)
  }
}
