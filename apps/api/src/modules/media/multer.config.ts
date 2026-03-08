// Multer configuration
import { HttpException, HttpStatus } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Express } from 'express'
import { existsSync, mkdirSync } from 'fs'
import { diskStorage } from 'multer'
import { extname } from 'path'
const maxUploadFileSize = parseInt(process.env.FILE_UPLOAD_MAX_FILE_SIZE)

// Multer upload options
export const multerOptions = {
  // Enable file size limits
  limits: {
    fileSize: maxUploadFileSize,
  },
  // Check the mimetype to allow for upload
  fileFilter: (req: any, file: Express.Multer.File, cb: any) => {
    const fileTypeOkay = file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)
    const contentLength = parseInt(req.rawHeaders[req.rawHeaders.indexOf('Content-Length') + 1])
    const fileSizeOkay = contentLength <= maxUploadFileSize
    if (fileTypeOkay && fileSizeOkay) {
      // Allow storage of file
      cb(null, true)
    } else {
      let errorMess = ''
      if (!fileTypeOkay) {
        errorMess = `Unsupported file type ${extname(file.originalname)}`
      }
      if (!fileSizeOkay) {
        errorMess = errorMess + ', File size is exceed limit size: 2.3MB'
      }
      // Reject file
      cb(new HttpException(errorMess, HttpStatus.BAD_REQUEST), false)
    }
  },
  // Storage properties
  storage: diskStorage({
    // Destination storage path details
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
    // File modification details
    filename: (
      req: Express.Request,
      file: Express.Multer.File,
      cb: (error: Error | null, filename: string) => void
    ) => {
      // Calling the callback passing the random name generated with the original extension name
      cb(null, `${randomUUID()}${extname(file.originalname)}`)
    },
  }),
}
