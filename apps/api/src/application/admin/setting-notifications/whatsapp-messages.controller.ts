import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'

import {
  AddLessonEmailDTO,
  ApplicationLinkEmailDTO,
  ChangeLessonEmailDTO,
  ChangeLessonWtsDTO,
  SendWtsDTO,
} from '@/application/admin/setting-notifications/setting-notifications.dto'
import { ActionTypeLessonWts } from '@/common/constants/whatsappTemplate'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { EmailService } from '@/domain/external/email.service'
import { APIResponse } from '@/domain/external/email-transport.provider'
import { WhatsappService } from '@/domain/external/whatsapp.service'
import { Role } from '@/models/enums/'
import { User } from '@/models/user.entity'

@ApiTags('Institution notification')
@Controller('notification-reminder')
@UseGuards(AdminAuthGuard)
// @Public()
@ApiBearerAuth('access-token')
@UseInterceptors(ClassSerializerInterceptor)
export class WhatsappMessagesController {
  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly emailService: EmailService
  ) {}

  @Post('send')
  @ApiOperation({
    summary:
      'This api for master admin, site manager, institution manager to test the whatsapp reminder.',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  // @UseGuards(RolesGuard)
  // @RequireParams(RequireParam.INSTITUTION_ID)
  // @UseGuards(RequireParamsGuard)
  async sendWhatsappMessage(
    // @Query('institutionId') id: number,
    @Body() sendWtsDTO: SendWtsDTO,
    @CurrentUser() user: User
  ) {
    await this.whatsappService.sendWhatsappMessage(sendWtsDTO, user.id)
  }

  @Post('send-application-link-email')
  @ApiOperation({
    summary:
      'This api for master admin, site manager, institution manager to send generated application link to student.',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async sendApplicationLink(
    @Body() applicationLinkEmailDTO: ApplicationLinkEmailDTO
  ): Promise<void | APIResponse> {
    return await this.emailService.sendStudentApplicationLinkEmail(applicationLinkEmailDTO)
  }

  @Post('send-add-lesson-email')
  @ApiOperation({
    summary:
      'This api for master admin, site manager, institution manager to send add lesson notification to student.',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async sendAddLessonEmail(
    // @Query('institutionId') id: number,
    @Body() addLessonEmailDTO: AddLessonEmailDTO
  ): Promise<void | APIResponse> {
    return await this.emailService.sendStudentAddLessonEmail(addLessonEmailDTO)
  }

  @Post('send-change-lesson-email')
  @ApiOperation({
    summary:
      'This api for master admin, site manager, institution manager to send change lesson notification to student by email.',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async sendChangeLessonEmail(@Body() changeLessonEmailDto: ChangeLessonEmailDTO) {
    return await this.emailService.sendStudentChangeLessonEmail(changeLessonEmailDto)
  }

  @Post('send-change-lesson-wts')
  @ApiOperation({
    summary:
      'This api for master admin, site manager, institution manager to send change lesson notification to student by WhatsApp.',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async sendChangeLessonWts(@Body() changeLessonWtsDto: ChangeLessonWtsDTO) {
    return await this.whatsappService.sendChangeAddLessonWts(
      changeLessonWtsDto,
      ActionTypeLessonWts.CHANGE_LESSON
    )
  }

  @Post('send-add-lesson-wts')
  @ApiOperation({
    summary:
      'This api for master admin, site manager, institution manager to send add lesson notification to student by WhatsApp.',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  async sendAddLessonWts(@Body() addLessonWtsDto: AddLessonEmailDTO) {
    return await this.whatsappService.sendChangeAddLessonWts(
      addLessonWtsDto,
      ActionTypeLessonWts.ADD_LESSON
    )
  }
}
