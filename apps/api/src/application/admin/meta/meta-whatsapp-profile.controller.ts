import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { MetaWhatsAppProfileService } from '@/domain/external/meta/meta-whatsapp-profile.service'
import { Role } from '@/models/enums'

import { UpdateMetaWhatsAppProfileDto } from './dto/update-meta-whatsapp-profile.dto'

@ApiTags('Meta WhatsApp Profile')
@ApiBearerAuth('access-token')
@Controller('meta/whatsapp/profile')
@UseGuards(AdminAuthGuard, RolesGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class MetaWhatsAppProfileController {
  constructor(private readonly profileService: MetaWhatsAppProfileService) {}

  @Get()
  @ApiOperation({
    summary: 'Get WhatsApp Business Profile from Meta Cloud API',
    description:
      'Fetches public profile fields (about, address, description, email, websites, vertical, profile_picture_url) directly from Meta Graph API.',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async getProfile(@Query('institutionId') institutionId: string) {
    return this.profileService.getProfile(Number(institutionId))
  }

  @Put()
  @ApiOperation({
    summary: 'Update WhatsApp Business Profile via Meta Cloud API',
    description:
      'Updates public profile fields on Meta Graph API. Profile picture cannot be updated directly via this endpoint.',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async updateProfile(
    @Query('institutionId') institutionId: string,
    @Body() dto: UpdateMetaWhatsAppProfileDto
  ) {
    return this.profileService.updateProfile(Number(institutionId), dto)
  }
}
