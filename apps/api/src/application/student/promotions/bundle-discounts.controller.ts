import { Controller, Get, Param } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { Public } from '@/common/decorators/public.decorator'
import { BundleDiscountsService } from '@/domain/service/bundle-discounts.service'

@ApiTags('Bundle Discounts')
@Controller('bundle-discounts')
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
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@Public()
export class BundleDiscountsController {
  constructor(private readonly bundleDiscountsService: BundleDiscountsService) {}

  @Get('course/:id')
  @ApiOperation({
    operationId: 'studentPromotionsBundleDiscountsGet',
    summary: 'This api for coupon use to list all bundle discounts.',
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  findByCourseId(@Param('id') id: number) {
    return this.bundleDiscountsService.findByCourseId(id)
  }
}
