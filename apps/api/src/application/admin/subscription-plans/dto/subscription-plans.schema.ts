import { getSchemaPath } from '@nestjs/swagger'
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

import { PageMetaDto } from '@/common/pagination/page-meta.dto'

import { PlanDetailResponse, PlanWithQuotas, PresetPlansDto } from './subscription-plans.dto'

export const getSubscriptionPlanCheckoutResponse: SchemaObject = {
  properties: {
    data: {
      type: 'object',
      properties: {
        checkoutUrl: {
          type: 'string',
          example: 'https://checkout.stripe.com/pay/cs_test_1234567890',
        },
        sessionId: {
          type: 'string',
          example: 'cs_test_1234567890',
        },
      },
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
    message: {
      type: 'string',
      example: 'Checkout session created successfully',
    },
  },
}

export const getAllPlanSchema: SchemaObject = {
  properties: {
    data: {
      type: 'object',
      properties: {
        content: {
          type: 'array',
          items: {
            $ref: getSchemaPath(PlanDetailResponse),
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

export const getPlanWithQuotas: SchemaObject = {
  properties: {
    data: {
      type: 'object',
      $ref: getSchemaPath(PlanWithQuotas),
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

export const getAllPresetPlanSchema: SchemaObject = {
  properties: {
    data: {
      type: 'array',
      items: {
        $ref: getSchemaPath(PresetPlansDto),
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
