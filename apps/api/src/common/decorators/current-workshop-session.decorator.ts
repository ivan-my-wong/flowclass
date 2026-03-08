import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentWorkshopSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest()
    return request.workshopSession
  }
)
