// eslint-disable-next-line simple-import-sort/imports
import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { CurrentInstitution } from '@/common/decorators/current-institution.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { PromotionsService } from '@/domain/service/promotions.service'
import { Coupon } from '@/models/coupons.entity'

import { RequireParam, Role } from '@/models/enums'
import { Institution } from '@/models/institutions.entity'

import { CheckPossiblePromotionsDto } from './dto/promotion-detail.dto'
import { promotionSchema } from './dto/promotion.schema'

@ApiTags('Promotions')
@Controller('promotions')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@UseInterceptors(ClassSerializerInterceptor)
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiResponse({
  description: 'This response when system error.',
  status: 500,
})
export class PromotionsController {
  constructor(private readonly promotionService: PromotionsService) {}

  @Get()
  @ApiOperation({
    summary: 'This api for promotion use to list all promotions of flowclass.',
  })
  @ApiOkResponse({
    schema: promotionSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  countByType(@Query('institutionId', ParseIntPipe) id: number): Promise<any> {
    return this.promotionService.countByType(id)
  }

  @Post('possible-promotions')
  @ApiOperation({
    summary: 'List all applicable promotions for a user in a class.',
  })
  @ApiOkResponse({
    type: [Coupon],
    description: 'Returns possible promotions for the given user and class.',
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  checkPossiblePromotions(
    @CurrentInstitution() institution: Institution,
    @Body() checkPromotionDto: CheckPossiblePromotionsDto
  ): Promise<Coupon[]> {
    return this.promotionService.checkPossiblePromotions(institution, checkPromotionDto)
  }
}
