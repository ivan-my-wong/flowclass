import { Controller, Get, Param, Res } from '@nestjs/common'
import { ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { existsSync } from 'fs'
import * as path from 'path'

import { FileNotFoundException } from '@/exceptions/media.exception'

import { MediaService } from './media.service'

@ApiResponse({
  description: 'This response when system error.',
  status: 500,
})
@ApiTags('Media API')
@Controller('media')
export class MediaController {
  public constructor(private readonly mediaService: MediaService) {}
  @ApiOperation({
    summary: 'This api for user use to get an image from given image url',
  })
  @ApiNotFoundResponse({
    description: 'Resource not found, wrong file name or the file has been deleted',
  })
  @Get('get/:fileName/:type')
  public async getFile(
    @Param('fileName') fileName: string,
    @Param('type') type: string,
    @Res() res: Response
  ) {
    const exist = existsSync(`${process.env.FILE_UPLOAD_LOCATION}/${fileName}.${type}`)
    if (exist) {
      return res.sendFile(path.resolve(`${process.env.FILE_UPLOAD_LOCATION}/${fileName}.${type}`))
    } else {
      throw new FileNotFoundException('Error: File not found')
    }
  }

  @Get('file/:key(*)')
  public async getFileByKey(@Param('key') key: string, @Res() res: Response) {
    const decodedKey = decodeURIComponent(key || '')
    const uploadRoot = process.env.FILE_UPLOAD_LOCATION || path.resolve(process.cwd(), '__uploads')
    const resolvedPath = path.resolve(uploadRoot, decodedKey)
    const resolvedRoot = path.resolve(uploadRoot)
    if (!resolvedPath.startsWith(resolvedRoot)) {
      throw new FileNotFoundException('Error: File not found')
    }

    const exists = existsSync(resolvedPath)
    if (exists) {
      return res.sendFile(resolvedPath)
    }

    throw new FileNotFoundException('Error: File not found')
  }
}
