import { Controller, Get, Param, Query } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { getSiteSchema } from '@/application/admin/sites/dto/site.schema'
import { Public } from '@/common/decorators/public.decorator'
import { InstitutionsService } from '@/domain/service/institutions.service'
import { SitesService } from '@/domain/service/sites.service'

import { StudentSiteMapDto } from './dto/site-map.dto'
import { StudentGetSingleSiteDTO } from './dto/sites-student.dto'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: `This is because the token is expired or user haven't login yet`,
})
@ApiTags('Student Sites')
@Public()
@Controller('sites')
export class SitesStudentController {
  constructor(
    private readonly sitesService: SitesService,
    private readonly institutionService: InstitutionsService
  ) {}

  @ApiOperation({
    operationId: 'studentSitesDetailGet',
    summary: 'This api for user use to get the detail of a site by domain',
  })
  @ApiOkResponse({
    schema: getSiteSchema,
  })
  @Get('detail')
  async getAllCourse(@Query() { domain }: StudentGetSingleSiteDTO) {
    return this.sitesService.findOneByDomain(domain)
  }

  @ApiOperation({
    operationId: 'studentSitesSiteMapGet',
    summary: 'This api for user to get the whole site map',
  })
  @Get('siteMap')
  async getSiteMap(): Promise<StudentSiteMapDto[]> {
    return this.sitesService.getSiteMap()
  }

  // Tell swagger to allow me to enter params when testing
  @ApiParam({
    name: 'domain',
    description: 'The domain to get the site map for',
    type: String,
  })
  @ApiOperation({
    operationId: 'studentSitesSiteMapGetByDomain',
    summary: 'This api for user to get the site map of a particular domain',
  })
  @Get('siteMap/:domain')
  async getSiteMapByDomain(@Param('domain') domain: string): Promise<StudentSiteMapDto[]> {
    return this.sitesService.getSiteMapByDomain(domain)
  }

  @ApiOperation({
    operationId: 'studentSitesCustomDomainDetailGet',
    summary: 'This api for user use to get the site detail by custom domain',
  })
  @ApiOkResponse({
    schema: getSiteSchema,
  })
  @Get('custom-domain/detail')
  async getSiteByCustomDomain(@Query() { domain }: StudentGetSingleSiteDTO) {
    return this.sitesService.findOneByCustomDomain(domain)
  }
}
