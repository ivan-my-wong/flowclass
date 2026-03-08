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

import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { RequireParam, Role } from '@/models/enums/'
import { successSchema } from '@/models/schemas/success.schema'

import { SettingSiteService } from '../../../domain/service/setting-site.service'

import {
  CreateSettingSiteDto,
  UpdateDisplayEmailLogoDto,
  UpdateDisplayEmailLogoQueryDto,
  UpdateSettingSiteDto,
} from './dto/setting-site.dto'
import { SettingSiteDetailDto } from './dto/setting-site-detail.dto'

@ApiTags('Setting Site')
@Controller('setting-site')
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
export class SettingSiteController {
  constructor(private readonly settingSiteService: SettingSiteService) {}

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
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  create(@Body() createSettingSiteDto: CreateSettingSiteDto) {
    return this.settingSiteService.create(createSettingSiteDto)
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
  @RequireParams(RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  findOne(@Query('siteId') id: string): Promise<SettingSiteDetailDto> {
    return this.settingSiteService.findOneBySite(+id)
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
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SETTING_SITE_ID)
  @UseGuards(RequireParamsGuard)
  update(@Query('settingSiteId') id: number, @Body() updateSettingSiteDto: UpdateSettingSiteDto) {
    return this.settingSiteService.update(+id, updateSettingSiteDto)
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
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SETTING_SITE_ID)
  @UseGuards(RequireParamsGuard)
  remove(@Query('settingSiteId') id: number) {
    return this.settingSiteService.remove(+id)
  }

  @Patch('display-email-logo/update')
  @ApiOperation({
    summary: 'This api allows users to update display email logo.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  updateDisplayEmailLogo(
    @Query() updateDisplayEmailLogoQueryDto: UpdateDisplayEmailLogoQueryDto,
    @Body() updateDisplayEmailLogoDto: UpdateDisplayEmailLogoDto
  ): Promise<SettingSiteDetailDto> {
    return this.settingSiteService.updateDisplayEmailLogo(
      updateDisplayEmailLogoQueryDto,
      updateDisplayEmailLogoDto
    )
  }
}
