import { getSchemaPath } from '@nestjs/swagger'
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

import {
  CreateBillingPortalLinkResponse,
  CreateLoginLinkResponse,
  CreateStripeConnectResponse,
  StripeExpressAccountResponse,
  StripeSubscriptionResponse,
} from './create-stripe-connect.dto'
import { StripeConnectDetailDto } from './stripe-connect-detail.dto'

export const createStripeConnectSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(CreateStripeConnectResponse),
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

export const createLinkLoginExpressDashboardSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(CreateLoginLinkResponse),
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

export const createBillingPortalLinkSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(CreateBillingPortalLinkResponse),
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

export const getSubscriptionDetailSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(StripeSubscriptionResponse),
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

export const updateSubscriptionSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(StripeSubscriptionResponse),
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

export const getExpressAccountDetailSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(StripeExpressAccountResponse),
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

export const stripeConnectRepositorySchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(StripeConnectDetailDto),
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
