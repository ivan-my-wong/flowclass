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
import { SettingWebpageInstitutionService } from '@/domain/service/setting-webpage-institution.service'
import { RequireParam, Role } from '@/models/enums/'
import { Institution } from '@/models/institutions.entity'
import { successSchema } from '@/models/schemas/success.schema'

import {
  CreateSettingWebpageInstitutionDto,
  UpdateSettingWebpageInstitutionDto,
} from './dto/setting-webpage-institution.dto'
import { SettingWebpageInstitutionDetailDto } from './dto/setting-webpage-institution-detail.dto'

@ApiTags('Setting Institution')
@Controller('setting-webpage-institution')
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
export class SettingWebpageInstitutionController {
  constructor(
    private readonly settingWebpageInstitutionService: SettingWebpageInstitutionService
  ) {}

  @Post('create')
  @ApiOperation({
    summary: 'This api allows users to create a new one record setting webpage.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  create(
    @Body()
    createSettingWebpageInstitutionDto: CreateSettingWebpageInstitutionDto,
    @CurrentInstitution() institution: Institution
  ): Promise<any> {
    createSettingWebpageInstitutionDto.siteId = institution.siteId
    return this.settingWebpageInstitutionService.create(createSettingWebpageInstitutionDto)
  }

  @Get('detail')
  @ApiOperation({
    summary: 'This api allows users to setting webpage.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  findOne(@Query('institutionId') id: string): Promise<SettingWebpageInstitutionDetailDto> {
    return this.settingWebpageInstitutionService.findOneByInstitution(+id)
  }

  @Patch('update')
  @ApiOperation({
    summary: 'This api allows users to update setting webpage.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SETTING_WEBPAGE_INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  update(
    @Query('settingWebpageInstitutionId') id: string,
    @Body()
    updateSettingWebpageInstitutionDto: UpdateSettingWebpageInstitutionDto
  ) {
    return this.settingWebpageInstitutionService.update(+id, updateSettingWebpageInstitutionDto)
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
  @RequireParams(RequireParam.SETTING_WEBPAGE_INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  remove(@Query('settingWebpageInstitutionId') id: string) {
    return this.settingWebpageInstitutionService.remove(+id)
  }
}
