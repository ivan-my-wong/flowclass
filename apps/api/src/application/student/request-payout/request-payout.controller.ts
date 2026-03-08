import { Controller, Get, Query } from '@nestjs/common'
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { StudentGetPayoutPreferenceDto } from '@/application/student/request-payout/dto/receive-Payout-Preference.dto'
import { Public } from '@/common/decorators/public.decorator'
import { RequestPayoutService } from '@/domain/service/request-payout.service'

import { GetPayoutPreferenceWithPageOptionDto } from '../../admin/request-payout/dto/receive-payout-preference-paginate.dto'

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
@Controller('payout-methods')
export class RequestPayoutController {
  constructor(private readonly requestPayoutService: RequestPayoutService) {}

  @Get()
  @Public()
  @ApiOperation({
    operationId: 'studentPayoutMethodsGet',
    summary: 'This api for institution manager use to get receive payout preference.',
  })
  async getPayoutMethodPreference(
    @Query() getPayoutPreferenceDto: GetPayoutPreferenceWithPageOptionDto
  ): Promise<StudentGetPayoutPreferenceDto[]> {
    const res = await this.requestPayoutService.getPayoutMethodPreference(getPayoutPreferenceDto)

    return res.content
  }
}
