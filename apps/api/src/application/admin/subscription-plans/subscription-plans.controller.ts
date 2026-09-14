// eslint-disable-next-line simple-import-sort/imports
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Role } from '@/models/enums/'
import { SubscriptionPlan } from '@/models/subscription-plans.entity'

import { GetSubscriptionPlansDto } from './dto/subscription-plans-pagination.dto'
import { PlanDetailResponse } from './dto/subscription-plans.dto'
import { getAllPlanSchema, getAllPresetPlanSchema } from './dto/subscription-plans.schema'

import { Public } from '@/common/decorators/public.decorator'
import { SubscriptionPresetPlansService } from '@/domain/service/subscription-service/preset-plans.service'
import { PlansService } from '@/domain/service/subscription-service/subscription-plans.service'
import { SubscriptionPresetPlanEntity } from '@/models/subscription-preset-plans.entity'
import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
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

@ApiTags('Plans')
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
@Controller('subscription-plans')
export class PlansController {
  constructor(
    private readonly plansService: PlansService,
    private readonly subscriptionPresetPlansService: SubscriptionPresetPlansService
  ) {}
  @ApiExtraModels(PlanDetailResponse)
  @Get()
  @ApiOperation({
    summary:
      'This api for getting all subscription plans because it is public and can be accessed by anyone',
  })
  @ApiOkResponse({
    type: [PlanDetailResponse],
  })
  @Public()
  findAll(@Query() params: GetSubscriptionPlansDto): Promise<SubscriptionPlan[]> {
    return this.plansService.findAll(params)
  }

  @Post(':id')
  @ApiOperation({
    summary: 'This api for master admin use to change subscription plan prices',
  })
  @ApiOkResponse({
    schema: getAllPlanSchema,
  })
  @Roles(Role.MASTER_ADMIN)
  @UseGuards(RolesGuard)
  async update(
    @Param('id') id: number,
    @Body() data: Partial<SubscriptionPlan>
  ): Promise<SubscriptionPlan> {
    return this.plansService.updateSubscriptionPlanBenefits(id, data)
  }

  @Get('preset-plans')
  @ApiOperation({
    summary: 'This api use to get all subscription preset plans',
  })
  @ApiOkResponse({
    schema: getAllPresetPlanSchema,
  })
  async getAllPresetPlans(): Promise<SubscriptionPresetPlanEntity[]> {
    return this.subscriptionPresetPlansService.getPresetPlans()
  }
}
