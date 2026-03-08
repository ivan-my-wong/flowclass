import { getSchemaPath } from '@nestjs/swagger'
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

import { SendPaymentProofReminderDTO } from '@/application/admin/payment-evidence/dto/confirm-state-payment-evidence.dto'
import { PageMetaDto } from '@/common/pagination/page-meta.dto'

import { DeletePaymentEvidenceDto, PaymentEvidenceDto } from './payment-evidence.dto'

export const getAllPaymentEvidencSchema: SchemaObject = {
  properties: {
    data: {
      type: 'object',
      properties: {
        content: {
          type: 'array',
          items: {
            $ref: getSchemaPath(PaymentEvidenceDto),
          },
        },
        meta: {
          $ref: getSchemaPath(PageMetaDto),
        },
      },
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
    message: {
      type: 'string',
    },
  },
}

export const paymentEvidenceSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(PaymentEvidenceDto),
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

export const confirmMultiplePaymentEvidenceSchema: SchemaObject = {
  properties: {
    data: {
      type: 'array',
      items: {
        $ref: getSchemaPath(PaymentEvidenceDto),
      },
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
    message: {
      type: 'string',
    },
  },
}

export const rejectMultiplePaymentEvidenceSchema: SchemaObject = {
  properties: {
    data: {
      type: 'array',
      items: {
        $ref: getSchemaPath(PaymentEvidenceDto),
      },
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
    message: {
      type: 'string',
    },
  },
}

export const resetMultiplePaymentEvidenceSchema: SchemaObject = {
  properties: {
    data: {
      type: 'array',
      items: {
        $ref: getSchemaPath(PaymentEvidenceDto),
      },
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
    message: {
      type: 'string',
    },
  },
}

export const deletePaymentEvidenceSchema: SchemaObject = {
  properties: {
    data: {
      type: 'array',
      items: {
        $ref: getSchemaPath(DeletePaymentEvidenceDto),
      },
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
    message: {
      type: 'string',
    },
  },
}

export const resendReminderPaymentEvidenceSchema: SchemaObject = {
  properties: {
    data: {
      type: 'array',
      items: {
        $ref: getSchemaPath(SendPaymentProofReminderDTO),
      },
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
    message: {
      type: 'string',
    },
  },
}
