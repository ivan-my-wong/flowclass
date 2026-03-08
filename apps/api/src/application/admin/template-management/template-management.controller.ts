import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { TemplateManagementService } from '@/domain/service/template-management.service'
import { DocumentTemplateType } from '@/models/document-template.entity'
import { RequireParam } from '@/models/enums'
import { User } from '@/models/user.entity'

import { CreateDocumentCampaignDto } from './dto/create-campaign.dto'
import { CreateDocumentTemplateDto } from './dto/create-template.dto'

@ApiTags('Template Management')
@ApiUnauthorizedResponse({
  description: 'This response when user not authenticate.',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@Controller('template-management')
export class TemplateManagementController {
  constructor(private readonly templateManagementService: TemplateManagementService) {}

  @ApiOperation({
    summary: 'This endpoint is used to get all document templates for an institution.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('document-templates')
  async getAllDocumentTemplate(
    @Query('institutionId') institutionId: string,
    @Query('type') type?: DocumentTemplateType
  ) {
    try {
      const response = await this.templateManagementService.getAllDocumentTemplate(
        parseInt(institutionId),
        type
      )
      return response
    } catch (error) {
      throw new Error('Failed to initialize session')
    }
  }

  @ApiOperation({
    summary: 'This endpoint is used to get a document template by its ID.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('document-templates/:templateId')
  async getDocumentTemplate(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Query('institutionId', ParseIntPipe) institutionId: number
  ) {
    try {
      const response = await this.templateManagementService.getDocumentTemplateById(
        institutionId,
        templateId
      )
      return response
    } catch (error) {
      throw new InternalServerErrorException('Failed to get document template')
    }
  }

  @ApiOperation({
    summary: 'This endpoint is used to create a new document template.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Post('document-templates')
  async createDocumentTemplate(
    @Body() createDocumentTemplateDto: CreateDocumentTemplateDto,
    @Query('institutionId', ParseIntPipe) institutionId: number
  ) {
    try {
      const response = await this.templateManagementService.createDocumentTemplate(
        institutionId,
        createDocumentTemplateDto
      )
      return response
    } catch (error) {
      throw new InternalServerErrorException('Failed to create document template')
    }
  }

  @ApiOperation({
    summary: 'This endpoint is used to update an existing document template.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Put('document-templates/:templateId')
  async updateDocumentTemplate(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() createDocumentTemplateDto: Partial<CreateDocumentTemplateDto>,
    @Query('institutionId', ParseIntPipe) institutionId: number
  ) {
    try {
      const response = await this.templateManagementService.updateDocumentTemplate(
        institutionId,
        templateId,
        createDocumentTemplateDto
      )
      return response
    } catch (error) {
      throw new InternalServerErrorException('Failed to update document template')
    }
  }

  @ApiOperation({
    summary: 'This endpoint is used to delete a document template by its ID.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Delete('document-templates/:templateId')
  async deleteDocumentTemplate(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Query('institutionId', ParseIntPipe) institutionId: number
  ) {
    try {
      const response = await this.templateManagementService.deleteDocumentTemplate(
        institutionId,
        templateId
      )
      return response
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete document template')
    }
  }

  @ApiOperation({
    summary: 'This endpoint is used to get all document campaign for an institution.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('document-campaign')
  async getAllDocumentCampaigns(@Query('institutionId') institutionId: string) {
    try {
      const response = await this.templateManagementService.getAllDocumentCampaigns(
        parseInt(institutionId)
      )
      return response
    } catch (error) {
      console.error(error)
      throw new Error('Failed to get all document campaigns')
    }
  }

  @ApiOperation({
    summary: 'This endpoint is used to get a document template by its ID.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('document-campaign/:campaignId')
  async getDocumentCampaign(
    @Param('campaignId', ParseIntPipe) campaignId: number,
    @Query('institutionId', ParseIntPipe) institutionId: number
  ) {
    try {
      const response = await this.templateManagementService.getDocumentCampaignById(
        institutionId,
        campaignId
      )
      return response
    } catch (error) {
      throw new InternalServerErrorException('Failed to get document template')
    }
  }

  @ApiOperation({
    summary: 'This endpoint is used to create a new document template.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Post('document-campaign')
  async createDocumentCampaign(
    @Body() createDocumentCampaignDto: CreateDocumentCampaignDto,
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @CurrentUser() user: User
  ) {
    try {
      const response = await this.templateManagementService.createDocumentCampaign(
        institutionId,
        createDocumentCampaignDto,
        user
      )
      return response
    } catch (error) {
      throw new InternalServerErrorException('Failed to create document template')
    }
  }

  @ApiOperation({
    summary: 'This endpoint is used to get all document campaign recipients for an institution.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Get('document-campaign-recipients')
  async getAllDocumentCampaignRecipients(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Query('campaignId', ParseIntPipe) campaignId: number
  ) {
    try {
      const response = await this.templateManagementService.getAllDocumentCampaignRecipients(
        institutionId,
        campaignId
      )
      return response
    } catch (error) {
      throw new Error('Failed to initialize session')
    }
  }

  // resend document for specific recipient
  @ApiOperation({
    summary: 'This endpoint is used to resend a document campaign email to a specific recipient.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @Post('document-campaign-recipients/resend/:recipientId')
  async resendDocumentCampaignEmail(
    @Param('recipientId', ParseIntPipe) recipientId: number,
    @Query('institutionId', ParseIntPipe) institutionId: number
  ) {
    try {
      const response = await this.templateManagementService.resendDocumentCampaignEmail(
        institutionId,
        recipientId
      )
      return response
    } catch (error) {
      throw new InternalServerErrorException('Failed to resend document campaign email')
    }
  }
}
