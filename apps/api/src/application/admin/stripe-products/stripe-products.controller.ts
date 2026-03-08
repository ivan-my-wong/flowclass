import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { StripeProductPricesService } from '@/domain/service/stripe-product-prices.service'
import { Role } from '@/models/enums/'

import { StripeProductPricesPageDto } from '../stripe-product-prices/dto/stripe-product-prices-pagination.dto'

import { StripeProductsPageOptionDto } from './dto/stripe-products-pagination.dto'

@ApiTags('Stripe products')
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
@Controller('stripe-products')
export class StripeProductsController {
  constructor(private readonly stripeProductPricesService: StripeProductPricesService) {}
  @Get()
  @ApiOperation({
    summary: 'This api for institution manager use to get all stripe product',
  })
  @ApiOkResponse({
    // schema: getAllPlanSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  findAll(
    @Query() pageOptionsDto: StripeProductsPageOptionDto
  ): Promise<StripeProductPricesPageDto> {
    return this.stripeProductPricesService.findAll(pageOptionsDto)
  }
}
