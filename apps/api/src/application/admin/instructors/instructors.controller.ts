import { Body, Controller, Get, Param, Post, Put, Query, Res, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Transactional } from 'typeorm-transactional'

import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { InstructorProfilesService } from '@/domain/service/instructor-profiles.service'
import { UsersService } from '@/domain/service/users.service'
import { RequireParam, Role } from '@/models/enums'
import { InstructorProfile } from '@/models/instructor-profile.entity'
import { InstructorRate } from '@/models/instructor-rates.entity'
import { successSchema } from '@/models/schemas/success.schema'
import { UserRole } from '@/models/user-role.entity'

import { InstructorLessonExportDto, UpComingClassesDto } from '../users/dto/user-detail.dto'

import { InstructorDataDto } from './dto/instructor-data.dto'
import { UpdateInstructorRateDto } from './dto/update-instructor-rate.dto'
import { UpdateRatesStatusDto } from './dto/update-rates-status.dto'

@ApiTags('Instructor Rates')
@ApiBearerAuth()
@UseGuards(AdminAuthGuard)
@Controller('instructors')
export class InstructorsController {
  constructor(
    private readonly instructorProfilesService: InstructorProfilesService,
    private readonly usersService: UsersService
  ) {}

  @Get()
  @ApiOperation({
    summary: 'This api for site manager to get list instructors',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  getInstructors(
    @Query('siteId') siteId: number,
    @Query('institutionId') institutionId: number
  ): Promise<UserRole[]> {
    return this.instructorProfilesService.getManagersAndInstructors(siteId, institutionId)
  }

  @Get('analytics')
  @ApiOperation({
    summary: 'This api for site manager to get instructor analytics',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  getInstructorAnalytics(@Query() instructorDataDto: InstructorDataDto) {
    return this.instructorProfilesService.getInstructorAnalytics(instructorDataDto)
  }

  @Put(':userRoleId/rates/enabled')
  @ApiOperation({ summary: 'Update instructor rates enabled status' })
  @ApiResponse({ status: 200, description: 'Rates enabled status updated successfully' })
  async updateInstructorRatesEnabled(
    @Param('userRoleId') userRoleId: number,
    @Body() updateRatesStatusDto: UpdateRatesStatusDto
  ): Promise<InstructorProfile> {
    return this.instructorProfilesService.updateRatesStatus(userRoleId, updateRatesStatusDto)
  }

  @Get(':userRoleId/rates')
  @ApiOperation({ summary: 'Get instructor rates' })
  @ApiResponse({ status: 200, description: 'Rates retrieved successfully' })
  async getInstructorRates(
    @Param('userRoleId') userRoleId: number,
    @Query('institutionId') institutionId: number
  ): Promise<{
    isEnabled: boolean
    isStudentRatesEnabled: boolean
    studentRatesConfig: { minimumStudents: number; additionalSalaryPerStudent: number } | null
    rates: InstructorRate[]
  }> {
    return await this.instructorProfilesService.getInstructorRatesForUI(userRoleId, institutionId)
  }

  @Post(':userRoleId/rates')
  @ApiOperation({ summary: 'Create instructor rate' })
  @ApiResponse({ status: 201, description: 'Rate created successfully' })
  async createOrUpdateInstructorRate(
    @Param('userRoleId') userRoleId: number,
    @Query('institutionId') institutionId: number,
    @Body() createInstructorRateDto: UpdateInstructorRateDto[]
  ): Promise<InstructorRate[]> {
    return await this.instructorProfilesService.createOrUpdateRates(
      userRoleId,
      institutionId,
      createInstructorRateDto
    )
  }

  @Get('class-lessons')
  @ApiOperation({
    summary: 'This api for site manager to get upcoming classes',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async getUpcomingClasses(@Query() upComingClassesDto: UpComingClassesDto) {
    return this.instructorProfilesService.getClassLessonsOfInstructor(upComingClassesDto)
  }

  /**
   * @deprecated This endpoint will be removed in a future version
   */
  @Get('class-lessons/export-csv')
  @ApiOperation({
    summary: 'This api for site manager to export instructor lessons to CSV',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async exportInstructorLesson(
    @Query() exportLessonsDto: InstructorLessonExportDto,
    @Res({
      passthrough: true,
    })
    res
  ) {
    const result = await this.instructorProfilesService.exportLessonsToCsv(exportLessonsDto)
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${result.fileName}"`)
    res.send(result.csvString)
  }
}
