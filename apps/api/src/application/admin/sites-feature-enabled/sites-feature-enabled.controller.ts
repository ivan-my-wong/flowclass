import {
  BadRequestException,
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { HttpStatusCode } from 'axios'

import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { SitesFeatureEnabledService } from '@/domain/service/sites-feature-enabled.service'
import { Role } from '@/models/enums'
import { SitesFeatureEnabled } from '@/models/sites-feature-enabled.entity'

import { SiteFeatureEnabledDto } from './dto/sites-feature-enabled.dto'

@Controller('sites-feature-enabled')
@ApiTags('Site Features Enabled')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@UseInterceptors(ClassSerializerInterceptor)
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalid.',
})
@ApiResponse({
  description: 'This response when system error.',
  status: HttpStatusCode.InternalServerError,
})
export class SitesFeatureEnabledController {
  constructor(private readonly sitesFeatureEnabledService: SitesFeatureEnabledService) {}

  private isOpenSourceMode(): boolean {
    return process.env.OPEN_SOURCE_DISABLE_SUBSCRIPTIONS !== 'false'
  }

  @Get()
  @ApiResponse({
    status: HttpStatusCode.Ok,
    description: 'List of all sites with enabled features.',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiOkResponse({
    description: 'List of all sites with enabled features.',
    type: SitesFeatureEnabled,
    isArray: true,
  })
  async getAllSitesFeatureEnabled(): Promise<SitesFeatureEnabled[]> {
    if (this.isOpenSourceMode()) {
      return []
    }

    return this.sitesFeatureEnabledService.getAll()
  }

  @Post('/mutate')
  @Roles(Role.MASTER_ADMIN)
  @UseGuards(RolesGuard)
  @HttpCode(HttpStatusCode.Created)
  @ApiBody({ type: SiteFeatureEnabledDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiOperation({
    summary: 'Create or update site feature configuration.',
  })
  @ApiOkResponse({
    description: 'Site feature configuration created or updated successfully.',
    type: SitesFeatureEnabled,
  })
  async updateSiteFeatures(@Body() body: SiteFeatureEnabledDto): Promise<SitesFeatureEnabled> {
    if (this.isOpenSourceMode()) {
      throw new BadRequestException('Site feature gating is disabled in open-source mode')
    }

    return this.sitesFeatureEnabledService.createOrUpdate(body)
  }
}
