import { Controller, Get, Query } from '@nestjs/common'
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import {
  StudentCalculateCouponPriceDto,
  StudentValidCouponResponseDto,
} from '@/application/student/promotions/dto/coupons.dto'
import { Public } from '@/common/decorators/public.decorator'
import { CouponsService } from '@/domain/service/coupons.service'

import { StudentEnrolTokenDto, StudentValidCouponDto } from './dto/coupons.dto'

@ApiTags('Coupons')
@Controller('coupons')
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
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiResponse({
  description: 'This response when system error.',
  status: 500,
})
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get('calculate-price')
  @Public()
  @ApiOperation({
    operationId: 'studentPromotionsCouponsCalculatePrice',
    summary: 'This api use to calculate coupon price.',
  })
  checkCoupon(@Query() dto: StudentCalculateCouponPriceDto): Promise<any> {
    return this.couponsService.calculateCouponPrice(dto)
  }

  @Get('validate')
  @Public()
  @ApiOperation({
    operationId: 'studentPromotionsCouponsValidate',
    summary: 'This api use to check whether coupon is valid.',
  })
  isCouponValid(@Query() dto: StudentValidCouponDto): Promise<StudentValidCouponResponseDto> {
    return this.couponsService.isCouponValid(dto)
  }

  @Get('available-coupon')
  @Public()
  @ApiOperation({
    operationId: 'studentPromotionsCouponsAvailableCoupon',
    summary: 'This api use to get student available coupons.',
  })
  getAvailableCoupon(@Query() dto: StudentEnrolTokenDto): Promise<any> {
    return this.couponsService.getAvailableStudentCoupons(dto)
  }
}
