import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { LocationRoomService } from '@/domain/service/location-room.service'
import { RequireParam, Role } from '@/models/enums'

import { LocationRoomDto } from './dto/location-room.dto'

@ApiTags('Admin Location Room')
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
@Controller('location-room')
export class LocationRoomController {
  constructor(private readonly locationRoomService: LocationRoomService) {}

  @Post('/list')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary:
      'This api for master admin, site manager, institution manager use to create location room',
  })
  async createLocationRoom(
    @Query('siteId') siteId: number,
    @Query('institutionId') institutionId: number,
    @Body() locationRoomDto: LocationRoomDto
  ) {
    return this.locationRoomService.createLocationRoom(institutionId, siteId, locationRoomDto)
  }

  @Get('list')
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
  async findAllLocationRooms(
    @Query('siteId') siteId: number,
    @Query('institutionId') institutionId: number
  ) {
    return this.locationRoomService.findAllLocationRooms(institutionId, siteId)
  }

  @Get('/options')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async findLocationGroupAndEquipment(
    @Query('siteId') siteId: number,
    @Query('institutionId') institutionId: number
  ) {
    return this.locationRoomService.findLocationGroupAndEquipment(institutionId, siteId)
  }

  @Get('/:id/detail')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async findLocationRoomById(
    @Query('siteId') siteId: number,
    @Query('institutionId') institutionId: number,
    @Param('id') id: number
  ) {
    return this.locationRoomService.findLocationRoomById(institutionId, siteId, id)
  }

  @Put('/:id/detail')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async updateLocationRoom(
    @Param('id') id: number,
    @Body() locationRoomDto: LocationRoomDto,
    @Query('siteId') siteId: number,
    @Query('institutionId') institutionId: number
  ) {
    return this.locationRoomService.updateLocationRoom(id, locationRoomDto, institutionId, siteId)
  }

  @Delete('/:id/detail')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async deleteLocationRoom(
    @Param('id') id: number,
    @Query('siteId') siteId: number,
    @Query('institutionId') institutionId: number
  ) {
    return this.locationRoomService.deleteLocationRoom(id, institutionId, siteId)
  }
}
