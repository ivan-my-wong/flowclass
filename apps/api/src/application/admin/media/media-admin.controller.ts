import {
  Controller,
  Get,
  HttpCode,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { Public } from '@/common/decorators/public.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { ObjectStorageProvider } from '@/config/storage/object-storage.provider'
import {
  MediaFileDirectory,
  StorageImageUploadInterceptor,
  StorageTargetDirectory,
  UploadedStorageFile,
} from '@/config/storage/storage-image-upload-interceptor'
import { RequireParam } from '@/models/enums/'

import { CreateMediaDto } from '../../../modules/media/dto/media.dto'
import { schema } from '../../../modules/media/dto/media.swagger.schema'
import { MediaService } from '../../../modules/media/media.service'

@ApiResponse({
  description: 'This response when system error.',
  status: 500,
})
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@ApiTags('Media API')
@Controller('media')
export class MediaAdminController {
  public constructor(
    private readonly mediaService: MediaService,
    private readonly objectStorageProvider: ObjectStorageProvider
  ) {}

  @ApiBadRequestResponse({
    description:
      'This response may be when the request is in wrong format or value is out of range',
  })
  @ApiUnprocessableEntityResponse({
    description: 'This response when ,request body invalidate.',
  })
  @ApiUnauthorizedResponse({
    description: 'This is because the token is expired or user havent login yet',
  })
  @ApiOperation({
    summary:
      'This api for user use to upload their image and receive an image url, the limit file size is 2MB',
  })
  @ApiOkResponse({
    description: 'Successfully uploaded image',
  })
  @ApiCreatedResponse({
    description: 'Successfully uploaded image',
    schema,
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiBearerAuth('access-token')
  @ApiQuery({ name: 'directory', enum: MediaFileDirectory })
  @RequireParams(RequireParam.INSTITUTION_ID, RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  @Post('upload')
  @UseInterceptors(StorageImageUploadInterceptor(StorageTargetDirectory.MEDIA))
  public async uploadFile(
    @UploadedFile() file: UploadedStorageFile,
    @Query('siteId') siteId: number,
    @Query('institutionId') institutionId: number
  ) {
    const dto: CreateMediaDto = {
      fileName: file.key,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
      url: file.key,
      siteId,
      institutionId,
    }
    const media = await this.mediaService.createMedia(dto)
    return media
  }

  @ApiOperation({
    summary: 'This api for get private object access url',
  })
  // @ApiOkResponse({
  //   schema: deleteClassSchema,
  // })
  @Public()
  @HttpCode(200)
  @Get('object-access-url')
  async getObjectAccessUrl(@Query('key') key: string) {
    return this.objectStorageProvider.getObjectAccessUrl(key)
  }
}
