import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger'

import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { InvoiceCampaignService } from '@/domain/service/invoice-campaign.service'
import { DocumentCampaign } from '@/models/document-campaign.entity'
import { RequireParam, Role } from '@/models/enums'
import { User } from '@/models/user.entity'

import {
  InvoiceCampaignDto,
  PageParamsDto,
  ResendInvoiceDto,
  SendInvoiceDirectlyDto,
  SendInvoiceDto,
  SyncEnrollCoursesDto,
} from './dto/send-invoice.dto'

@ApiTags('Invoice Campaign')
@Controller('invoice-campaign')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
export class InvoiceCampaignController {
  constructor(private readonly invoiceCampaignService: InvoiceCampaignService) {}

  @Get('list')
  @ApiOperation({
    summary: 'Get list of invoice campaign',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RolesGuard, RequireParamsGuard)
  @ApiOkResponse({
    description: 'Paginated list of invoice campaigns',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: getSchemaPath(DocumentCampaign) },
        },
        total: { type: 'number' },
      },
    },
  })
  @HttpCode(HttpStatus.OK)
  async getInvoiceCampaigns(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Query() pageParams: PageParamsDto
  ): Promise<{ data: DocumentCampaign[]; total: number }> {
    return this.invoiceCampaignService.getInvoiceCampaigns(institutionId, pageParams)
  }

  @Post('create-campaign')
  @ApiOperation({ summary: 'Create a new invoice campaign' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RolesGuard, RequireParamsGuard)
  @ApiBody({ type: InvoiceCampaignDto })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Invoice campaign created successfully' })
  @HttpCode(HttpStatus.CREATED)
  async createInvoiceCampaign(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Body() payload: InvoiceCampaignDto
  ) {
    return this.invoiceCampaignService.createInvoice(payload, institutionId)
  }

  @Patch(':documentId/send-campaign')
  @ApiOperation({ summary: 'Send invoice to designated contact for a campaign (initial send)' })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard, RequireParamsGuard)
  @ApiBody({ type: SendInvoiceDto })
  @ApiResponse({ status: HttpStatus.ACCEPTED, description: 'Invoice sent successfully' })
  @HttpCode(HttpStatus.ACCEPTED)
  async sendInvoice(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('documentId', ParseIntPipe) documentId: number,
    @Body() payload: SendInvoiceDto,
    @CurrentUser() currentUser: User
  ): Promise<{
    jobId: string
  }> {
    return this.invoiceCampaignService.sendInvoiceSynchronous(
      documentId,
      institutionId,
      payload,
      currentUser.id
    )
  }

  @Patch(':documentId/edit-and-resend')
  @ApiOperation({
    summary: 'Edit and re-send a completed invoice campaign, preserving the original amountPaid',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard, RequireParamsGuard)
  @ApiBody({ type: SendInvoiceDto })
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Invoice updated and re-sent successfully',
  })
  @HttpCode(HttpStatus.ACCEPTED)
  async editAndResendInvoice(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('documentId', ParseIntPipe) documentId: number,
    @Body() payload: SendInvoiceDto,
    @CurrentUser() currentUser: User
  ): Promise<{ jobId: string }> {
    return this.invoiceCampaignService.editAndResendInvoiceCampaign(
      documentId,
      institutionId,
      payload,
      currentUser.id
    )
  }

  @Get(':documentId/detail')
  @ApiOperation({ summary: 'Get invoice campaign details' })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard, RequireParamsGuard)
  @ApiBody({ type: InvoiceCampaignDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice campaign details retrieved successfully',
  })
  @HttpCode(HttpStatus.OK)
  async getDetailInvoiceCampaign(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('documentId', ParseIntPipe) documentId: number
  ) {
    return this.invoiceCampaignService.getDetailInvoiceCampaign(documentId, institutionId)
  }

  @Put(':documentId/update-campaign')
  @ApiOperation({ summary: 'Update invoice campaign details' })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard, RequireParamsGuard)
  @ApiBody({ type: InvoiceCampaignDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice campaign details updated successfully',
  })
  @HttpCode(HttpStatus.OK)
  async updateInvoiceCampaign(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('documentId', ParseIntPipe) documentId: number,
    @Body() payload: Partial<InvoiceCampaignDto>
  ) {
    return this.invoiceCampaignService.updateInvoiceCampaign(payload, documentId, institutionId)
  }

  @Get('/invoice/:invoiceId/pdf')
  @ApiOperation({ summary: 'Generate PDF for a specific invoice' })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard, RequireParamsGuard)
  @ApiResponse({
    status: 200,
    description: 'PDF generated successfully',
  })
  async generateInvoicePdf(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('invoiceId', ParseIntPipe) invoiceId: number
  ) {
    return this.invoiceCampaignService.generateInvoicePdf(invoiceId, institutionId)
  }
  @Patch(':documentId/duplicate')
  @ApiOperation({ summary: 'Duplicate an existing invoice campaign' })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard, RequireParamsGuard)
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Invoice campaign duplicated successfully',
  })
  @HttpCode(HttpStatus.CREATED)
  async duplicateInvoiceCampaign(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('documentId', ParseIntPipe) documentId: number
  ) {
    const duplicatedCampaign = await this.invoiceCampaignService.duplicateInvoiceCampaign(
      documentId,
      institutionId
    )
    if (!duplicatedCampaign) {
      throw new NotFoundException('Invoice campaign not found')
    }
    return duplicatedCampaign
  }

  @Patch(':documentId/sync-enroll-courses')
  @ApiOperation({
    summary: 'Sync enrollCourse class mappings from a diff (add/remove classes per invoice)',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard, RequireParamsGuard)
  @ApiBody({ type: SyncEnrollCoursesDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'EnrollCourses synced successfully' })
  @HttpCode(HttpStatus.OK)
  async syncEnrollCourses(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('documentId', ParseIntPipe) documentId: number,
    @Body() payload: SyncEnrollCoursesDto
  ) {
    await this.invoiceCampaignService.syncEnrollCoursesForCampaign(
      documentId,
      institutionId,
      payload
    )
  }

  @Delete(':documentId')
  @ApiOperation({ summary: 'Delete an existing invoice campaign' })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard, RequireParamsGuard)
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Invoice campaign deleted successfully',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteInvoiceCampaign(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('documentId', ParseIntPipe) documentId: number
  ) {
    await this.invoiceCampaignService.deleteInvoiceCampaign(institutionId, documentId)
  }

  @Post(':recipientId/resend')
  @ApiOperation({ summary: 'Resend invoice to a specific recipient' })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard, RequireParamsGuard)
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Invoice resent successfully',
  })
  @ApiBody({ type: ResendInvoiceDto })
  @HttpCode(HttpStatus.OK)
  async resendInvoiceRecipient(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('recipientId', ParseIntPipe) recipientId: number,
    @Body() payload: ResendInvoiceDto
  ) {
    await this.invoiceCampaignService.resendDocument(recipientId, institutionId, payload)
  }

  @Post('/invoice/:invoiceId/send')
  @ApiOperation({ summary: 'Send invoice directly' })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard, RequireParamsGuard)
  @ApiResponse({
    status: HttpStatus.ACCEPTED,
    description: 'Send Invoice successfully',
  })
  @ApiBody({ type: SendInvoiceDirectlyDto })
  @HttpCode(HttpStatus.ACCEPTED)
  async sendInvoiceDirectly(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('invoiceId', ParseIntPipe) invoiceId: number,
    @Body() payload: SendInvoiceDirectlyDto
  ) {
    payload.invoiceId = invoiceId
    return this.invoiceCampaignService.sendInvoiceDirectly(payload, institutionId)
  }
}
