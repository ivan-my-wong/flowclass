import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentCourse = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.course
})
