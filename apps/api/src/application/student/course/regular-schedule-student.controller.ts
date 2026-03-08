import { Controller, Get, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { Public } from '@/common/decorators/public.decorator'
import { StudentAuthGuard } from '@/common/guards/student-auth.guard'
import { ClassRegularSchedulesV2Service } from '@/domain/service/class-regular-schedules.service'

import {
  GetRegularSchedulePreviewDto,
  RegularSchedulePreviewResponseDto,
} from './dto/regular-schedules.dto'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: `This is because the token is expired or user haven't login yet`,
})
@ApiTags('StudentRegularSchedules')
@UseGuards(StudentAuthGuard)
@ApiBearerAuth('access-token')
@Controller('regular-schedules')
export class StudentRegularSchedulesController {
  constructor(private readonly classRegularSchedulesV2Service: ClassRegularSchedulesV2Service) {}

  @Public()
  @ApiOperation({
    operationId: 'studentRegularSchedulesPreview',
    description: 'Get preview of regular schedule lessons for public access',
  })
  @Get('preview')
  async getRegularSchedulePreview(
    @Query() query: GetRegularSchedulePreviewDto
  ): Promise<RegularSchedulePreviewResponseDto> {
    const { scheduleId, startingScheduleIndex, previewPeriodCount } = query
    return await this.classRegularSchedulesV2Service.getRegularSchedulePreview(
      scheduleId,
      startingScheduleIndex,
      previewPeriodCount
    )
  }
}
