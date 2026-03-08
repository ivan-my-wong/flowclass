import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { PrerequisitesCoursesService } from '@/domain/service/prerequisites-course.service'
import { RequireParam, Role } from '@/models/enums'

import { ValidatePrerequisitesDto } from './dto/prerequesites.dto'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: `This is because the token is expired or user haven't login yet`,
})
@ApiTags('PrerequisitesCourses')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('prerequisites-courses')
export class PrerequisitesCourseController {
  constructor(private readonly prerequisitesCourseService: PrerequisitesCoursesService) {}

  @ApiOperation({ summary: 'Get all prerequisites courses' })
  @Get(':courseId')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async getAllPrerequisites(
    @Param('courseId') courseId: number,
    @Query('institutionId') institutionId: number
  ) {
    return await this.prerequisitesCourseService.getAllPrerequisites(courseId, institutionId)
  }

  @ApiOperation({ summary: 'Update or Create prerequisites courses' })
  @Post(':courseId')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async updateOrAddPrerequisites(
    @Param('courseId') courseId: number,
    @Query('institutionId') institutionId: number,
    @Body() payload: ValidatePrerequisitesDto
  ) {
    return await this.prerequisitesCourseService.updateOrCreateCoursePrerequisites(
      courseId,
      institutionId,
      payload
    )
  }

  @ApiOperation({ summary: 'Update or Create prerequisites courses' })
  @Delete(':courseId')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async removePrerequisites(
    @Param('courseId') courseId: number,
    @Query('institutionId') institutionId: number
  ) {
    return await this.prerequisitesCourseService.removeCoursePrerequisites(courseId, institutionId)
  }
}
