import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
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
import { CourseActivitiesOrderService } from '@/domain/service/course-activities-order.service'
import { Role } from '@/models/enums/'

import { CourseActivitiesOrderDetailReponse } from './dto/course-activities-order.dto'
import {
  CourseActivitiesOrderPageDto,
  CourseActivitiesOrderPageOptionDto,
} from './dto/course-activities-order-pagination.dto'
import { UpgradeCourseActivitiesOrderDto } from './dto/update-course-activities-order.dto'

@ApiTags('Course Activities Order')
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
@Controller('course-activities-order')
export class CourseActivitiesOrderController {
  constructor(private readonly courseActivitiesOrderService: CourseActivitiesOrderService) {}
  @Get()
  @ApiOperation({
    summary: 'This api for institution manager use to get all orders',
  })
  @ApiOkResponse({
    // schema: getAllPlanSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  findAll(
    @Query() pageOptionsDto: CourseActivitiesOrderPageOptionDto
  ): Promise<CourseActivitiesOrderPageDto> {
    return this.courseActivitiesOrderService.findAll(pageOptionsDto)
  }

  @Post('update')
  @ApiOperation({
    summary: 'This api for institution manager use to update course activities order',
  })
  @ApiOkResponse({
    // schema: getAllPlanSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  updateOrder(
    @Body() upgradeCourseActivitiesOrderDt: UpgradeCourseActivitiesOrderDto
  ): Promise<CourseActivitiesOrderDetailReponse> {
    return this.courseActivitiesOrderService.updateOrder(upgradeCourseActivitiesOrderDt)
  }
}
