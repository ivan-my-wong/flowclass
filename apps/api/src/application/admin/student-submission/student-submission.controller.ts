import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { Response } from 'express'

import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { ParseJson } from '@/common/decorators/parse-json.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { StudentSubmissionService } from '@/domain/service/student-submission.service'
import { ClassLessonWithStudentLessons } from '@/models/custom-types/student-lessons'
import { RequireParam, Role } from '@/models/enums/'
import { StudentSubmissions } from '@/models/student-submission.entity'
import { User } from '@/models/user.entity'

import {
  MaterialSearchParamsDto,
  PaginationParamsDto,
} from '../class-materials/dto/search-params.dto'

import { BulkUploadTeacherFeedbackDto } from './dto/student-submission.dto'

@ApiTags('Admin Student Submission')
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
@Controller('student-submission')
export class AdminStudentSubmissionController {
  constructor(private readonly studentSubmissionService: StudentSubmissionService) {}

  @Get('list')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for master admin use to get student submission materials',
  })
  async findStudentSubmission(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Query() params: MaterialSearchParamsDto & PaginationParamsDto
  ): Promise<{
    data: StudentSubmissions[]
    total: number
  }> {
    return this.studentSubmissionService.getMaterialsList(institutionId, params)
  }

  @Get('list-by-lesson')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for master admin use to get student submission materials',
  })
  async findStudentSubmissionByLesson(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Query() params: MaterialSearchParamsDto & PaginationParamsDto
  ): Promise<{
    data: ClassLessonWithStudentLessons[]
    total: number
  }> {
    const data = await this.studentSubmissionService.getStudentSubmissionsListByLesson(
      institutionId,
      params
    )
    return data
  }

  @Delete('material/:materialId')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @ApiOperation({
    summary: 'This api for master admin use to delete student submission material',
  })
  async removeStudentMaterial(
    @Param('materialId') materialId: number,
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Query('studentSubmissionId') studentSubmissionId?: string,
    @Query('teacherFeedbackId') teacherFeedbackId?: string
  ) {
    if (!studentSubmissionId && !teacherFeedbackId) {
      throw new BadRequestException('Student submission id or teacher feedback id is required')
    }
    if (teacherFeedbackId) {
      return this.studentSubmissionService.removeTeacherFeedback(
        institutionId,
        materialId,
        +teacherFeedbackId
      )
    }
    return this.studentSubmissionService.removeStudentMaterialByAdmin(
      institutionId,
      materialId,
      +studentSubmissionId
    )
  }

  @Get(':studentSubmissionId/bulk-download')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @ApiOperation({
    summary: 'This api for master admin use to bulk download student submission materials',
  })
  async bulkDownloadStudentMaterials(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('studentSubmissionId', ParseIntPipe) studentSubmissionId: number,
    @Res() res: Response
  ) {
    const file = await this.studentSubmissionService.bulkDownloadStudentMaterials(
      institutionId,
      studentSubmissionId
    )
    res.setHeader('Content-Type', file.mimeType)
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`)
    res.send(file.content)
  }

  @Get(':classLessonId/bulk-download-by-lesson')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @ApiOperation({
    summary: 'This api for master admin use to bulk download student submission materials',
  })
  async bulkDownloadStudentMaterialsByLesson(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('classLessonId', ParseIntPipe) classLessonId: number,
    @Res() res: Response
  ) {
    const file = await this.studentSubmissionService.bulkDownloadStudentSubmissionsByLesson(
      institutionId,
      classLessonId
    )
    res.setHeader('Content-Type', file.mimeType)
    res.setHeader('Content-Disposition', `attachment; filename="${file.fileName}"`)
    res.send(file.content)
  }

  @Post(':studentLessonId/upload-feedback')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
  @ApiConsumes('multipart/form-data')
  @RequireParams(RequireParam.INSTITUTION_ID)
  @ApiOperation({
    summary: 'This api for master admin use to upload feedback',
  })
  async uploadFeedback(
    @CurrentUser() user: User,
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('studentLessonId') studentLessonId: string,
    @UploadedFile('files')
    files: {
      files?: Express.Multer.File[]
    }
  ) {
    return this.studentSubmissionService.uploadTeacherFeedbackSync(
      user.id,
      institutionId,
      +studentLessonId,
      files.files
    )
  }

  @Post(':classLessonId/bulk-upload-feedback')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
  @ApiConsumes('multipart/form-data')
  @RequireParams(RequireParam.INSTITUTION_ID)
  @ApiOperation({
    summary: 'This api for master admin use to bulk upload feedback for multiple students',
  })
  async bulkUploadFeedback(
    @CurrentUser() user: User,
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Param('classLessonId', ParseIntPipe) classLessonId: number,
    @Body('notificationSettings', ParseJson) notificationSettings: Record<string, any>,
    @Body('fileStudentMap', ParseJson) fileStudentMap: Record<string, string[]>,
    @UploadedFile('files')
    files: {
      files?: Express.Multer.File[]
    }
  ) {
    const dto = {
      classLessonId,
      notificationSettings,
      fileStudentMap,
    } as BulkUploadTeacherFeedbackDto
    return this.studentSubmissionService.bulkUploadTeacherFeedbackSync(
      user.id,
      institutionId,
      dto,
      files.files
    )
  }
}
