import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileFieldsInterceptor } from '@nestjs/platform-express'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { StudentAuthGuard } from '@/common/guards/student-auth.guard'
import { ClassMaterialsService } from '@/domain/service/class-materials.service'
import { StudentSubmissionService } from '@/domain/service/student-submission.service'
import { RequireParam } from '@/models/enums'
import { User } from '@/models/user.entity'

import { StudentMaterialsDto } from './dto/student-submission.dto'

@ApiBadRequestResponse({
  description: 'This response may be when the request is in wrong format or value is out of range',
})
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiUnauthorizedResponse({
  description: "This is because the token is expired or user haven't login yet",
})
@ApiTags('Student Submission')
@Controller('submission')
export class StudentSubmissionController {
  constructor(
    private readonly classMaterialsService: ClassMaterialsService,
    private readonly studentSubmissionService: StudentSubmissionService
  ) {}

  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(StudentAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'This api for user use to create student submission',
  })
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
  @ApiConsumes('multipart/form-data')
  @Post('create-submission')
  async uploadStudentMaterials(
    @CurrentUser() user: User,
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Body('studentLessonId') studentLessonId: string,
    @UploadedFile('files')
    files: {
      files?: Express.Multer.File[]
    }
  ) {
    const dto = {
      studentId: user.id.toString(),
      studentLessonId,
    } as StudentMaterialsDto
    return this.studentSubmissionService.uploadStudentMaterialsSync(institutionId, dto, files.files)
  }

  @UseGuards(StudentAuthGuard)
  @ApiBearerAuth('access-token')
  @Get(':jobId/status')
  @ApiOperation({
    summary: 'This api for student use to get student submission status',
  })
  async getMaterialsStatus(@CurrentUser() user: User, @Param('jobId') jobId: string) {
    const progress = await this.classMaterialsService.getMaterialsStatus(jobId)
    if (progress && progress.userId !== user.id) {
      throw new ForbiddenException('Access denied')
    }
    return progress
  }

  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(StudentAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'This api for student use to remove student submission',
  })
  @Delete(':materialId/delete')
  async removeStudentMaterial(
    @CurrentUser() user: User,
    @Param('materialId') materialId: number,
    @Query('institutionId', ParseIntPipe) institutionId: number
  ) {
    return this.studentSubmissionService.removeStudentMaterial(institutionId, materialId, user.id)
  }
}

