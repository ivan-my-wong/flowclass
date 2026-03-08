import { getSchemaPath } from '@nestjs/swagger'
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

import { StudentPaymentEvidenceDto } from './payment-evidence.dto'

export const paymentEvidenceSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(StudentPaymentEvidenceDto),
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
