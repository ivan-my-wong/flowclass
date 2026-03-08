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
import { WhatsappTemplateService } from '@/domain/service/whatsapp-template.service'
import { RequireParam, Role } from '@/models/enums'
import { WhatsappTemplateEntity } from '@/models/whatsapp-template.entity'

import { WhatsappTemplateDTO } from './dto/whatsapp-template.dto'
import {
  WhatsappTemplatePageDto,
  WhatsappTemplatePaginationDTO,
} from './dto/whatsapp-template-pagination.dto'

@Controller('whatsapp-template')
@ApiTags('Whatsapp Template')
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
export class WhatsappTemplateController {
  constructor(private readonly whatsappTemplateService: WhatsappTemplateService) {}

  @Get('')
  @ApiOperation({
    summary: 'This api for get all whatsapp template',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async getListTemplates(
    @Query() pageOptionsDto: WhatsappTemplatePaginationDTO
  ): Promise<WhatsappTemplatePageDto> {
    return this.whatsappTemplateService.getAllTemplates(pageOptionsDto)
  }

  @Post('/create')
  @ApiOperation({
    summary: 'This api for creating automation flow',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async createNewTemplate(
    @Query('institutionId') institutionId: number,
    @Body() payload: WhatsappTemplateDTO
  ): Promise<WhatsappTemplateEntity> {
    return this.whatsappTemplateService.createWhatsappTemplate(institutionId, payload)
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'This api for get detail of whatsapp template',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async getDetailWhatsappTemplate(
    @Query('institutionId') institutionId: number,
    @Param('id') whatsappTemplateId: number
  ): Promise<WhatsappTemplateEntity> {
    return this.whatsappTemplateService.getTemplateById(whatsappTemplateId, institutionId)
  }

  @Get('/:id/submit-approval')
  @ApiOperation({
    summary: 'This api for submitting approval of whatsapp template',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async submitApprovalRequest(
    @Query('institutionId') institutionId: number,
    @Param('id') whatsappTemplateId: number
  ): Promise<WhatsappTemplateEntity> {
    return this.whatsappTemplateService.submitApprovalRequest(whatsappTemplateId, institutionId)
  }

  @Put('/:id/update')
  @ApiOperation({
    summary: 'This api for delete whatsapp template',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async updateWhatsappTemplate(
    @Query('institutionId') institutionId: number,
    @Param('id') whatsappTemplateId: number,
    @Body() payload: WhatsappTemplateDTO
  ): Promise<WhatsappTemplateEntity> {
    return this.whatsappTemplateService.updateWhatsappTemplate(
      whatsappTemplateId,
      institutionId,
      payload
    )
  }

  @Delete('/:id/delete')
  @ApiOperation({
    summary: 'This api for delete whatsapp template',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Transactional()
  async deleteWhatsappTemplate(
    @Query('institutionId') institutionId: number,
    @Param('id') whatsappTemplateId: number
  ): Promise<void> {
    return this.whatsappTemplateService.deleteWhatsappTemplate(whatsappTemplateId, institutionId)
  }
}
