import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentInstitution = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.institution
})
