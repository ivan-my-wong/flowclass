import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { AvailabilityService } from '@/domain/service/availability.service'
import { Availability, AvailableSchedules, DateOverride } from '@/models/availability.entity'
import { RequireParam, Role } from '@/models/enums/'
import { User } from '@/models/user.entity'

import { CreateAvailabilityDto } from './dto/create-availability.dto'
import { UpdateAvailabilityDto } from './dto/update-availability.dto'

@ApiUnauthorizedResponse({
  description: 'This response when user not authenticate.',
})
@ApiResponse({
  description: 'This response when system error.',
  status: 500,
})
@ApiTags('Availability')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  // @RequirePermissions([
  //   {
  //     resource: ResourceType.AVAILABILITY,
  //     action: PermissionAction.VIEW,
  //     scope: PermissionScope.OWN,
  //   },
  // ])
  // @UseGuards(PermissionGuard)
  @ApiOperation({
    summary: 'Get all availabilities for an institution',
  })
  async getAllAvailabilities(
    @Query('institutionId') institutionId: number
  ): Promise<Availability[]> {
    return await this.availabilityService.findByInstitution(institutionId)
  }

  @Get('user/:userId')
  @ApiQuery({ name: 'institutionId', type: Number })
  @ApiQuery({ name: 'userId', type: Number })
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
  @ApiOperation({
    summary: 'Get all availabilities for one teacher',
  })
  async getOnlyTutorAvailabilities(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('userId', ParseIntPipe) userId: number,
    @CurrentUser() user: User
  ): Promise<Availability[]> {
    if (user.id !== userId) {
      throw new BadRequestException('You are not authorized to access this resource')
    }

    return await this.availabilityService.findByInstitutionAndUser(institutionId, userId)
  }

  @Get(':id')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Get an availability by ID',
  })
  @ApiParam({ name: 'id', description: 'Availability ID' })
  async getAvailability(@Param('id') id: number): Promise<Availability> {
    const availability = await this.availabilityService.findOne(id)
    if (!availability) {
      throw new BadRequestException('Availability not found')
    }
    return availability
  }

  @Post()
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'Create a new availability',
  })
  @ApiBody({ type: CreateAvailabilityDto })
  async createAvailability(@Body() createDto: CreateAvailabilityDto): Promise<Availability> {
    return await this.availabilityService.create(createDto)
  }

  @Patch(':id')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update an availability',
  })
  @ApiParam({ name: 'id', description: 'Availability ID' })
  @ApiBody({ type: UpdateAvailabilityDto })
  async updateAvailability(
    @Param('id') id: number,
    @Body() updateDto: UpdateAvailabilityDto
  ): Promise<Availability> {
    return await this.availabilityService.update(id, updateDto)
  }

  @Delete(':id')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Delete an availability',
  })
  @ApiParam({ name: 'id', description: 'Availability ID' })
  async deleteAvailability(@Param('id') id: number): Promise<void> {
    return await this.availabilityService.remove(id)
  }

  // Update assigned user of the calendar
  @Patch(':id/user')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update assigned user of the calendar',
  })
  @ApiParam({ name: 'id', description: 'Availability ID' })
  @ApiBody({ type: UpdateAvailabilityDto })
  async updateAssignedUser(
    @Param('id') id: number,
    @Body() updateDto: UpdateAvailabilityDto
  ): Promise<Availability> {
    return await this.availabilityService.update(id, updateDto)
  }

  @Patch(':id/schedules')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update available schedules for an availability',
  })
  @ApiParam({ name: 'id', description: 'Availability ID' })
  async updateAvailableSchedules(
    @Param('id') id: number,
    @Body() schedules: AvailableSchedules[]
  ): Promise<Availability> {
    return await this.availabilityService.updateAvailableSchedules(id, schedules)
  }

  @Patch(':id/overrides')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update date overrides for an availability',
  })
  @ApiParam({ name: 'id', description: 'Availability ID' })
  async updateDateOverrides(
    @Param('id') id: number,
    @Body() overrides: DateOverride[]
  ): Promise<Availability> {
    return await this.availabilityService.updateDateOverrides(id, overrides)
  }
}
