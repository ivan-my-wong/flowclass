import { Body, Controller, Post, UseGuards } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { Transactional } from 'typeorm-transactional'

import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { successSchema } from '@/models/schemas/success.schema'
import { User } from '@/models/user.entity'

import { SitesService } from '../../../domain/service/sites.service'

import { RegisterSiteDto } from './dto/register-site.dto'

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
export class SiteRegisterController {
  constructor(private readonly sitesService: SitesService) {}

  @Post('register')
  @ApiOperation({
    summary: 'This api for user who has account in flowclass to use create for them site.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @Transactional()
  registerSite(@Body() registerSiteDto: RegisterSiteDto, @CurrentUser() user: User) {
    return this.sitesService.registerSite(registerSiteDto, user)
  }
}
