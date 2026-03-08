import { Body, Controller, Delete, Get, Patch, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { PageMetaDto } from '@/common/pagination/page-meta.dto'
import { SitesService } from '@/domain/service/sites.service'
import { RequireParam, Role } from '@/models/enums/'
import { InviteMember } from '@/models/invite-member.entity'
import { successSchema } from '@/models/schemas/success.schema'
import { Site } from '@/models/site.entity'
import { User } from '@/models/user.entity'

import { AssignSiteManagerDto } from './dto/assign-site-manager.dto'
import { CreateSiteDto, CreateSiteResponse, SiteResponse } from './dto/create-site.dto'
import { InviteSiteMemberDto } from './dto/invite-site-member.dto'
import {
  createSiteSchema,
  deleteSiteSchema,
  getAllSiteSchema,
  getSiteSchema,
  updateSiteSchema,
} from './dto/site.schema'
import { SiteDetailDto } from './dto/site-detail.dto'
import { SitePageDto, SitePageOptionDto } from './dto/site-pagination.dto'
import { UpdateSiteDto } from './dto/update-site.dto'

@ApiTags('Sites')
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
@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}
  @Get()
  @ApiOperation({
    summary: 'This api for master admin use to get sites',
  })
  @ApiOkResponse({
    schema: getAllSiteSchema,
  })
  findAll(
    @Query() pageOptionsDto: SitePageOptionDto,
    @CurrentUser() user: User
  ): Promise<SitePageDto | Site[]> {
    return this.sitesService.findAll(pageOptionsDto, user)
  }

  @ApiExtraModels(CreateSiteResponse, SiteDetailDto, PageMetaDto)
  @Post('/create')
  @Roles(Role.MASTER_ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for master admin use to create site and site manager.',
  })
  @ApiOkResponse({
    schema: createSiteSchema,
  })
  create(@Body() storeSiteDto: CreateSiteDto, @CurrentUser() user: User): Promise<SiteResponse> {
    return this.sitesService.create(storeSiteDto, user)
  }

  @Get('detail')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for master admin and site manager use to get a site by id',
  })
  @ApiOkResponse({
    schema: getSiteSchema,
  })
  findOne(@Query('siteId') id: string): Promise<SiteDetailDto> {
    return this.sitesService.findOne(+id)
  }

  @Patch('update')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for master admin and site manager use to update a site by id',
  })
  @ApiOkResponse({
    schema: updateSiteSchema,
  })
  update(
    @Query('siteId') id: string,
    @Body() updateSiteDto: UpdateSiteDto
  ): Promise<SiteDetailDto> {
    return this.sitesService.update(+id, updateSiteDto)
  }

  @Delete('delete')
  @Roles(Role.MASTER_ADMIN)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for master admin use to delete a site by id',
  })
  @ApiOkResponse({
    schema: deleteSiteSchema,
  })
  remove(@Query('siteId') id: string): Promise<SiteDetailDto> {
    return this.sitesService.remove(+id)
  }

  @Post('assign-manager')
  @ApiOperation({
    summary:
      'This api for master admin or site manager to use assign one member of site to be site manager of site.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  assignSiteManager(@Body() assignSiteManagerDto: AssignSiteManagerDto) {
    return this.sitesService.assignSiteManager(assignSiteManagerDto)
  }

  @Post('invite')
  @ApiOperation({
    summary:
      'This api for master admin or site manager to use invite new user to become site members with them role in site.',
    description: `
      - struct of body request:
        - email: this is for email of candidate
        - name: this is for name of candidate
        - phone: this is for phone of candidate
        - siteId: this is id of site you want to invite user
        - institutions: array of data relation to invite user
          - siteId: this is id of site you want to invite user
          - institutionId: this is id of institution you want to invite user (Note: set institutionId = 0 if you want invite user with role is site-manager)
          - role: this has value in (site-manager, institution-manager, operator, instructor)

      example for invite user to become site-manager:
      {
        "email": "user@example.com",
        "name": "Flowclass",
        "phone": "1234567890",
        "siteId": 1,
        "institutions": [
          {
            "siteId": 1,
            "institutionId": 0,
            "role": "site-manager"
          }
        ]
      }

      example for invite user to become institution-manager of institution 1 and operator of institution 2:
      {
        "email": "user@example.com",
        "name": "Flowclass",
        "phone": "1234567890",
        "siteId": 1,
        "institutions": [
          {
            "siteId": 1,
            "institutionId": 1,
            "role": "institution-manager"
          },
          {
            "siteId": 1,
            "institutionId": 2,
            "role": "operator"
          }
        ]
      }

      example for invite user to become instructor:
      {
        "email": "user@example.com",
        "name": "Flowclass",
        "phone": "1234567890",
        "siteId": 1,
        "institutions": [
          {
            "siteId": 1,
            "institutionId": 1,
            "role": "instructor"
          }
        ]
      }
    `,
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  async inviteMember(
    @Body() inviteSiteMemberDto: InviteSiteMemberDto,
    @CurrentUser() user: User
  ): Promise<InviteMember[]> {
    const res = await this.sitesService.inviteSiteMember(inviteSiteMemberDto, user)
    return res
  }
}
