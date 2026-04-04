import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { CurrentInstitution } from '@/common/decorators/current-institution.decorator'
import { CurrentSite } from '@/common/decorators/current-site.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { BundleDiscountsService } from '@/domain/service/bundle-discounts.service'
import { RequireParam, Role } from '@/models/enums/'
import { Institution } from '@/models/institutions.entity'
import { Site } from '@/models/site.entity'

import {
  BundleDiscountAvailabilityResponse,
  BundleDiscountsObject,
  BundleDiscountsPageOptionDto,
  CheckAvailabilityBundleDiscountDto,
  CreateBundleDiscountDto,
  UpdateBundleDiscountDto,
} from './dto/bundle-discounts.dto'
import { couponSchema } from './dto/coupon.schema'

@ApiTags('Bundles')
@Controller('bundle-discounts')
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
export class BundleDiscountsController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly bundleDiscountsService: BundleDiscountsService) { }

  @Get()
  @ApiOperation({
    summary: 'This api for coupon use to list all bundle discounts.',
  })
  @ApiOkResponse({
    schema: couponSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  findAll(@Query() pageOptionsDto: BundleDiscountsPageOptionDto) {
    return this.bundleDiscountsService.findAll(pageOptionsDto)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'This api for coupon use to list all bundle discounts.',
  })
  @ApiOkResponse({
    schema: couponSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  findById(@Param('id') id: number) {
    return this.bundleDiscountsService.findById(id)
  }

  @Post('create')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api use to create coupon.',
    description: 'When you want to set unlimited coupon please set quito = -1',
  })
  @ApiBody({
    type: CreateBundleDiscountDto,
    examples: {
      allItemsPercentage: {
        summary: 'All Items - Percentage Discount',
        value: {
          siteId: 1,
          institutionId: 1,
          name: 'Summer Promo',
          discountType: 'percentage',
          amount: 30,
          minQty: 3,
          // bundleTable: [
          //   { minQty: 3, amount: 10 },
          //   { minQty: 5, amount: 20 }
          // ],
          isAllItems: true,
          isAutoApply: true,
          isRetroactive: false,
          startDate: '2025-07-01T00:00:00Z',
          endDate: '2025-07-31T23:59:59Z',
        },
      },
      specificItemsFixed: {
        summary: 'Specific Items - Fixed Amount Discount',
        value: {
          siteId: 1,
          institutionId: 1,
          name: 'Exam Bundle',
          discountType: 'fixedAmount',
          amount: 30000,
          minQty: 3,
          // bundleTable: [
          //   { minQty: 3, amount: 10 },
          //   { minQty: 5, amount: 20 }
          // ],
          isAllItems: false,
          applicableItemIds: [1, 2, 3],
          isAutoApply: true,
          isRetroactive: true,
          startDate: '2025-09-01T00:00:00Z',
          endDate: '2025-09-30T23:59:59Z',
        },
      },
      openCampaign: {
        summary: 'Ongoing Discount without End Date',
        value: {
          siteId: 1,
          institutionId: 1,
          name: 'Unlimited Deal',
          discountType: 'percentage',
          amount: 30000,
          minQty: 3,
          // bundleTable: [
          //   { minQty: 3, amount: 10 },
          //   { minQty: 5, amount: 20 }
          // ],
          isAllItems: true,
          isAutoApply: false,
          isRetroactive: false,
          startDate: '2025-08-01T00:00:00Z',
          endDate: null,
        },
      },
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error for create bundle discount.',
    schema: {
      example: {
        message: [
          { siteId: ['isNumber'] },
          { institutionId: ['isNumber'] },
          { discountType: ['isEnum'] },
        ],
        statusCode: 422,
        errorCode: 'UNPROCESSABLE_ENTITY',
      },
    },
  })
  create(
    @Body() dto: CreateBundleDiscountDto,
    @CurrentInstitution() institution: Institution,
    @CurrentSite() site: Site
  ): Promise<BundleDiscountsObject> {
    return this.bundleDiscountsService.create({
      dto,
      institutionId: institution.id,
      siteId: site.id,
    })
  }

  @Patch('update')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.BUNDLE_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api use to update bundle.',
  })
  @ApiBody({
    type: UpdateBundleDiscountDto,
    examples: {
      updateOnlyTable: {
        summary: 'Update Only Bundle Table',
        value: {
          siteId: 1,
          institutionId: 1,
          amount: 30000,
          minQty: 3,
          // bundleTable: [
          //   { minQty: 3, amount: 10 },
          //   { minQty: 5, amount: 20 }
          // ],
        },
      },
      updateNameAndTable: {
        summary: 'Update Name and Discount Table',
        value: {
          name: 'Updated Promo July',
          bundleTable: [{ amount: 4, discount: 10000 }],
        },
      },
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error for update bundle discount.',
    schema: {
      example: {
        message: [
          { siteId: ['isNumber'] },
          { institutionId: ['isNumber'] },
          { discountType: ['isEnum'] },
        ],
        statusCode: 422,
        errorCode: 'UNPROCESSABLE_ENTITY',
      },
    },
  })
  update(
    @Query('bundleId') id: string,
    @Body() updateBundleDto: UpdateBundleDiscountDto
  ): Promise<BundleDiscountsObject> {
    return this.bundleDiscountsService.update(+id, updateBundleDto)
  }

  @Delete('delete')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.BUNDLE_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api use to delete coupon.',
  })
  remove(@Query('bundleId') id: number): Promise<BundleDiscountsObject> {
    return this.bundleDiscountsService.remove(id)
  }

  @Post('apply-to-invoice/retroactive/:invoiceId')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({ summary: 'Apply applicable bundle discounts to an invoice (retroactively).' })
  @ApiResponse({
    status: 200,
    description: 'Bundle discount applied successfully (or skipped if not applicable).',
    schema: {
      example: {
        id: 123,
        userId: 456,
        courseId: 789,
        discountAmount: 15000,
        discountDetails: [
          {
            bundleId: 1,
            name: 'Buy 3 Get 10% Off',
            type: 'percentage',
            amount: 15000,
          },
        ],
        payAmount: 85000,
        createdAt: '2025-08-01T10:00:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Invoice not found or bundle discount logic failed.',
  })
  @ApiQuery({ name: 'institutionId', required: true, type: Number })
  @ApiQuery({ name: 'siteId', required: true, type: Number })
  async applyToRetroactiveInvoice(
    @Param('invoiceId') invoiceId: number,
    @Query('siteId') siteId: number,
    @Query('institutionId') institutionId: number
  ) {
    return this.bundleDiscountsService.applyBundleDiscountsToInvoiceRetroactive(
      invoiceId,
      siteId,
      institutionId
    )
  }

  @Post('check-eligible')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'Check which bundle discounts are applicable based on provided course IDs.',
  })
  @ApiBody({
    type: CheckAvailabilityBundleDiscountDto,
    examples: {
      correctPayload: {
        summary: 'Invoice Eligible to Apply Bundle Discounts',
        description: 'Invoice Eligible to Apply Bundle Discounts with provided minimum courses',
        value: {
          siteId: 1,
          institutionId: 1,
          bundleId: 1,
          courseIds: [1, 2],
        },
      },
    },
  })
  @ApiUnprocessableEntityResponse({
    description: 'Validation error for check bundle discount availability.',
    schema: {
      example: {
        message: [
          { siteId: ['isNumber'] },
          { institutionId: ['isNumber'] },
          { courseIds: ['isNumber'] },
        ],
        statusCode: 422,
        errorCode: 'UNPROCESSABLE_ENTITY',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Eligible bundle discounts returned successfully.',
    schema: {
      example: [
        {
          bundleId: 1,
          name: 'Exam Bundle',
          courseUsed: [
            { id: 3081, name: 'Mathematics Advanced' },
            { id: 3082, name: 'English Writing' },
            { id: 3083, name: 'Science Fundamentals' },
            { id: 3084, name: 'History Basics' },
          ],
          minAdditionalCoursesNeeded: 2,
          totalPaymentDone: 1500000,
        },
      ],
    },
  })
  @ApiBadRequestResponse({
    description: 'Failed to check bundle availability.',
  })
  @ApiOkResponse({
    type: BundleDiscountAvailabilityResponse,
    isArray: true,
  })
  async checkAvailability(@Body() dto: CheckAvailabilityBundleDiscountDto) {
    return this.bundleDiscountsService.checkAvailability(dto)
  }
}
