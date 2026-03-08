import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentClassEntity = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.classEntity
})
