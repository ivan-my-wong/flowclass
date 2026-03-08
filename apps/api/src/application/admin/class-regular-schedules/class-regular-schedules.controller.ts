import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { Transactional } from 'typeorm-transactional'

import { RegularSchedulePreviewResponseDto } from '@/application/student/course/dto/regular-schedules.dto'
import { CurrentInstitution } from '@/common/decorators/current-institution.decorator'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { ClassRegularSchedulesV2Service } from '@/domain/service/class-regular-schedules.service'
import { DateOverride } from '@/models/availability.entity'
import { ClassRegularSchedulesV2 } from '@/models/class-regular-schedules.entity'
import { ClassEntity } from '@/models/classes.entity'
import { RequireParam, Role } from '@/models/enums/'
import { Institution } from '@/models/institutions.entity'
import { User } from '@/models/user.entity'

import {
  CreateClassRegularScheduleDto,
  CreateOrUpdateClassRegularPeriodDto,
  DateOverrideDto,
  UpdateClassRegularScheduleDto,
} from './dto/class-regular-schedules.dto'

@ApiTags('Class Regular Schedules')
@Controller('class-regular-schedules')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@UseInterceptors(ClassSerializerInterceptor)
@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: "This is because the token is expired or user haven't login yet",
})
@ApiResponse({
  description: 'This response when system error.',
  status: 500,
})
export class ClassRegularSchedulesV2Controller {
  constructor(private readonly classRegularSchedulesV2Service: ClassRegularSchedulesV2Service) {}

