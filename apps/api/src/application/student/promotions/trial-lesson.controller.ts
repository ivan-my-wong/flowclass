import { Body, Controller, Post } from '@nestjs/common'
import {
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { ValidClassTrialLessonResult } from '@/application/admin/promotions/dto/trial-lesson.dto'
import { StudentCheckIsValidTrialLesson } from '@/application/student/enroll-courses/dto/enroll-course-pagination.dto'
import { StudentCheckAvailableTrialLessonDto } from '@/application/student/promotions/dto/trial-lesson.dto'
import { Public } from '@/common/decorators/public.decorator'
import { TrialLessonService } from '@/domain/service/trial-lesson.service'

@ApiTags('Trial-Lesson')
@Controller('trial-lesson')
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
@Public()
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiResponse({
  description: 'This response when system error.',
  status: 500,
})
export class TrialLessonController {
  constructor(private readonly trialLessonService: TrialLessonService) {}

  @Post('available')
  @Public()
  @ApiOperation({
    operationId: 'studentPromotionsTrialLessonAvailable',
    summary: 'This api use to get available trial lessons by course and class.',
  })
  getAvailableTrialLessons(@Body() dto: StudentCheckAvailableTrialLessonDto): Promise<any> {
    return this.trialLessonService.getAvailableTrialLesson(dto)
  }

  @Post('validate')
  @Public()
  @ApiOperation({
    operationId: 'studentPromotionsTrialLessonValidate',
    summary: 'This api use to get is student possible to use trial lesson',
  })
  validateTrialLessons(
    @Body() dto: StudentCheckIsValidTrialLesson
  ): Promise<ValidClassTrialLessonResult> {
    return this.trialLessonService.validateTrialLesson(dto)
  }
}
