import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  NestInterceptor,
  PayloadTooLargeException,
  Type,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { randomUUID } from 'crypto'
import * as multerS3 from 'multer-s3'
import { Observable } from 'rxjs'

import { InstitutionErrorMessage } from '@/exceptions/error-message/institution'

import { S3ClientFactory } from './s3-factory.provider'

export enum S3TargetDirectory {
  PAYMENT_EVIDENCE = 'payment-evidence',
  MEDIA = 'media',
  INSTITUTION_GALLERY = 'institution-gallery',
  AI_TOOL = 'ai-tool',
}

export enum MediaFileDirectory {
  SITE = 'site',
  INSTITUTION = 'institution',
  COURSE = 'course',
  PAYMENT_METHOD = 'payment-method',
  AI_TOOL = 'ai-tool',
  CUSTOM_FORM = 'custom-form',
}

export const S3PrivateBucket = {
  [S3TargetDirectory.PAYMENT_EVIDENCE]: true,
  [S3TargetDirectory.INSTITUTION_GALLERY]: false,
  [MediaFileDirectory.SITE]: false,
  [MediaFileDirectory.INSTITUTION]: false,
  [MediaFileDirectory.COURSE]: false,
  [MediaFileDirectory.PAYMENT_METHOD]: true,
  [MediaFileDirectory.CUSTOM_FORM]: false,
}

export function S3ImageUploadInterceptor(target: S3TargetDirectory): Type<NestInterceptor> {
  @Injectable()
  class S3ImageUploadProvider extends S3ClientFactory implements NestInterceptor {
    constructor() {
      super()
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      try {
        const request = context.switchToHttp().getRequest()
        const siteId = request?.site?.id.toString()
        const institutionId = request?.institution?.id.toString()
        const userId = request?.query.userId

        let filePath = ''
        let isPrivateBucket = false
        const directory = request.query.directory

        switch (target) {
          case S3TargetDirectory.AI_TOOL:
            isPrivateBucket = true
            filePath = `${target}/user-${userId}`
            break
          case S3TargetDirectory.MEDIA:
            // here deal with the image uploaded from the media controller

            this.checkValidMediaDirectory(directory)
            isPrivateBucket = S3PrivateBucket[directory]
            if (directory === MediaFileDirectory.SITE) {
              if (!siteId) {
                throw new BadRequestException('SITE_ID_IS_REQUIRED')
              }
              filePath = `${directory}/site-${siteId}`
              break
            }
            if (!institutionId) {
              throw new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
            }

            filePath = `${directory}/institution-${institutionId}`
            break
          case S3TargetDirectory.INSTITUTION_GALLERY:
          case S3TargetDirectory.PAYMENT_EVIDENCE:
            if (!institutionId) {
              throw new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
            }
            isPrivateBucket = S3PrivateBucket[target]
            filePath = `${target}/institution-${institutionId}`
            break
          default:
            throw new InternalServerErrorException(`Unsupport value for S3TargetDirectory`)
        }

        const interceptor = new (FileInterceptor('file', {
          storage: multerS3({
            s3: this.getS3Client() as any,
            bucket: isPrivateBucket ? this.privateBucketName : this.bucketName,
            metadata: (req: any, file, cb) => {
              cb(null, {
                // ...req.body, // only save the necessary metadata
                institutionId,
                siteId,
              })
            },
            key: (req, file, cb) => {
              const fileExtension = file.originalname.split('.').pop()
              cb(null, `${filePath}/${randomUUID()}.${fileExtension}`)
            },
          }),
          limits: {
            fileSize: 1024 * 1024 * 50, // Increased to 50 MB
          },
          fileFilter: (req, file, cb) => {
            // Check file extension (added pdf, gif, bmp, tiff)
            const validExtensions = /\.(jpg|jpeg|png|webp|svg|heic|heif|pdf|gif|bmp|tiff)$/i
            if (!file.originalname.match(validExtensions)) {
              return cb(new Error('INVALID_FILE_FORMAT'), false) // changed error message
            }

            cb(null, true)
          },
        }))()

        ;(await interceptor.intercept(context, next)) as Observable<any>
        return next.handle()
      } catch (error) {
        const err = error as any
        if (err.code === 'LIMIT_FILE_SIZE') {
          throw new PayloadTooLargeException('FILE_SIZE_EXCEEDS_LIMIT')
        }
        throw new BadRequestException(err.message)
      }
    }

    checkValidMediaDirectory(directory: MediaFileDirectory) {
      if (!directory) {
        throw new BadRequestException('DIRECTORY_IS_REQUIRED')
      }
      if (!Object.values(MediaFileDirectory).includes(directory)) {
        throw new BadRequestException(`NOT FOUND DIRECTORY WITH ID: ${directory}`)
      }
    }
  }

  return S3ImageUploadProvider
}

// passing value to the interceptor reference
// https://www.programcreek.com/typescript/?api=@nestjs/platform-express.FileInterceptor
// https://ithelp.ithome.com.tw/articles/10194169
