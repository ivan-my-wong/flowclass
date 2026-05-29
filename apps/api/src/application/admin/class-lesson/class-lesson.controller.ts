import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { ApiResult } from '@/common/api-formats/api-result'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { ClassLessonService } from '@/domain/service/class-lesson.service'
import { Role } from '@/models/enums/'

import { CreateClassLessonDto, UpdateClassLessonDto } from './dto/create-class-lesson.dto'
import {
  CheckNextRecurringLessonDTO,
  DetailListClassLessonDto,
  UpdateLessonInstructorDTO,
  UpdateLessonLocationRoomDTO,
} from './dto/detail-list-class-lesson.dto'
import {
  BulkUpdateSharedVideoDto,
  ListClassLessonDto,
  ListStudentsWithPage,
} from './dto/list-class-lesson.dto'

@Controller('class-lesson')
@ApiTags('Class Lesson')
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
export class ClassLessonController {
  constructor(private readonly classLessonService: ClassLessonService) {}

  @Post()
  @ApiOperation({
    summary: 'This api for creating class lesson',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  async create(@Body() body: CreateClassLessonDto) {
    const result = await this.classLessonService.create(body)
    return new ApiResult().success(result)
  }

  @Get()
  @ApiOperation({
    summary: 'This api for get list class lesson',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  async getList(@Query() query: ListClassLessonDto) {
    const result = await this.classLessonService.getList(query)
    return new ApiResult().success(result)
  }

  @Patch('bulk-update-shared-video')
  @ApiOperation({
    summary: 'Bulk update has_shared_video for all student lessons in given class lessons',
  })
  @ApiOkResponse({ type: ApiResult })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  async bulkUpdateSharedVideo(@Body() body: BulkUpdateSharedVideoDto) {
    await this.classLessonService.bulkUpdateSharedVideo(body.classLessonIds, body.hasSharedVideo, body.studentLessonIds)
    return new ApiResult().success(null)
  }

  @Get('lessons-matrix')
  @ApiOperation({
    summary: 'This api for get list class lesson',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  async getListLessonMatrix(@Query() query: ListClassLessonDto) {
    const result = await this.classLessonService.getListLessonMatrix(query)
    return new ApiResult().success(result)
  }

  @Delete(':id')
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api use to delete lesson.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  async remove(@Param('id') id: number) {
    const result = await this.classLessonService.remove(id)
    return new ApiResult().success(result)
  }

  @Get(':id')
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api use to get detail lesson.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  async getDetail(@Param('id') id: number, @Query() query: DetailListClassLessonDto) {
    const result = await this.classLessonService.getClassLessonDetail(id)
    return new ApiResult().success(result)
  }

  @Get(':id/students')
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api use to get list of student that already registered at a lesson.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  async getListStudentsLesson(
    @Param('id') lessonId: number,
    @Query() query: ListStudentsWithPage,
    @Query('withUnpaid') withUnpaid: string
  ) {
    query.withUnpaid = withUnpaid === 'true'
    return this.classLessonService.getListStudent(lessonId, query)
  }

  @Put(':id/update-time')
  @ApiOperation({
    summary: 'This api for updating class lesson',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  async updateTimeLesson(@Param('id') id: number, @Body() body: UpdateClassLessonDto) {
    await this.classLessonService.updateTimeLesson(id, body)
    return new ApiResult().success()
  }

  @Patch(':id/delay-lessons')
  @ApiOperation({
    summary: 'This api for delay following class lessons',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  async delayFollowingLessons(@Param('id') id: number) {
    const result = await this.classLessonService.delayFollowingLesson(id)
    return new ApiResult().success(result)
  }

  @Patch('available/next-lesson')
  @ApiOperation({
    summary: 'This api for check next recurring lesson date or time',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  async checkNextRecurringLesson(@Body() payload: CheckNextRecurringLessonDTO) {
    const result = await this.classLessonService.getNextRecurringLesson(payload)
    return new ApiResult().success(result)
  }

  @Get(':studentLessonId/proof-token')
  @ApiOperation({
    summary: 'This api for get proof token of current student lesson',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  @ApiParam({
    type: Number,
    name: 'studentLessonId',
    description: 'ID of student lesson',
  })
  async getProofTokenOfInvoiceLesson(@Param('studentLessonId') studentLessonId: number) {
    const result = await this.classLessonService.getProofTokenOfInvoiceLesson(studentLessonId)
    return new ApiResult().success(result)
  }

  @Get('check-attendance-changes/:institutionId')
  @ApiOperation({
    summary: 'Check if there are any attendance changes in the institution',
  })
  @ApiOkResponse({
    type: ApiResult,
    description: 'Returns true if there are attendance changes, false otherwise',
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  @ApiParam({
    type: Number,
    name: 'institutionId',
    description: 'ID of institution',
  })
  async checkAttendanceChanges(@Param('institutionId') institutionId: number) {
    return await this.classLessonService.checkAttendanceChanges(institutionId)
  }

  @Put(':id/location-room')
  @ApiOperation({
    summary: 'This api for updating location room of class lesson',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  async updateLessonLocationRoom(
    @Param('id') id: number,
    @Body() body: UpdateLessonLocationRoomDTO
  ) {
    const result = await this.classLessonService.updateLessonLocationRoom(id, body)
    return new ApiResult().success(result)
  }

  @Put(':id/instructor')
  @ApiOperation({
    summary: 'This api for updating instructor of class lesson',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  async updateLessonInstructor(@Param('id') id: number, @Body() body: UpdateLessonInstructorDTO) {
    const result = await this.classLessonService.updateLessonInstructor(id, body)
    return new ApiResult().success(result)
  }

  @Get('check/conflict')
  @ApiOperation({
    summary: 'This api for checking conflict lesson',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  async checkConflict(@Query() query: ListClassLessonDto) {
    delete query.startDate
    delete query.endDate
    const result = await this.classLessonService.checkConflict(query)
    return new ApiResult().success(result)
  }
}
