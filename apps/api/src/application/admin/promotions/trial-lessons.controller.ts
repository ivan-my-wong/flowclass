import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
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

import {
  TrialLessonDto,
  TrialLessonObject,
  TrialLessonsPageOptionDto,
} from '@/application/admin/promotions/dto/trial-lesson.dto'
import {
  detailTrialLessonSchema,
  listTrialLessonSchema,
} from '@/application/admin/promotions/dto/trial-lessson.schema'
import { CurrentInstitution } from '@/common/decorators/current-institution.decorator'
import { CurrentSite } from '@/common/decorators/current-site.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { TrialLessonService } from '@/domain/service/trial-lesson.service'
import { RequireParam, Role } from '@/models/enums/'
import { Institution } from '@/models/institutions.entity'
import { Site } from '@/models/site.entity'

@ApiTags('Trial Lesson')
@Controller('trial-lesson')
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
export class TrialLessonsController {
  constructor(private readonly trialLessonService: TrialLessonService) {}

  @Get()
  @ApiOperation({
    summary: 'This api for fetching data trial lessons',
  })
  @ApiOkResponse({
    schema: listTrialLessonSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  findAll(@Query() pageOptionsDto: TrialLessonsPageOptionDto) {
    return this.trialLessonService.findAll(pageOptionsDto)
  }

  @Get('summary')
  @ApiOperation({
    summary: 'This api for fetching data trial lessons',
  })
  @ApiOkResponse({
    schema: listTrialLessonSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  summaryTrialLesson(@CurrentInstitution() institution: Institution, @CurrentSite() site: Site) {
    return this.trialLessonService.countAllTrialLessons(site.id, institution.id)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'This api for fetching detail trial lesson',
  })
  @ApiOkResponse({
    schema: detailTrialLessonSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  findById(@Param('id') id: number) {
    return this.trialLessonService.findById(id)
  }

  @Post('create')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @ApiOkResponse({
    schema: detailTrialLessonSchema,
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api use to create trial lesson.',
  })
  create(
    @Body() dto: TrialLessonDto,
    @CurrentInstitution() institution: Institution,
    @CurrentSite() site: Site
  ): Promise<TrialLessonObject> {
    return this.trialLessonService.create({
      dto,
      institutionId: institution.id,
      siteId: site.id,
    })
  }

  @Put('update')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.TRIAL_LESSON_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api use to update trial lesson.',
  })
  update(
    @Query('trialLessonId') id: string,
    @Body() updateBundleDto: TrialLessonDto
  ): Promise<TrialLessonObject> {
    return this.trialLessonService.update(+id, updateBundleDto)
  }

  @Delete('delete')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.TRIAL_LESSON_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api use to delete trial lesson.',
  })
  remove(@Query('trialLessonId') id: string): Promise<TrialLessonObject> {
    return this.trialLessonService.remove(+id)
  }
}
