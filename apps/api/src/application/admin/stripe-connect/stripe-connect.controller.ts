import { Body, Controller, Get, Post, Query, Req, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiBody,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import Stripe from 'stripe'

import { CurrentInstitution } from '@/common/decorators/current-institution.decorator'
import { Public } from '@/common/decorators/public.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { StripeConnectService } from '@/domain/external/stripe-connect.service'
import { RequireParam, Role } from '@/models/enums/'
import { Institution } from '@/models/institutions.entity'
import { StripeConnect } from '@/models/stripe-connect.entity'
import { StripeConnectRepository } from '@/models/stripe-connect.repository'

import {
  CreateBillingPortalLinkResponse,
  CreateLoginLinkDto,
  CreateLoginLinkResponse,
  CreateStripeConnectDto,
  CreateStripeConnectResponse,
  StripeExpressAccountResponse,
} from './dto/create-stripe-connect.dto'
import { EnableStripeDto } from './dto/enable-stripe.dto'
import { StripeWebhookResponse } from './dto/stripe-connect.dto'
import {
  createBillingPortalLinkSchema,
  createLinkLoginExpressDashboardSchema,
  createStripeConnectSchema,
  getExpressAccountDetailSchema,
  stripeConnectRepositorySchema,
} from './dto/stripe-connect.schema'
import { StripeConnectDetailDto } from './dto/stripe-connect-detail.dto'

@ApiTags('Stripe Connects')
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
@Controller('stripe-connects')
export class StripeConnectController {
  constructor(
    private readonly stripeConnectService: StripeConnectService,
    private readonly stripeConnectRepository: StripeConnectRepository
  ) {}
  @ApiExtraModels(CreateStripeConnectResponse, CreateLoginLinkResponse)
  @Post()
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for institution manager use to create link connect to Stripe.',
  })
  @ApiOkResponse({
    schema: createStripeConnectSchema,
  })
  create(
    @Body() createStripeConnectDto: CreateStripeConnectDto
  ): Promise<CreateStripeConnectResponse> {
    return this.stripeConnectService.create(createStripeConnectDto)
  }

  @Post('express-dashboard')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary:
      'This api for institution manager use to create link login to Express Dashboard of Stripe.',
  })
  @ApiOkResponse({
    schema: createLinkLoginExpressDashboardSchema,
  })
  createLinkLogin(
    @Body() createLoginLinkDto: CreateLoginLinkDto
  ): Promise<CreateLoginLinkResponse> {
    return this.stripeConnectService.createLinkLogin(createLoginLinkDto)
  }

  @Get('billing-portal')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiExtraModels(CreateBillingPortalLinkResponse)
  @ApiQuery({ name: 'institutionId', type: Number })
  @ApiOperation({
    summary: 'This api for institution manager use to create link access billing portal of Stripe.',
  })
  @ApiOkResponse({
    schema: createBillingPortalLinkSchema,
  })
  createBillingPortalLink(
    @CurrentInstitution() institution: Institution
  ): Promise<Stripe.Response<Stripe.BillingPortal.Session>> {
    return this.stripeConnectService.createBillingPortalLink(institution)
  }

  @Get('account-detail')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiQuery({ name: 'institutionId', type: Number })
  @ApiExtraModels(StripeExpressAccountResponse)
  @ApiOperation({
    summary:
      'This api for site manager and institution manager use to get account detail from stripe.',
  })
  @ApiOkResponse({
    schema: getExpressAccountDetailSchema,
  })
  getExpressAccountDetail(@CurrentInstitution() institution: Institution): Promise<Stripe.Account> {
    return this.stripeConnectService.getExpressAccountDetail(institution)
  }

  @Get('stripe-connect-detail')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiQuery({ name: 'institutionId', type: Number })
  @ApiExtraModels(StripeConnectDetailDto)
  @ApiOperation({
    summary:
      'This api for site manager and institution manager use to get stripe connect repository detail from stripe.',
  })
  @ApiOkResponse({
    schema: stripeConnectRepositorySchema,
  })
  getStripeConnectDetail(@CurrentInstitution() institution: Institution): Promise<StripeConnect> {
    return this.stripeConnectRepository.findOneBy({
      institutionId: institution.id,
    })
  }

  @Post('create-account')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiQuery({ name: 'institutionId', type: Number })
  @ApiOperation({
    summary: 'This api for master admin use to create express account for school from stripe.',
  })
  @ApiOkResponse({
    schema: stripeConnectRepositorySchema,
  })
  createExpressAccount(@CurrentInstitution() institution: Institution): Promise<StripeConnect> {
    return this.stripeConnectService.createConnectAccount(institution)
  }

  @Post('create-customer-account')
  @Roles(Role.MASTER_ADMIN)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiQuery({ name: 'institutionId', type: Number })
  @ApiOperation({
    summary: 'This api for master admin use to create customer account for school from stripe.',
  })
  @ApiOkResponse({
    schema: stripeConnectRepositorySchema,
  })
  createCustomerAccount(
    @CurrentInstitution() institution: Institution
  ): Promise<StripeConnect | null> {
    return this.stripeConnectService.createCustomerAccount(institution)
  }

  @Post('enabled')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiQuery({ name: 'institutionId', type: Number })
  @ApiOperation({
    summary:
      'This api for institution manager and master admin use to enable or disable stripe as student payment option.',
  })
  @ApiOkResponse({
    schema: stripeConnectRepositorySchema,
  })
  enableStripe(
    @CurrentInstitution() institution: Institution,
    @Body() enableStripeDto: EnableStripeDto
  ): Promise<StripeConnect> {
    return this.stripeConnectService.enableStripe(institution.id, enableStripeDto)
  }

  @Post('webhook')
  @ApiBody({
    schema: {
      type: 'object',
    },
  })
  @ApiOperation({
    summary: 'This api for stripe to send events.',
  })
  @Public()
  webhook(@Req() req, @Body() body: any): Promise<StripeWebhookResponse> {
    return this.stripeConnectService.webhook(req, body)
  }

  @Get('session-status')
  @Public()
  getSessionStatus(
    @Query('session_id') sessionId: string,
    @Query('institution_id') institutionId: string
  ) {
    return this.stripeConnectService.retrieveSession(Number(institutionId), sessionId)
  }
}
