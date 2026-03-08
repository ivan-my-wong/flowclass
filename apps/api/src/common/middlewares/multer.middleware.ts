import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import * as multer from 'multer'

@Injectable()
export class MultipartMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    await new Promise<void>((resolve, reject) => {
      multer().any()(req as any, res as any, (err: any) => {
        if (err) {
          return reject(err)
        }
        resolve()
      })
    })

    next()
  }
}
