import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { Public } from '@/common/decorators/public.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import {
  StorageImageUploadInterceptor,
  StorageTargetDirectory,
  UploadedStorageFile,
} from '@/config/storage/storage-image-upload-interceptor'
import { RequireParam } from '@/models/enums/'
import { CreateMediaDto } from '@/modules/media/dto/media.dto'
import { schema } from '@/modules/media/dto/media.swagger.schema'
import { MediaService } from '@/modules/media/media.service'

@ApiResponse({
  description: 'This response when system error.',
  status: 500,
})
@ApiTags('Media API')
@Public()
@Controller('media')
export class MediaStudentController {
  public constructor(private readonly mediaService: MediaService) {}

  @ApiBadRequestResponse({
    description:
      'This response may be when the request is in wrong format or value is out of range',
  })
  @ApiUnprocessableEntityResponse({
    description: 'This response when request body invalidate.',
  })
  @ApiUnauthorizedResponse({
    description: 'This is because the token is expired or user havent login yet',
  })
  @ApiOperation({
    operationId: 'studentMediaUploadAiImage',
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
  // @ApiBearerAuth('access-token')
  @Post('upload-ai')
  @RequireParams(RequireParam.USER_ID)
  @UseInterceptors(StorageImageUploadInterceptor(StorageTargetDirectory.AI_TOOL))
  public async uploadFile(@UploadedFile() file: UploadedStorageFile) {
    const dto: CreateMediaDto = {
      fileName: file.key,
      size: file.size,
      mimeType: file.mimetype,
      originalName: file.originalname,
      url: file.key,
    }

    const media = await this.mediaService.createMedia(dto)
    return media
  }
}
