import { getSchemaPath } from '@nestjs/swagger'
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

import { LoginResponse } from './login.dto'

export const loginSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(LoginResponse),
    },
    statusCode: {
      type: 'number',
      example: 201,
    },
    message: {
      type: 'string',
    },
  },
}
