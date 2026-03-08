import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { Transactional } from 'typeorm-transactional'

import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { CustomMessageService } from '@/domain/service/custom-message.service'
import { CustomMessageEntity } from '@/models/custom-message.entity'
import { RequireParam, Role } from '@/models/enums'

import { CreateCustomMessageDTO } from './dto/custom-message.dto'

@Controller('custom-message')
@ApiTags('Custom Message')
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
export class CustomMessageController {
  constructor(private readonly customMessageService: CustomMessageService) {}

  @Get('')
  @ApiOperation({
    summary: 'This api for get all custom message',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async getListCustomMessages(
    @Query('institutionId') institutionId: number
  ): Promise<CustomMessageEntity[]> {
    const templates = await this.customMessageService.getAllTemplates(institutionId)
    if (templates.length === 0) {
      return await this.customMessageService.createDefaultTemplates(institutionId)
    }
    return templates
  }

  @Post('')
  @ApiOperation({
    summary: 'This api for create custom message',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async createCustomMessage(
    @Query('institutionId') institutionId: number,
    @Body() body: CreateCustomMessageDTO
  ) {
    return this.customMessageService.createOrUpdateCustomMessage(institutionId, body)
  }

  @Delete(':id/detail')
  @ApiOperation({
    summary: 'This api for delete custom message',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async deleteCustomMessage(
    @Query('institutionId') institutionId: number,
    @Param('id') id: number
  ) {
    return this.customMessageService.deleteCustomMessage(institutionId, id)
  }

  @Get(':id/detail')
  @ApiOperation({
    summary: 'This api for get custom message by id',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async getCustomMessageById(
    @Query('institutionId') institutionId: number,
    @Param('id') id: number
  ) {
    return this.customMessageService.getCustomMessageById(institutionId, id)
  }

  @Get('prepared-data')
  @ApiOperation({
    summary: 'This api for get prepared data',
  })
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async getPreparedData(@Query('institutionId') _: number) {
    return this.customMessageService.getPreparedData()
  }
}
