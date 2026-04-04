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
  ApiBearerAuth,
  ApiBody,
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
import { PackageDiscountsService } from '@/domain/service/package-discounts.service'
import { RequireParam, Role } from '@/models/enums/'
import { Institution } from '@/models/institutions.entity'
import { Site } from '@/models/site.entity'

import {
  CreatePackageDiscountDto,
  PackageDiscountsPageOptionDto,
  UpdatePackageDiscountDto,
} from './dto/package-discounts.dto'

@ApiTags('Package Discounts')
@Controller('package-discounts')
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
export class PackageDiscountsController {
  constructor(private readonly packageDiscountsService: PackageDiscountsService) {}

  @Get()
  @ApiOperation({ summary: 'List all package discounts.' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  findAll(@Query() pageOptionsDto: PackageDiscountsPageOptionDto) {
    return this.packageDiscountsService.findAll(pageOptionsDto)
  }

  @Get('by-class/:classId')
  @ApiOperation({ summary: 'Get active package discounts applicable to a specific class.' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  findByClassId(
    @Param('classId') classId: number,
    @Query('siteId') siteId: number,
    @Query('institutionId') institutionId: number
  ) {
    return this.packageDiscountsService.findByClassId(classId, siteId, institutionId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a package discount by ID.' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  findById(@Param('id') id: number) {
    return this.packageDiscountsService.findById(id)
  }

  @Post('create')
  @ApiOperation({ summary: 'Create a new package discount.' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiBody({
    type: CreatePackageDiscountDto,
    examples: {
      allClasses: {
        summary: 'Apply to all classes',
        value: {
          siteId: 1,
          institutionId: 1,
          name: 'Monthly Full Package',
          amountPerLesson: 5000,
          isAllClasses: true,
          startDate: '2026-04-01T00:00:00Z',
          endDate: '2026-04-30T23:59:59Z',
        },
      },
      specificClasses: {
        summary: 'Apply to specific classes',
        value: {
          siteId: 1,
          institutionId: 1,
          name: 'Math Package Deal',
          amountPerLesson: 10000,
          isAllClasses: false,
          applicableClassIds: [1001, 1002, 1003],
          startDate: '2026-04-01T00:00:00Z',
          endDate: '2026-04-30T23:59:59Z',
        },
      },
    },
  })
  create(
    @Body() dto: CreatePackageDiscountDto,
    @CurrentInstitution() institution: Institution,
    @CurrentSite() site: Site
  ) {
    return this.packageDiscountsService.create({
      dto,
      institutionId: institution.id,
      siteId: site.id,
    })
  }

  @Patch('update')
  @ApiOperation({ summary: 'Update a package discount.' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @ApiQuery({ name: 'packageDiscountId', required: true, type: Number })
  update(@Query('packageDiscountId') id: string, @Body() dto: UpdatePackageDiscountDto) {
    return this.packageDiscountsService.update(+id, dto)
  }

  @Delete('delete')
  @ApiOperation({ summary: 'Delete a package discount.' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @ApiQuery({ name: 'packageDiscountId', required: true, type: Number })
  remove(@Query('packageDiscountId') id: number) {
    return this.packageDiscountsService.remove(id)
  }

  @Patch(':id/toggle-status')
  @ApiOperation({ summary: 'Toggle package discount active/inactive status.' })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  toggleStatus(@Param('id') id: number) {
    return this.packageDiscountsService.toggleStatus(id)
  }
}
