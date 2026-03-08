// eslint-disable-next-line simple-import-sort/imports
import { ApiResult } from '@/common/api-formats/api-result'
import { DEFAULT_AI_CREDIT, DEFAULT_AI_CREDIT_MAX, UploadFile } from '@/common/constants'
import { CurrentInstitution } from '@/common/decorators/current-institution.decorator'
import { CurrentSite } from '@/common/decorators/current-site.decorator'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import {
  StorageImageUploadInterceptor,
  StorageTargetDirectory,
} from '@/config/storage/storage-image-upload-interceptor'
import { InstitutionErrorMessage } from '@/exceptions/error-message/institution'
import { SiteErrorMessage } from '@/exceptions/error-message/site'
import { RequireParam, Role } from '@/models/enums'
import { successSchema } from '@/models/schemas/success.schema'
import { Site } from '@/models/site.entity'
import { User } from '@/models/user.entity'

import { InstitutionsService } from '@/domain/service/institutions.service'
import { Institution } from '@/models/institutions.entity'

import { InstitutionDetailDto } from './dto/institution-detail.dto'
import { InstitutionPageDto, InstitutionPageOptionDto } from './dto/institution-pagination.dto'
import {
  CreateInstitutionDto,
  InviteInstitutionMemberDto,
  RemoveInstitutionMemberDto,
  UpdateInstitutionDto,
} from './dto/institution.dto'
import {
  createInstitutionSchema,
  deleteInstitutionSchema,
  getAllInstitutionSchema,
  getInstitutionSchema,
  getWorkflowSchema,
} from './dto/institution.schema'
import { RemoveGalleryDto } from './dto/remove-gallery.dto'
import { UpdateGalleryDto } from './dto/update-gallery.dto'
import { UploadGalleryDto } from './dto/upload-gallery.dto'

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiExtraModels,
  ApiHeader,
  ApiHeaders,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'
import { randomUUID } from 'crypto'
import { existsSync, mkdirSync } from 'fs'
import { diskStorage } from 'multer'
import { extname } from 'path'
import { CopyInstitutionDto } from './dto/copy-institution.dto'
import { WorkflowDto } from './dto/workflow.dto'

