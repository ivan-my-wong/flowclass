import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFiles,
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

import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { ClassMaterialsService } from '@/domain/service/class-materials.service'
import { ClassMaterials } from '@/models/class-materials.entity'
import { RequireParam, Role } from '@/models/enums/'
import { User } from '@/models/user.entity'

import {
  SendClassMaterialDto,
  UpdateClassMaterialsStudentExpiryDto,
  UpdateMediaMaterialExpiryDto,
} from './dto/class-materials.dto'
import { MaterialSearchParamsDto, PaginationParamsDto } from './dto/search-params.dto'

@ApiTags('Admin Class Materials')
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
@Controller('class-materials')
export class ClassMaterialsController {
  constructor(private readonly classMaterialsService: ClassMaterialsService) {}

  @Get('list')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for master admin use to get class materials',
  })
  async findClassMaterials(
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Query() params: MaterialSearchParamsDto & PaginationParamsDto
  ): Promise<{
    data: ClassMaterials[]
    total: number
  }> {
    return this.classMaterialsService.getListMaterials(institutionId, params)
  }

  @Post('create-sync')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: 'This api for master admin use to create class materials',
  })
  async createClassMaterials(
    @Body('classLessonId', ParseIntPipe) classLessonId: number,
    @Body('classId', ParseIntPipe) classId: number,
    @Body('courseId', ParseIntPipe) courseId: number,
    @Body('mediaMaterials') mediaMaterials: string,
    @UploadedFiles() files: { files?: Express.Multer.File[] },
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @CurrentUser() user: User
  ) {
    const dto = {
      classLessonId,
      classId,
      courseId,
      mediaMaterials: JSON.parse(mediaMaterials),
    }

    return this.classMaterialsService.createClassMaterialsSync(
      user.id,
      institutionId,
      dto,
      files.files
    )
  }

  @Get(':jobId/status')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for master admin use to get class materials status',
  })
  async getMaterialsStatus(@Param('jobId') jobId: string) {
    return this.classMaterialsService.getMaterialsStatus(jobId)
  }

  @Post(':classMaterialsId/send-notification')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for master admin use to send notification to students',
  })
  async sendNotificationToStudents(
    @Param('classMaterialsId', ParseIntPipe) classMaterialsId: number,
    @Body() payload: SendClassMaterialDto
  ) {
    return this.classMaterialsService.sendNotificationToStudents(classMaterialsId, payload)
  }

  @Put(':classMaterialsId/:mediaMaterialId/expiry')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for master admin use to update media material expiry date',
  })
  async updateMediaMaterialExpiry(
    @Param('classMaterialsId', ParseIntPipe) classMaterialsId: number,
    @Param('mediaMaterialId', ParseIntPipe) mediaMaterialId: number,
    @Body() payload: UpdateMediaMaterialExpiryDto,
    @Query('institutionId', ParseIntPipe) institutionId: number
  ) {
    return this.classMaterialsService.updateMediaMaterialExpiry(
      classMaterialsId,
      mediaMaterialId,
      payload.expiryDate,
      institutionId
    )
  }

  @Put(':classMaterialsId/student/expiry-date')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'Update material access expiry for a student (applies to entire lesson)',
  })
  async updateClassMaterialsStudentExpiry(
    @Param('classMaterialsId', ParseIntPipe) classMaterialsId: number,
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @Body() payload: UpdateClassMaterialsStudentExpiryDto
  ) {
    return this.classMaterialsService.updateMaterialExpiryForStudent(
      classMaterialsId,
      institutionId,
      payload
    )
  }

  @Delete(':classMaterialsId/:mediaMaterialId')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for master admin use to delete media material',
  })
  async deleteMediaMaterial(
    @Param('classMaterialsId', ParseIntPipe) classMaterialsId: number,
    @Param('mediaMaterialId', ParseIntPipe) mediaMaterialId: number,
    @Query('institutionId', ParseIntPipe) institutionId: number,
    @CurrentUser() user: User
  ) {
    return this.classMaterialsService.deleteMediaMaterial(
      classMaterialsId,
      mediaMaterialId,
      institutionId,
      user.id
    )
  }
}
