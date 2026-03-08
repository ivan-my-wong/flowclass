// eslint-disable-next-line simple-import-sort/imports
import { Controller, Get, ParseArrayPipe, ParseIntPipe, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { CurrentClassEntity } from '@/common/decorators/current-class-entity.decorator'
import { Public } from '@/common/decorators/public.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { StudentAuthGuard } from '@/common/guards/student-auth.guard'
import { RecurringSchedulesService } from '@/domain/service/course-recurring-schedules.service'
import { ClassEntity } from '@/models/classes.entity'
import { RequireParam } from '@/models/enums/'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: `This is because the token is expired or user haven't login yet`,
})
@ApiTags('RecurringLessons')
@UseGuards(StudentAuthGuard)
@ApiBearerAuth('access-token')
@Controller('recurring-lessons')
export class RecurringLessonsController {
  constructor(private readonly recurringSchedulesService: RecurringSchedulesService) {}
  @Public()
  @ApiOperation({
    operationId: 'studentRecurringLessonsGetStarting',
    description: 'This api for user use to get recurring starting lessons',
  })
  @Get('starting-lessons')
  async getStartingLessons(
    @Query('ids', new ParseArrayPipe({ items: Number, separator: ',' }))
    ids: number[],
    @Query('siteId', new ParseIntPipe())
    siteId: number,
    @Query('institutionId', new ParseIntPipe())
    institutionId: number,
    @Query('numberOfLessons', new ParseIntPipe())
    numberOfLessons: number
  ): Promise<any> {
    return this.recurringSchedulesService.getStartingLessons(
      ids,
      siteId,
      institutionId,
      numberOfLessons
    )
  }

  @Public()
  @ApiOperation({
    operationId: 'studentRecurringLessonsGetSingleClass',
    description: 'This api for user use to preview the single class of recurring lessons',
  })
  @RequireParams(RequireParam.CLASS_ID)
  @UseGuards(RequireParamsGuard)
  @Get('single-class-recurring-lessons')
  async getSingleClassRecurringLessons(
    @Query('date') date: string,
    @Query('lessonDateId', new ParseIntPipe()) lessonDateId: number,
    @Query('classId', new ParseIntPipe()) classId: number,
    @CurrentClassEntity() classEntity: ClassEntity,
    @Query('priceOptionId') priceOptionId?: number
  ): Promise<string[]> {
    return this.recurringSchedulesService.previewRecurringLessons(
      date,
      classEntity,
      lessonDateId,
      priceOptionId
    )
  }
}