@ApiTags('Institutions')
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
@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Get()
  // @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  // @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary:
      'This api for master admin, site manager, institution manager use to get institutions.',
  })
  @ApiOkResponse({
    schema: getAllInstitutionSchema,
  })
  findAll(
    @Query('siteId') siteId: number,
    @Query() pageOptionsDto: InstitutionPageOptionDto,
    @CurrentUser() currentUser: User
  ): Promise<InstitutionPageDto> {
    return this.institutionsService.findAccessibleSchools(pageOptionsDto, currentUser)
  }

  @Get('all')
  @Roles(Role.MASTER_ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for master admin use to get all institutions.',
  })
  @ApiOkResponse({
    schema: getAllInstitutionSchema,
  })
  findAllMasterAdmin(@Query() filter: { siteId?: number }) {
    return this.institutionsService.findAll(filter)
  }

  @ApiExtraModels(InstitutionDetailDto)
  @Post('create')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for master admin and site manager use to create institution.',
  })
  @ApiHeader({
    name: 'site-id',
    required: true,
    schema: {
      type: 'number',
      default: 1,
    },
  })
  @ApiBody({
    type: CreateInstitutionDto,
  })
  @ApiOkResponse({
    schema: createInstitutionSchema,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', UploadFile.NUMBER_OF_FILES, {
      storage: diskStorage({
        destination: (
          req: Express.Request,
          file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void
        ) => {
          const uploadPath = process.env.FILE_UPLOAD_LOCATION
          // Create folder if doesn't exist
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true })
          }
          cb(null, uploadPath)
        },
        filename(req, file, cb) {
          cb(null, `${randomUUID()}${extname(file.originalname)}`)
        },
      }),
    })
  )
  async create(
    @Body() createInstitutionDto: CreateInstitutionDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @CurrentSite() currentSite: Site,
    @CurrentUser() user: User
  ): Promise<InstitutionDetailDto> {
    if (!currentSite) {
      throw new BadRequestException(SiteErrorMessage.SITE_NOT_FOUND)
    }
    createInstitutionDto.siteId = currentSite.id
    createInstitutionDto.aiCredit = DEFAULT_AI_CREDIT
    createInstitutionDto.aiCreditMax = DEFAULT_AI_CREDIT_MAX
    this.institutionsService.parseJSONData(createInstitutionDto)
    createInstitutionDto.email = user.email
    return this.institutionsService.create(createInstitutionDto, files, user)
  }

  @Get('detail')
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary:
      'This api for master admin, site manager, institution manager use to get institution by id.',
  })
  @ApiOkResponse({
    schema: getInstitutionSchema,
  })
  findOne(@Query('institutionId') id: string) {
    return this.institutionsService.findOne(+id)
  }

  @Patch('update')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary:
      'This api for master admin, site manager, institution manager use to update institution by id.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', UploadFile.NUMBER_OF_FILES, {
      storage: diskStorage({
        destination: (
          req: Express.Request,
          file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void
        ) => {
          const uploadPath = process.env.FILE_UPLOAD_LOCATION
          // Create folder if doesn't exist
          if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true })
          }
          cb(null, uploadPath)
        },
        filename(req, file, cb) {
          cb(null, `${randomUUID()}${extname(file.originalname)}`)
        },
      }),
    })
  )
  update(
    @Query('institutionId') id: string,
    @Body() updateInstitutionDto: UpdateInstitutionDto,
    @UploadedFiles() files: Array<Express.Multer.File>
  ) {
    this.institutionsService.parseJSONData(updateInstitutionDto)
    updateInstitutionDto.listFileDelete = updateInstitutionDto.deleteFiles?.split(',')

    return this.institutionsService.update(+id, updateInstitutionDto, files)
  }

  @Delete('delete')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for master admin and site manager use to remove institution by id.',
  })
  @ApiOkResponse({
    schema: deleteInstitutionSchema,
  })
  remove(@Query('institutionId') id: number): Promise<InstitutionDetailDto> {
    return this.institutionsService.remove(+id)
  }

  @Post('invite')
  @ApiOperation({
    summary:
      'This api for master admin or site manager or institution manager to use invite new user to become site members with them role in site.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  inviteMember(
    @Body() dto: InviteInstitutionMemberDto,
    @CurrentUser() user: User,
    @CurrentSite() site: Site,
    @CurrentInstitution() institution: Institution
  ) {
    return this.institutionsService.inviteInstitutionMember(dto, user, site, institution)
  }

  @Post('remove-member')
  @ApiOperation({
    summary:
      'This api for master admin or site manager or institution manager to delete user of institution.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  removeMember(
    @Body() dto: RemoveInstitutionMemberDto,
    @CurrentUser() user: User,
    @CurrentInstitution() site: Site,
    @CurrentInstitution() institution: Institution
  ) {
    if (dto.userId == user.id) {
      throw new BadRequestException(InstitutionErrorMessage.CANNOT_DELETE_CURRENT_USER)
    }
    return this.institutionsService.removeInstitutionMember(site, institution, dto.userId)
  }

  @Post('galleries')
  @ApiOperation({
    summary:
      'This api for master admin or site manager or institution manager to use upload gallery',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiHeaders([
    {
      name: 'site-id',
      required: true,
      schema: {
        type: 'number',
        default: 1,
      },
    },
    {
      name: 'institution-id',
      required: true,
      schema: {
        type: 'number',
        default: 1,
      },
    },
  ])
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(StorageImageUploadInterceptor(StorageTargetDirectory.INSTITUTION_GALLERY))
  uploadGallery(
    @Body() uploadGalleryDto: UploadGalleryDto,
    @UploadedFile() file: Express.Multer.File & { key: string },
    @CurrentInstitution() currentInstitution: Institution
  ) {
    return this.institutionsService.uploadGallery(uploadGalleryDto, file, currentInstitution)
  }

  @Post('galleries/update')
  @ApiOperation({
    summary:
      'This api for master admin or site manager or institution manager to use update gallery',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiHeaders([
    {
      name: 'institution-id',
      required: true,
      schema: {
        type: 'number',
        default: 1,
      },
    },
  ])
  updateGallery(
    @Body() updateGalleryDto: UpdateGalleryDto,
    @CurrentInstitution() currentInstitution: Institution
  ) {
    return this.institutionsService.updateGallery(updateGalleryDto, currentInstitution)
  }

  @Delete('galleries/delete')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for institution manager use to remove gallery by id.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  removeGallery(@Body() removeGalleryDto: RemoveGalleryDto) {
    return this.institutionsService.removeGallery(+removeGalleryDto.galleryId)
  }

  @Get(':id/courses-student')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.OPERATOR)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for get list course and student belong to institution',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  getListCourseAndStudent(@Param('id') id: number) {
    return this.institutionsService.getListCourseAndStudent(id)
  }

  @Get(':id/list-courses')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.OPERATOR)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for get list course and student belong to institution',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  getListCourse(@Param('id') id: number) {
    return this.institutionsService.getListCourse(id)
  }

  @Get(':id/list-students')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.OPERATOR)
  // @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for get list course and student belong to institution',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  getListStudent(
    @Param('id') id: number,
    @Query('limit') limit: string,
    @Query('page') page: string,
    @Query('search') search: string
  ) {
    return this.institutionsService.getListStudent(id, { limit, page, search })
  }

  @Get('demo-school')
  @ApiOperation({
    summary:
      'This api for master admin, site manager, institution manager use to get institutions by email.',
  })
  @ApiOkResponse({
    schema: getAllInstitutionSchema,
  })
  getDemoSchool(@Query('email') email: string): Promise<Institution[]> {
    return this.institutionsService.getDemoSchool(email)
  }

  @Post('copy')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    summary: 'This api for master admin and site manager use to copy institution by id.',
  })
  @ApiOkResponse({
    schema: deleteInstitutionSchema,
  })
  copyInstitution(@Body() payload: CopyInstitutionDto): Promise<Institution[]> {
    return this.institutionsService.copyInstitution(payload)
  }

  @Get('workflow')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiExtraModels(WorkflowDto)
  @ApiOperation({
    summary: 'This api for master admin, site manager, institution manager use to get workflow',
  })
  @ApiOkResponse({
    schema: getWorkflowSchema,
  })
  getWorkflow(@Query('institutionId') institutionId: number) {
    return this.institutionsService.getWorkflow(institutionId)
  }

  @Put('workflow')
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  updateWorkflow(@Query('institutionId') institutionId: number, @Body() payload: WorkflowDto) {
    return this.institutionsService.updateWorkflow(institutionId, payload)
  }
}
