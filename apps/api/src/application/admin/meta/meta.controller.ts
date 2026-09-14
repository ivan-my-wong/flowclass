import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger'

import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { MetaService } from '@/domain/external/meta/meta.service'
import { MetaCoexistenceSyncService } from '@/domain/external/meta/meta-coexistence-sync.service'
import { MetaTemplateService } from '@/domain/external/meta/meta-template.service'
import { Role } from '@/models/enums'

import { CompleteMetaEmbeddedSignupDto } from './dto/complete-meta-embedded-signup.dto'
import { ConnectSystemUserDto } from './dto/connect-system-user.dto'
import { CreateMetaEmbeddedSignupDto } from './dto/create-meta-embedded-signup.dto'
import {
  CreateMetaTemplateDto,
  MigrateMetaTemplatesDto,
  UpdateMetaTemplateDto,
} from './dto/meta-template.dto'
import { RegisterPhoneNumberDto } from './dto/register-phone.dto'

@ApiTags('Meta')
@ApiBearerAuth('access-token')
@Controller('meta')
@UseGuards(AdminAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class MetaController {
  constructor(
    private readonly metaService: MetaService,
    private readonly metaTemplateService: MetaTemplateService,
    private readonly metaCoexistenceSyncService: MetaCoexistenceSyncService
  ) {}

  @Post('embedded-signup/initiate')
  @ApiOperation({
    summary: 'Initiate Meta embedded signup',
    description:
      'Creates or updates an embedded signup record and returns config for frontend use.',
  })
  @ApiOkResponse({ description: 'Embedded signup initiated successfully' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async initiateEmbeddedSignup(@Body() body: CreateMetaEmbeddedSignupDto) {
    return this.metaService.initiateEmbeddedSignup(body)
  }

  @Post('embedded-signup/complete')
  @ApiOperation({
    summary: 'Complete Meta embedded signup',
    description:
      'Exchanges the one-time authorization code on the server, validates ownership, subscribes the WABA, and registers the phone number.',
  })
  @ApiOkResponse({ description: 'Embedded signup completed successfully' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async completeEmbeddedSignup(@Body() body: CompleteMetaEmbeddedSignupDto) {
    return this.metaService.completeEmbeddedSignup(body)
  }

  @Post('embedded-signup/:institutionId/retry')
  @ApiOperation({ summary: 'Retry recoverable Meta provisioning steps' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async retryEmbeddedSignup(@Param('institutionId', ParseIntPipe) institutionId: number) {
    return this.metaService.retryEmbeddedSignup(institutionId)
  }

  @Get('embedded-signup/:institutionId')
  @ApiOperation({
    summary: 'Get embedded signup by institution ID',
    description: 'Fetches embedded signup data for a specific institution.',
  })
  @ApiOkResponse({ description: 'Embedded signup retrieved successfully' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async getEmbeddedSignup(@Param('institutionId', ParseIntPipe) institutionId: number) {
    return this.metaService.findByInstitutionId(institutionId)
  }

  @Get('system-user/phone-numbers')
  @ApiOperation({
    summary: 'Get phone numbers for a WABA using system user token or institution credentials',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async getSystemUserPhoneNumbers(
    @Query('wabaId') wabaId: string,
    @Query('institutionId') institutionId?: string,
    @Query('systemUserToken') systemUserToken?: string
  ) {
    return this.metaService.getSystemUserPhoneNumbers(
      wabaId,
      institutionId ? Number(institutionId) : undefined,
      systemUserToken
    )
  }

  @Post('system-user/connect')
  @ApiOperation({
    summary: 'Connect a phone number using system user token',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async connectSystemUser(@Body() body: ConnectSystemUserDto) {
    await this.metaService.connectSystemUser(
      body.institutionId,
      body.wabaId,
      body.phoneNumberId,
      body.pin,
      body.systemUserToken
    )
    return { success: true }
  }

  @Post('register-phone-number')
  @ApiOperation({
    summary: 'Register or re-register a WhatsApp phone number with Meta Cloud API',
    description:
      'Registers the connected phone number on Meta WhatsApp Cloud API with a 6-digit PIN to resolve (#133010) Account not registered.',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async registerPhoneNumber(@Body() body: RegisterPhoneNumberDto) {
    await this.metaService.registerConnectedPhoneNumber(body.institutionId, body.pin)
    return {
      success: true,
      message: 'Phone number registered successfully with Meta Cloud API.',
    }
  }

  @Get('coexistence/:institutionId/sync-status')
  @ApiOperation({ summary: 'Get Meta coexistence synchronization checkpoints' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async getCoexistenceSyncStatus(@Param('institutionId', ParseIntPipe) institutionId: number) {
    return this.metaCoexistenceSyncService.getStatus(institutionId)
  }

  @Post('coexistence/:institutionId/sync')
  @ApiOperation({ summary: 'Trigger Meta coexistence synchronization' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async triggerCoexistenceSync(@Param('institutionId', ParseIntPipe) institutionId: number) {
    await this.metaService.triggerCoexistenceSync(institutionId)
    return { success: true }
  }

  @Get('templates')
  @ApiOperation({ summary: 'List synchronized Meta WhatsApp templates for an institution' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async listTemplates(@Query('institutionId', ParseIntPipe) institutionId: number) {
    return this.metaTemplateService.list(institutionId)
  }

  @Post('templates/sync')
  @ApiOperation({ summary: 'Synchronize Meta WhatsApp templates from the institution WABA' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async syncTemplates(@Query('institutionId', ParseIntPipe) institutionId: number) {
    return this.metaTemplateService.sync(institutionId)
  }

  @Post('templates/migrate')
  @ApiOperation({ summary: 'Migrate Meta WhatsApp templates from another WABA' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async migrateTemplates(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Body() body: MigrateMetaTemplatesDto
  ) {
    await this.metaTemplateService.migrate(institutionId, body.sourceWabaId)
    return { success: true }
  }

  @Post('templates')
  @ApiOperation({ summary: 'Create and submit a Meta WhatsApp template for review' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async createTemplate(@Body() body: CreateMetaTemplateDto) {
    return this.metaTemplateService.create(body)
  }

  @Put('templates/:templateId')
  @ApiOperation({ summary: 'Update a Meta WhatsApp template' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async updateTemplate(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Body() body: UpdateMetaTemplateDto
  ) {
    return this.metaTemplateService.update(templateId, body)
  }

  @Delete('templates/:templateId')
  @ApiOperation({ summary: 'Delete a Meta WhatsApp template language variant' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async deleteTemplate(
    @Param('templateId', ParseIntPipe) templateId: number,
    @Query('institutionId', ParseIntPipe) institutionId: number
  ) {
    await this.metaTemplateService.delete(templateId, institutionId)
    return { success: true }
  }
}
