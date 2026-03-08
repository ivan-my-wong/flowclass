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
import { CoursesService } from '@/domain/service/courses.service'
import { SeoSettingsService } from '@/domain/service/seo-setting.service'
import { Course } from '@/models/courses.entity'
import { RequireParam, Role } from '@/models/enums/'
import { Institution } from '@/models/institutions.entity'

import { CreateSeoSettingDTO } from './dto/create-seo-setting.dto'
import { seoSettingSchema } from './dto/seo-setting.schema'
import { SeoSettingDetailDto } from './dto/seo-setting-detail.dto'
import { UpdateCourseSeoSettingDTO, UpdateSeoSettingDTO } from './dto/update-seo-setting.dto'

@ApiTags('Seo Settings')
@Controller('seo-settings')
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
export class SeoSettingsController {
  constructor(
    private readonly seoSettingsService: SeoSettingsService,
    private readonly coursesService: CoursesService
  ) {}

  @Post('create')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api use to create seo setting.',
  })
  create(
    @Body() createSeoSettingDto: CreateSeoSettingDTO,
    @CurrentInstitution() institution: Institution
  ) {
    createSeoSettingDto.siteId = institution.siteId

    return this.seoSettingsService.create(createSeoSettingDto)
  }

  @Get('detail')
  @ApiOperation({
    summary: 'This api use to get a seo setting of flowclass.',
  })
  @ApiOkResponse({
    schema: seoSettingSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  findOne(@Query('institutionId') id: string): Promise<SeoSettingDetailDto> {
    return this.seoSettingsService.findOneByInstitution(+id)
  }

  @Patch('update')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SEO_SETTING_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api use to update seo setting.',
  })
  @ApiOkResponse({
    schema: seoSettingSchema,
  })
  update(
    @Query('seoSettingId') id: string,
    @Body() updateSeoSettingDto: UpdateSeoSettingDTO,
    @CurrentInstitution() institution: Institution
  ): Promise<SeoSettingDetailDto> {
    updateSeoSettingDto.siteId = institution.siteId
    updateSeoSettingDto.institutionId = institution.id

    return this.seoSettingsService.update(+id, updateSeoSettingDto)
  }

  @Patch('update-course')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.COURSE_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api use to update seo setting of a course.',
  })
  @ApiOkResponse({
    schema: seoSettingSchema,
  })
  updateCourseSeoSetting(
    @Query('courseId') id: number,
    @Body() seoContent: UpdateCourseSeoSettingDTO
  ): Promise<Course> {
    return this.coursesService.updateSeoContent(id, seoContent)
  }

  @Delete('delete')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SEO_SETTING_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api use to delete seo setting.',
  })
  @ApiOkResponse({
    schema: seoSettingSchema,
  })
  remove(@Query('seoSettingId') id: string): Promise<SeoSettingDetailDto> {
    return this.seoSettingsService.remove(+id)
  }
}
