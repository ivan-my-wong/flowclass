import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
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

import { ApiResult } from '@/common/api-formats/api-result'
import { CurrentInstitution } from '@/common/decorators/current-institution.decorator'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CouponsService } from '@/domain/service/coupons.service'
import { RequireParam, Role } from '@/models/enums/'
import { Institution } from '@/models/institutions.entity'

import { CreateCouponDTO, UpdateCouponDTO, UpdateStatusCouponDTO } from './dto/coupon.dto'
import { couponSchema } from './dto/coupon.schema'
import { CouponDetailDto, CouponDetailDtoV2 } from './dto/coupon-detail.dto'
import { CouponPageOptionDto } from './dto/coupon-pagination.dto'

@ApiTags('Coupons')
@Controller('coupons')
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
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Get()
  @ApiOperation({
    summary: 'This api for coupon use to list all promotions with type coupon of flowclass.',
  })
  @ApiOkResponse({
    schema: couponSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  findAll(@Query() pageOptionsDto: CouponPageOptionDto) {
    return this.couponsService.findAll(pageOptionsDto)
  }

  @Post('create')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api use to create coupon.',
    description: 'When you want to set unlimited coupon please set quito = -1',
  })
  create(
    @Body() createCouponDto: CreateCouponDTO,
    @CurrentInstitution() institution: Institution,
    @CurrentUser() user
  ): Promise<CouponDetailDto> {
    createCouponDto.siteId = institution.siteId

    return this.couponsService.create(createCouponDto, user)
  }

  @Get('detail')
  @ApiOperation({
    summary: 'This api for coupon use to get a promotion with type coupon of flowclass.',
  })
  @ApiOkResponse({
    schema: couponSchema,
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
  @RequireParams(RequireParam.COUPON_ID)
  @UseGuards(RequireParamsGuard)
  findOne(@Query('couponId') id: string): Promise<CouponDetailDtoV2> {
    return this.couponsService.findOne(+id)
  }

  @Patch('update')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COUPON_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api use to update coupon.',
  })
  @ApiOkResponse({
    schema: couponSchema,
  })
  update(
    @Query('couponId') id: string,
    @Body() updateCouponDto: UpdateCouponDTO
  ): Promise<CouponDetailDto> {
    return this.couponsService.update(+id, updateCouponDto)
  }

  @Delete('delete')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COUPON_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api use to delete coupon.',
  })
  @ApiOkResponse({
    schema: couponSchema,
  })
  remove(@Query('couponId') id: string, @CurrentUser() user): Promise<CouponDetailDto> {
    return this.couponsService.remove(+id, user)
  }

  @Patch(':couponId/status')
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api use to update status coupon.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @RequireParams(RequireParam.COUPON_ID)
  @UseGuards(RequireParamsGuard)
  updateStatus(
    @Param('couponId') id: number,
    @Body() body: UpdateStatusCouponDTO,
    @CurrentUser() user
  ): Promise<boolean> {
    return this.couponsService.updateStatus(id, body, user)
  }
}
