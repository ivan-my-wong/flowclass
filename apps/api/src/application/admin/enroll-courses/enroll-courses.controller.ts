import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import {
  classEnrolledCountSchema,
  confirmStateEnrollCourseSchema,
  getAllEnrollCourseSchema,
} from '@/application/admin/enroll-courses/dto/enroll-course.schema'
import { SchoolCourseRevenueDto } from '@/application/admin/enroll-courses/dto/school-course-revenue.dto'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { PermissionGuard } from '@/common/guards/permission.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { PageMetaDto } from '@/common/pagination/page-meta.dto'
import {
  PermissionAction,
  PermissionScope,
  ResourceType,
} from '@/common/permissions/permission-registry'
import { EnrollCoursesService } from '@/domain/service/enroll-courses.service'
import { InvoiceService } from '@/domain/service/invoice.service'
import { EnrollCourse } from '@/models/enroll-courses.entity'
import { RequireParam, Role } from '@/models/enums/'
import { User } from '@/models/user.entity'

import { ConfirmStateEnrollCourseDto } from './dto/confirm-state-enroll-course.dto'
import { EnrollCourseResponse } from './dto/create-enroll-course.dto'
import { EnrollCourseOptionDto, EnrollCoursePageDto } from './dto/enroll-course-pagination.dto'

@ApiTags('Admin Enroll Courses')
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
@Controller('enroll-courses')
export class EnrollCoursesController {
  constructor(
    private readonly enrollCoursesService: EnrollCoursesService,
    private readonly invoiceService: InvoiceService
  ) {}

  @ApiExtraModels(EnrollCourseResponse, PageMetaDto)
  @Get()
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for master admin use to get enroll courses',
  })
  @ApiOkResponse({
    schema: getAllEnrollCourseSchema,
  })
  findAll(@Query() pageOptionsDto: EnrollCourseOptionDto): Promise<EnrollCoursePageDto> {
    return this.enrollCoursesService.findAll(pageOptionsDto)
  }

  @Post('confirm-state')
  @ApiOperation({
    summary: 'This api for master admin confirm state of enroll courses',
  })
  @ApiOkResponse({
    schema: confirmStateEnrollCourseSchema,
  })
  @Roles(Role.MASTER_ADMIN)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  confirmState(
    @Body() confirmStateEnrollCourseDto: ConfirmStateEnrollCourseDto,
    @CurrentUser() currentUser: User
  ): Promise<EnrollCourseResponse> {
    return this.enrollCoursesService.confirmState(confirmStateEnrollCourseDto, currentUser)
  }

  @Get('school-revenue')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for master admin use to get total revenue of school',
  })
  @ApiOkResponse({
    schema: getAllEnrollCourseSchema,
  })
  getRevenue(@Query() schoolCourseRevenueDto: SchoolCourseRevenueDto): Promise<any> {
    return this.enrollCoursesService.getTotalSchoolRevenue(
      schoolCourseRevenueDto.institutionId,
      schoolCourseRevenueDto.courseId,
      schoolCourseRevenueDto.startDate,
      schoolCourseRevenueDto.endDate
    )
  }

  @Get('/enrolled-classes')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for fetching enrolled count of class',
  })
  @ApiOkResponse({
    schema: classEnrolledCountSchema,
  })
  getEnrolledClassCount(@Query('institutionId') institutionId: number) {
    return this.enrollCoursesService.getEnrolledClassCount(institutionId)
  }

  @Get('/enrolled-classes/user/:userId')
  @RequirePermissions([
    {
      resource: ResourceType.ENROLL_COURSES,
      action: PermissionAction.VIEW,
      scope: PermissionScope.OWN,
    },
  ])
  @UseGuards(RolesGuard, PermissionGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for fetching enrolled count of class',
  })
  @ApiOkResponse({
    schema: classEnrolledCountSchema,
  })
  getEnrolledClassCountOfOwnUser(
    @Query('institutionId') institutionId: number,
    @Param('userId') userId: number
  ) {
    return this.enrollCoursesService.getEnrolledClassCount(institutionId, userId)
  }

  @Get('/user/:userAliasId/list')
  @RequirePermissions([
    {
      resource: ResourceType.ENROLL_COURSES,
      action: PermissionAction.VIEW,
      scope: PermissionScope.OWN,
    },
  ])
  @UseGuards(RolesGuard, PermissionGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for fetching enrolled classes of user by userAliasId and date',
  })
  getEnrolledClassesOfOwnUser(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('userAliasId', ParseIntPipe) userAliasId: number,
    @Query('date') date: string
  ): Promise<EnrollCourse[]> {
    return this.enrollCoursesService.getEnrolledClassesByUserAlias(institutionId, userAliasId, date)
  }
}
