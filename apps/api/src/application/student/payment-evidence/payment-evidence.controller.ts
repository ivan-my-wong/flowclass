import {
  Body,
  Controller,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiExtraModels,
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

import { CurrentInstitution } from '@/common/decorators/current-institution.decorator'
import { CurrentSite } from '@/common/decorators/current-site.decorator'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { StudentAuthGuard } from '@/common/guards/student-auth.guard'
import {
  StorageImageUploadInterceptor,
  StorageTargetDirectory,
  UploadedStorageFile,
} from '@/config/storage/storage-image-upload-interceptor'
import { PaymentEvidenceService } from '@/domain/service/payment-evidence.service'
import { RequireParam } from '@/models/enums/'
import { Institution } from '@/models/institutions.entity'
import { Site } from '@/models/site.entity'
import { User } from '@/models/user.entity'

import { StudentCreatePaymentEvidenceDto } from './dto/create-payment-evidence.dto'
import { StudentPaymentEvidenceDto } from './dto/payment-evidence.dto'
import { paymentEvidenceSchema } from './dto/payment-evidence.schema'

@ApiTags('Student Payment Evidence')
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
@Controller('payment-evidence')
export class PaymentEvidenceController {
  constructor(private readonly paymentEvidenceService: PaymentEvidenceService) {}

  @ApiExtraModels(StudentPaymentEvidenceDto)
  @Post()
  @UseGuards(StudentAuthGuard)
  @ApiBearerAuth('access-token')
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    operationId: 'studentPaymentEvidenceCreate',
    summary: 'This api for student upload payment evidence by logged in.',
  })
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
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (
          req: Express.Request,
          file: Express.Multer.File,
          cb: (error: Error | null, destination: string) => void
        ) => {
          const uploadPath = process.env.FILE_UPLOAD_LOCATION
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
  @ApiOkResponse({
    schema: paymentEvidenceSchema,
  })
  async create(
    @Body() createPaymentEvidenceDto: StudentCreatePaymentEvidenceDto,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() currentUser: User,
    @CurrentSite() currentSite: Site,
    @CurrentInstitution() currentInstitution: Institution
  ): Promise<StudentPaymentEvidenceDto> {
    return await this.paymentEvidenceService.create(
      createPaymentEvidenceDto,
      file,
      currentUser,
      currentSite,
      currentInstitution
    )
  }

  // by token
  @Post('token')
  @RequireParams(RequireParam.SITE_ID, RequireParam.INSTITUTION_ID, RequireParam.TOKEN)
  @UseGuards(RequireParamsGuard)
  @ApiOperation({
    operationId: 'studentPaymentEvidenceCreateByToken',
    summary: 'This api for student upload payment evidence by token provided.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiOkResponse({
    schema: paymentEvidenceSchema,
  })
  @UseInterceptors(StorageImageUploadInterceptor(StorageTargetDirectory.PAYMENT_EVIDENCE))
  createByToken(
    @Body() createPaymentEvidenceDto: StudentCreatePaymentEvidenceDto,
    @UploadedFile() file: UploadedStorageFile,
    @Query('token') token: string,
    @Query('siteId') siteId: number,
    @Query('institutionId') institutionId: number
  ): Promise<StudentPaymentEvidenceDto> {
    return this.paymentEvidenceService.createByToken(
      createPaymentEvidenceDto,
      file,
      siteId,
      institutionId,
      token
    )
  }
}
