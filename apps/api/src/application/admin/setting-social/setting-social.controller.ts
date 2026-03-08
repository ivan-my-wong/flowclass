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
import { RequireParam, Role } from '@/models/enums/'
import { Institution } from '@/models/institutions.entity'
import { successSchema } from '@/models/schemas/success.schema'
import { SettingSocial } from '@/models/setting-social.entity'

import { SettingSocialService } from '../../../domain/service/setting-social.service'

import { CreateSettingSocialDTO, UpdateSettingSocialDTO } from './dto/setting-social'
import { getSettingSocialSchema } from './dto/setting-social.schema'

@ApiTags('Setting Social')
@Controller('setting-social')
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
export class SettingSocialController {
  constructor(private readonly settingSocialService: SettingSocialService) {}

  @Post('create')
  @ApiOperation({
    summary: 'This api for master admin, site manager, institution manager to create social link.',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  create(
    @Body() createSettingSocialDTO: CreateSettingSocialDTO,
    @CurrentInstitution() institution: Institution
  ) {
    createSettingSocialDTO.siteId = institution.siteId
    return this.settingSocialService.create(createSettingSocialDTO)
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
    schema: getSettingSocialSchema,
  })
  findOne(@Query('institutionId') id: string): Promise<SettingSocial> {
    return this.settingSocialService.findOneByInstitution(+id)
  }

  @Patch('update')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SETTING_SOCIAL_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for master admin, site manager, institution manager to update social link.',
  })
  update(
    @Query('settingSocialId') id: string,
    @Body() updateSettingSocialDTO: UpdateSettingSocialDTO
  ) {
    return this.settingSocialService.update(+id, updateSettingSocialDTO)
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
  @RequireParams(RequireParam.SETTING_SOCIAL_ID)
  @UseGuards(RequireParamsGuard)
  remove(@Query('settingSocialId') id: number) {
    return this.settingSocialService.remove(+id)
  }
}
