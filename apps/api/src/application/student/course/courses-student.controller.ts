import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { paginateListCourse } from '@/application/admin/courses/dto/course.schema'
import { Public } from '@/common/decorators/public.decorator'
import { StudentAuthGuard } from '@/common/guards/student-auth.guard'
import { ClassService } from '@/domain/service/class.service'
import { ClassPriceOptionService } from '@/domain/service/class-price-option.service'
import { CoursesService } from '@/domain/service/courses.service'
import { InstitutionsService } from '@/domain/service/institutions.service'
import { InstitutionErrorMessage } from '@/exceptions/error-message/institution'

import {
  EmailVerificationDto,
  StudentGetAllCourseDTO,
  StudentGetSingleCourseDTO,
} from './dto/course.dto'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: `This is because the token is expired or user haven't login yet`,
})
@ApiTags('Student Courses')
@UseGuards(StudentAuthGuard)
@ApiBearerAuth('access-token')
@Controller('courses')
export class CoursesStudentController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly institutionService: InstitutionsService,
    private readonly classPriceOptionService: ClassPriceOptionService,
    private readonly classService: ClassService
  ) {}

  @ApiOperation({
    operationId: 'studentCourseGetAll',
    summary: 'This api for user use to get all courses of a institution by institutionId',
  })
  @ApiOkResponse({
    schema: paginateListCourse,
  })
  @Get()
  @Public()
  async getAllCourse(@Query() getCourseDto: StudentGetAllCourseDTO) {
    return this.coursesService.studentFindAllWithPaginate(getCourseDto)
  }

  @ApiOperation({
    operationId: 'studentCourseGetSingle',
    summary: 'This api for user use to get a single course by url',
  })
  @ApiOkResponse({
    schema: paginateListCourse,
  })
  @Get('detail')
  @Public()
  async getSingleCourse(@Query() getCourseDto: StudentGetSingleCourseDTO) {
    const institution = await this.institutionService.findOneByUrl(
      getCourseDto.domain,
      getCourseDto.institutionUrl
    )

    if (!institution) {
      return new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
    }

    const courseDetail = await this.coursesService.studentFindSingleCourse({
      siteId: institution.siteId,
      institutionId: institution.id,
      path: getCourseDto.courseUrl,
    })

    return courseDetail
  }

  @Get(':classId/price-options')
  @Public()
  @ApiOperation({ summary: 'Get available price options for a class' })
  async getClassPriceOptions(@Param('classId', ParseIntPipe) classId: number) {
    return this.classPriceOptionService.getByClassId(classId)
  }

  @Post('email-verification')
  @ApiOperation({
    summary: 'This api for user use to update requireEmailVerification section for a course',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
        },
      },
    },
  })
  @Public()
  async emailVerification(@Body() emailVerificationDto: EmailVerificationDto) {
    return this.coursesService.emailVerification(emailVerificationDto)
  }

  @Get('/:classId/time-slot-quota')
  @Public()
  @ApiOperation({ summary: 'Get per-time-slot quotas for a class (location & class quotas)' })
  async getLocationRoomTimeSlotQuota(@Param('classId', ParseIntPipe) classId: number) {
    return this.classService.getClassQuota(classId)
  }
}
