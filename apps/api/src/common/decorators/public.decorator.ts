import { applyDecorators, SetMetadata } from '@nestjs/common'

export const Public = (): any => {
  return applyDecorators(SetMetadata('isPublic', true))
}