  @ApiOperation({
    summary: 'Get all class regular schedules for the institution',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved class regular schedules',
    type: [ClassEntity],
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('classes')
  async findAll(@CurrentInstitution() institution: Institution): Promise<ClassEntity[]> {
    return await this.classRegularSchedulesV2Service.findRegularClasses(institution.id)
  }
  @ApiOperation({
    summary: 'Get class regular schedules by class ID',
  })
  @ApiOkResponse({
    description: 'Successfully retrieved class regular schedules for the class',
    type: [ClassRegularSchedulesV2],
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('class/:classId')
  async findByClassId(
    @Param('classId', ParseIntPipe) classId: number,
    @Param('institutionId', ParseIntPipe) institutionId: number
  ): Promise<ClassRegularSchedulesV2[]> {
    return await this.classRegularSchedulesV2Service.findByClassId(classId)
  }

  @ApiOperation({
    summary: 'Create a new class regular schedule with multiple lesson periods',
    description:
      'Create a class regular schedule that supports multiple lesson periods. ' +
      'Each period can have different times and recurrence patterns. ' +
      'For example: Monday 9:00-10:30 + Wednesday 14:00-15:30 within the same schedule.',
  })
  @ApiCreatedResponse({
    description: 'Class regular schedule created successfully',
    type: ClassRegularSchedulesV2,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Post()
  @Transactional()
  async create(
    @Body() createDto: CreateClassRegularScheduleDto,
    @CurrentInstitution() institution: Institution
  ): Promise<ClassRegularSchedulesV2> {
    // Ensure institution and site IDs match current context
    createDto.institutionId = institution.id
    createDto.siteId = institution.siteId || createDto.siteId

    return await this.classRegularSchedulesV2Service.create(createDto)
  }

  @ApiOperation({
    summary: 'Update an existing class regular schedule',
  })
  @ApiOkResponse({
    description: 'Class regular schedule updated successfully',
    type: ClassRegularSchedulesV2,
  })
  @ApiNotFoundResponse({
    description: 'Class regular schedule not found',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Patch(':id')
  @Transactional()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateClassRegularScheduleDto
  ): Promise<ClassRegularSchedulesV2> {
    return await this.classRegularSchedulesV2Service.update(id, updateDto)
  }

  @ApiOperation({
    summary: 'Add a lesson period to an existing class regular schedule',
    description:
      'Add a new lesson period to the existing schedule. ' +
      'Useful for adding additional time slots like "Wednesday Evening" to an existing schedule.',
  })
  @ApiOkResponse({
    description: 'Lesson period added successfully',
    type: ClassRegularSchedulesV2,
  })
  @ApiNotFoundResponse({
    description: 'Class regular schedule not found',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Post(':id/periods')
  @Transactional()
  async addPeriod(
    @Param('id', ParseIntPipe) id: number,
    @Body() periodDto: CreateOrUpdateClassRegularPeriodDto
  ): Promise<ClassRegularSchedulesV2> {
    return await this.classRegularSchedulesV2Service.addPeriod(id, periodDto)
  }

  @ApiOperation({
    summary: 'Remove a lesson period from a class regular schedule',
  })
  @ApiOkResponse({
    description: 'Lesson period removed successfully',
    type: ClassRegularSchedulesV2,
  })
  @ApiNotFoundResponse({
    description: 'Class regular schedule not found',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Delete(':id/periods/:periodId')
  @Transactional()
  async removePeriod(
    @Param('id', ParseIntPipe) id: number,
    @Param('periodId', ParseIntPipe) periodId: number,
    @CurrentInstitution() institution: Institution,
    @CurrentUser() user: User
  ): Promise<ClassRegularSchedulesV2> {
    return await this.classRegularSchedulesV2Service.removePeriod(id, periodId)
  }

  @ApiOperation({
    summary: 'Update date overrides for a class regular schedule',
  })
  @ApiOkResponse({
    description: 'Date overrides updated successfully',
    type: ClassRegularSchedulesV2,
  })
  @ApiNotFoundResponse({
    description: 'Class regular schedule not found',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Patch(':id/date-overrides')
  @Transactional()
  async updateDateOverrides(
    @Param('id', ParseIntPipe) id: number,
    @Body() dateOverrides: DateOverride[],
    @CurrentInstitution() institution: Institution,
    @CurrentUser() user: User
  ): Promise<ClassRegularSchedulesV2> {
    return await this.classRegularSchedulesV2Service.updateDateOverrides(id, dateOverrides)
  }

  @ApiOperation({
    summary: 'Add a single date override to a class regular schedule',
  })
  @ApiOkResponse({
    description: 'Date override added successfully',
    type: ClassRegularSchedulesV2,
  })
  @ApiNotFoundResponse({
    description: 'Class regular schedule not found',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Post(':id/date-overrides')
  @Transactional()
  async addDateOverride(
    @Param('id', ParseIntPipe) id: number,
    @Body() dateOverride: DateOverrideDto,
    @CurrentInstitution() institution: Institution,
    @CurrentUser() user: User
  ): Promise<ClassRegularSchedulesV2> {
    return await this.classRegularSchedulesV2Service.addDateOverride(id, dateOverride)
  }

  @ApiOperation({
    summary: 'Remove a date override from a class regular schedule',
  })
  @ApiOkResponse({
    description: 'Date override removed successfully',
    type: ClassRegularSchedulesV2,
  })
  @ApiNotFoundResponse({
    description: 'Class regular schedule not found',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Delete(':id/date-overrides/:date')
  @Transactional()
  async removeDateOverride(
    @Param('id', ParseIntPipe) id: number,
    @Param('date') date: string,
    @CurrentInstitution() institution: Institution,
    @CurrentUser() user: User
  ): Promise<ClassRegularSchedulesV2> {
    return await this.classRegularSchedulesV2Service.removeDateOverride(id, date)
  }

  @ApiOperation({
    summary: 'Get detail regular class lessons',
  })
  @ApiOkResponse({
    description: 'Regular class retrieved successfully',
    type: ClassEntity,
  })
  @ApiNotFoundResponse({
    description: 'Class regular not found',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  @Get('classes/:classId/detail')
  @Transactional()
  async getDetailRegularClass(
    @CurrentInstitution() institution: Institution,
    @CurrentUser() user: User,
    @Param('classId', ParseIntPipe) classId: number
  ) {
    return await this.classRegularSchedulesV2Service.getDetailRegularClassV2(classId)
  }

  @ApiOperation({
    summary: 'Preview regular class lessons',
  })
  @ApiOkResponse({
    description: 'Regular class lessons previewed successfully',
    type: RegularSchedulePreviewResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Class regular schedule not found',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  @Get('classes/:classId/preview-lessons')
  @Transactional()
  async previewRegularClassLessons(
    @CurrentInstitution() institution: Institution,
    @CurrentUser() user: User,
    @Param('classId', ParseIntPipe) classId: number
  ) {
    return await this.classRegularSchedulesV2Service.previewRegularClassLessons(classId)
  }
}
