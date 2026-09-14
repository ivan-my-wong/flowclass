import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { GaMeasurementService } from '@/domain/external/gaMeasurement.service'
import { GoogleAnalyticsService } from '@/domain/external/google-analytics.service'
import { GaMeasurementEventName, RequireParam, Role } from '@/models/enums/'

import { GoogleAnalyticsRequestParams } from './dto/google-analytics.dto'

@ApiTags('Google Analytics')
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
@Controller('google-analytics')
export class GoogleAnalyticsController {
  constructor(
    private readonly googleAnalyticsService: GoogleAnalyticsService,
    private readonly gaMeasurementService: GaMeasurementService
  ) {}

  @Get()
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for admin use to get google analytics report.',
  })
  async getGoogleAnalyticsReport(@Query() query: GoogleAnalyticsRequestParams): Promise<any> {
    return await this.googleAnalyticsService.getGoogleAnalyticsReport(query)
  }

  @Post('test')
  @ApiOperation({
    summary: 'This api for admin use to test sending data to Google Analytics',
  })
  async testGoogleAnalyticsEvent(): Promise<any> {
    // return await this.cronService.handleRemindBeforeLessonQueue();
    return await this.gaMeasurementService.sendToWebGa({
      userId: 1,
      clientId: 'decodedToken.uid',
      events: [
        {
          name: GaMeasurementEventName.SIGN_UP,
          params: {
            login_method: 'decodedToken.firebase?.sign_in_provider',
            email: 'decodedToken.email',
          },
        },
      ],
      userProperties: {
        email: 'decodedToken.email',
        firebaseId: 'user.firebaseId',
      },
    })
  }
}
