import { createParamDecorator, ExecutionContext } from '@nestjs/common'

export const CurrentLesson = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest()
  return request.lesson
})
