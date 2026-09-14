import { Controller, Get, Param, Res } from '@nestjs/common'
import { ApiNotFoundResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { Response } from 'express'
import { existsSync } from 'fs'
import path from 'path'

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
}
