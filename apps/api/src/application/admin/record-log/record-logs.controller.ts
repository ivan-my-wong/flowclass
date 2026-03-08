import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { ApiResult } from '@/common/api-formats/api-result'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { NotificationRecordService } from '@/domain/service/notification-log.service'
import { RecordLogType, RequireParam, Role } from '@/models/enums/'

import { RecordLogService } from '../../../domain/service/record-log.service'

import {
  GetNotificationLogDto,
  GetNotificationLogResponseDto,
  GetNotificationLogSelectFieldsDto,
  GetRecordLogByContactDto,
  RecordLogListDto,
  StudentActivitiesDto,
} from './dto/get-list-record-log.dto'

@Controller('record-logs')
@ApiTags('Record Logs')
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
export class RecordLogController {
  constructor(
    private readonly recordLogService: RecordLogService,
    private readonly notificationRecordService: NotificationRecordService
  ) {}

  @Get('coupon-history')
  @ApiOperation({
    summary: "This api for get history of coupon's usage",
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getList(@Query() pageOptionsDto: RecordLogListDto) {
    const { institutionId, couponCode } = pageOptionsDto

    const result = await this.recordLogService.getCouponHistory({
      detail: { couponCode },
      types: [
        RecordLogType.CREATE_COUPON,
        RecordLogType.USAGE_COUPON,
        RecordLogType.INACTIVE_COUPON,
      ],
      institutionId,
    })

    return new ApiResult().success(result)
  }

  @Get('student-activity')
  @ApiOperation({
    summary: 'This api for get student activity',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getStudentActivity(@Query() params: StudentActivitiesDto) {
    const result = await this.recordLogService.getStudentActivities(params)

    return new ApiResult().success(result)
  }

  @Post('notification-log')
  @ApiOperation({
    summary: 'This api for get notification log',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  async getNotificationLog(
    @Query() params: GetNotificationLogDto,
    @Body() body: GetNotificationLogSelectFieldsDto
  ): Promise<GetNotificationLogResponseDto[]> {
    return await this.notificationRecordService.getNotificationLogBySiteSchool(params, body)
  }

  @Get('notification-log/contact')
  @ApiOperation({
    summary: 'Get record logs by email or phone and institution',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getNotificationLogByContact(@Query() params: GetRecordLogByContactDto) {
    const result = await this.notificationRecordService.getNotificationLogByContact(params)
    return new ApiResult().success(result)
  }
}
