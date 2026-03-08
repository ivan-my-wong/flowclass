import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { ApiResult } from '@/common/api-formats/api-result'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { PageMetaDto } from '@/common/pagination/page-meta.dto'
import { RescheduleApprovalService } from '@/domain/service/reschedule-approval.service'
import { RequireParam, Role } from '@/models/enums/'
import { RequestTimeChange } from '@/models/request-time-change.entity'

import {
  ChangeRescheduleApprovalStatusDto,
  RescheduleApprovalOptionDto,
} from './dtos/reschedule-approval.dto'
import { RescheduleSettingsDto } from './dtos/reschedule-settings.dto'

@Controller('reschedule-approval')
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
export class RescheduleApprovalController {
  constructor(private readonly rescheduleApprovalService: RescheduleApprovalService) {}

  @Post('list')
  @ApiExtraModels(RequestTimeChange, PageMetaDto)
  @ApiOperation({
    summary: 'This api for get all reschedule approval',
  })
  @ApiOkResponse({ type: ApiResult })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getAll(@Body() payload: RescheduleApprovalOptionDto) {
    return await this.rescheduleApprovalService.getAll(payload)
  }

  @Put('status')
  @ApiExtraModels(RequestTimeChange, PageMetaDto)
  @ApiOperation({
    summary: 'This api for change status reschedule approval',
  })
  @ApiOkResponse({ type: ApiResult })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async changeStatus(
    @Body() payload: ChangeRescheduleApprovalStatusDto
  ): Promise<RequestTimeChange[]> {
    return await this.rescheduleApprovalService.changeStatus(payload)
  }

  @ApiOperation({
    summary: 'This api for user use to get reschedule approval by id.',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @Get(':id')
  async validateTimeslot(@Param('id') id: number) {
    return this.rescheduleApprovalService.getById(+id)
  }

  @ApiOperation({
    summary: 'This api for get reschedule approval settings.',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @Get('settings/:institutionId')
  async getSettings(@Param('institutionId', ParseIntPipe) institutionId: number) {
    return this.rescheduleApprovalService.getSettings(institutionId)
  }

  @ApiOperation({
    summary: 'This api for update reschedule approval settings.',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @Put('settings/:institutionId')
  async updateSettings(
    @Param('institutionId', ParseIntPipe) institutionId: number,
    @Body() payload: RescheduleSettingsDto
  ) {
    return this.rescheduleApprovalService.updateSettings(institutionId, payload)
  }
}
