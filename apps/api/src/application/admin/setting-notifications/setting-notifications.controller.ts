import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
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

import { CurrentInstitution } from '@/common/decorators/current-institution.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { SettingNotificationsService } from '@/domain/service/setting-notifications.service'
import { RequireParam, Role } from '@/models/enums/'
import { Institution } from '@/models/institutions.entity'
import { successSchema } from '@/models/schemas/success.schema'
import { SettingNotifications } from '@/models/setting-notifications.entity'

import {
  CreateSettingNotificationsDTO,
  SettingNotificationsSchema,
  UpdateSettingNotificationsDTO,
} from './setting-notifications.dto'

@ApiTags('Setting Notifications')
@Controller('setting-notifications')
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
export class SettingNotificationsController {
  constructor(private readonly settingNotificationsService: SettingNotificationsService) {}

  @Post('create')
  @ApiOperation({
    summary: 'This api for master admin, site manager, institution manager to create social link.',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  create(
    @Query('institutionId') id: number,
    @Body() createSettingNotificationsDTO: CreateSettingNotificationsDTO,
    @CurrentInstitution() institution: Institution
  ) {
    createSettingNotificationsDTO.siteId = institution.siteId
    createSettingNotificationsDTO.institutionId = id
    return this.settingNotificationsService.create(createSettingNotificationsDTO)
  }

  @Get('detail')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for master admin and site manager use to get a site by id',
  })
  @ApiOkResponse({
    schema: SettingNotificationsSchema,
  })
  findOne(@Query('institutionId') id: string): Promise<SettingNotifications> {
    return this.settingNotificationsService.findOneByInstitution(+id)
  }

  @Patch('update')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SETTING_NOTIFICATIONS_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for master admin, site manager, institution manager to update social link.',
  })
  update(
    @Query('settingNotificationsId') id: number,
    @Body() updateSettingNotificationsDTO: UpdateSettingNotificationsDTO
  ) {
    return this.settingNotificationsService.update(id, updateSettingNotificationsDTO)
  }

  @Delete('delete')
  @ApiOperation({
    summary: 'This api allows users to delete setting webpage.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SETTING_NOTIFICATIONS_ID)
  @UseGuards(RequireParamsGuard)
  remove(@Query('settingNotificationsId') id: number) {
    return this.settingNotificationsService.remove(+id)
  }
}
