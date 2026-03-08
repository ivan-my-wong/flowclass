import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
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

import { ApiResult } from '@/common/api-formats/api-result'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Role } from '@/models/enums/'

import { ManagementService } from '../../../domain/service/management.service'

import {
  AssignManagementDto,
  GetInstitutionDto,
  SearchUserManagementDto,
} from './dtos/master-admin.dto'

@Controller('master-admin')
@ApiTags('Admin Management')
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
export class MasterAdminController {
  constructor(private readonly managementService: ManagementService) {}

  @Get('institutions')
  @ApiOperation({
    summary: 'This api for list all institution of flowclass.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when institution already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  async getInstitution(@Query() params: GetInstitutionDto) {
    const result = await this.managementService.getInstitutions(params)

    return new ApiResult().success(result)
  }

  @Get('search-user')
  @ApiOperation({
    summary: 'This api for list all user match keyword of flowclass.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  async searchUser(@Query() params: SearchUserManagementDto) {
    const result = await this.managementService.searchUser(params)

    return new ApiResult().success(result)
  }

  @Post('/assign-management')
  @ApiOperation({
    summary: 'This api for assign management for institution of flowclass.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may assign management success',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  async assignManagementForIns(@Body() params: AssignManagementDto) {
    const result = await this.managementService.assignManagementForIns(params)

    return new ApiResult().success(result)
  }

  @Post('/remove-assign-management')
  @ApiOperation({
    summary: 'This api for remove assign management for institution of flowclass.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may remove assign management success',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  async removeAssignManagement(@Body() params: AssignManagementDto) {
    const result = await this.managementService.removeAssignManagement(params)

    return new ApiResult().success(result)
  }
}
