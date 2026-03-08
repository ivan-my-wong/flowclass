import { Injectable, NestMiddleware } from '@nestjs/common'
import * as bodyParser from 'body-parser'
import { Request, Response } from 'express'

@Injectable()
export class JsonBodyMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: () => any) {
    // ✅ Increase payload limit to 50MB (effectively unlimited for most use cases)
    // Set to a very large value to avoid "payload too large" errors
    bodyParser.json({ limit: '50mb' })(req, res, next)
  }
}
