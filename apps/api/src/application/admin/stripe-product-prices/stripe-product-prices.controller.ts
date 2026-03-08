import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import Stripe from 'stripe'

import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { StripeProductPricesService } from '@/domain/service/stripe-product-prices.service'
import { Role } from '@/models/enums/'

import { getAllPlanPricesReponse } from './dto/get-all-plan-prices.dto'
import {
  StripeProductPricesPageDto,
  StripeProductPricesPageOptionDto,
} from './dto/stripe-product-prices-pagination.dto'

@ApiTags('Stripe products prices')
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
@Controller('stripe-product-prices')
export class StripeProductPricesController {
  constructor(private readonly stripeProductPricesService: StripeProductPricesService) {}
  @Get()
  @ApiOperation({
    summary: 'This api for institution manager use to get all stripe product prices',
  })
  @ApiOkResponse({
    // schema: getAllPlanSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  findAll(
    @Query() pageOptionsDto: StripeProductPricesPageOptionDto
  ): Promise<StripeProductPricesPageDto> {
    return this.stripeProductPricesService.findAll(pageOptionsDto)
  }

  @Get('all-plan-prices')
  @ApiOperation({
    summary: 'This api for institution manager use to get all stripe plan prices',
  })
  @ApiOkResponse({
    // schema: getAllPlanSchema,
  })
  getAllPlanPrices(): Promise<getAllPlanPricesReponse[]> {
    return this.stripeProductPricesService.getAllPlanPrices()
  }

  @Post(':id/update-price')
  @ApiOperation({
    summary: 'This api for master admin use to change stripe plan prices',
  })
  @ApiOkResponse({
    description: 'Updated Stripe price',
  })
  @Roles(Role.MASTER_ADMIN)
  @UseGuards(RolesGuard)
  async update(@Param('id') id: number, @Query('price') price: number): Promise<Stripe.Price> {
    return this.stripeProductPricesService.updatePlanPrice(id, price)
  }
}
