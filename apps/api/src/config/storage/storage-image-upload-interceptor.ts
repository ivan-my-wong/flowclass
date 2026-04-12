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
import { existsSync, mkdirSync } from 'fs'
import { diskStorage } from 'multer'
import * as path from 'path'
import { Observable } from 'rxjs'

import { InstitutionErrorMessage } from '@/exceptions/error-message/institution'

import { ObjectStorageProvider } from './object-storage.provider'

export enum StorageTargetDirectory {
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

export const PrivateStorageDirectoryMap = {
  [StorageTargetDirectory.PAYMENT_EVIDENCE]: true,
  [StorageTargetDirectory.INSTITUTION_GALLERY]: false,
  [MediaFileDirectory.SITE]: false,
  [MediaFileDirectory.INSTITUTION]: false,
  [MediaFileDirectory.COURSE]: false,
  [MediaFileDirectory.PAYMENT_METHOD]: true,
  [MediaFileDirectory.CUSTOM_FORM]: false,
}

export type UploadedStorageFile = Express.Multer.File & {
  key: string
}

export function StorageImageUploadInterceptor(
  target: StorageTargetDirectory
): Type<NestInterceptor> {
  @Injectable()
  class StorageImageUploadProvider extends ObjectStorageProvider implements NestInterceptor {
    constructor() {
      super()
    }

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
      try {
        const request = context.switchToHttp().getRequest()
        const siteId = (request?.site?.id ?? request?.query?.siteId)?.toString()
        const institutionId = (
          request?.institution?.id ?? request?.query?.institutionId
        )?.toString()
        const userId = request?.query.userId

        let filePath = ''
        const directory = request.query.directory

        switch (target) {
          case StorageTargetDirectory.AI_TOOL:
            filePath = `${target}/user-${userId}`
            break
          case StorageTargetDirectory.MEDIA:
            this.checkValidMediaDirectory(directory)
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
          case StorageTargetDirectory.INSTITUTION_GALLERY:
          case StorageTargetDirectory.PAYMENT_EVIDENCE:
            if (!institutionId) {
              throw new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
            }
            filePath = `${target}/institution-${institutionId}`
            break
          default:
            throw new InternalServerErrorException(`Unsupported value for StorageTargetDirectory`)
        }

        const interceptor = new (FileInterceptor('file', {
          storage: diskStorage({
            destination: (req, file, cb) => {
              const uploadRoot =
                process.env.FILE_UPLOAD_LOCATION || path.resolve(process.cwd(), '__uploads')
              const destinationPath = path.resolve(uploadRoot, filePath)
              if (!existsSync(destinationPath)) {
                mkdirSync(destinationPath, { recursive: true })
              }
              cb(null, destinationPath)
            },
            filename: (req, file, cb) => {
              const fileExtension = file.originalname.split('.').pop() || 'png'
              cb(null, `${randomUUID()}.${fileExtension}`)
            },
          }),
          limits: {
            fileSize: 1024 * 1024 * 10,
          },
          fileFilter: (req, file, cb) => {
            const validExtensions = /\.(jpg|jpeg|png|webp|svg|heic|heif)$/i
            if (!file.originalname.match(validExtensions)) {
              return cb(new Error('INVALID_IMAGE_FORMAT'), false)
            }

            const validMimeTypes = [
              'image/jpeg',
              'image/png',
              'image/webp',
              'image/svg+xml',
              'image/heic',
              'image/heif',
              'application/octet-stream',
            ]

            if (file.originalname.match(/\.(heic|heif)$/i)) {
              if (file.mimetype && !validMimeTypes.includes(file.mimetype)) {
                console.warn(
                  `HEIC file with unexpected MIME type: ${file.mimetype} for file: ${file.originalname}`
                )
              }
            }

            cb(null, true)
          },
        }))()

        const handlerObservable = await interceptor.intercept(context, next)
        const uploadedFile = request.file as UploadedStorageFile
        if (uploadedFile?.filename) {
          uploadedFile.key = `${filePath}/${uploadedFile.filename}`.replace(/\\/g, '/')
        }
        return handlerObservable
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

  return StorageImageUploadProvider
}
