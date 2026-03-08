import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

import { schema } from '@/application/admin/courses/dto/course.schema'
import { baseProperties, commonProperties } from '@/models/schemas/base.schema'

// response schema

const sessionSchema = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
      example: 12,
    },
    ...baseProperties,
    name: {
      type: 'string',
      example: 'Name of this session',
    },
    totalFee: {
      type: 'number',
      example: 2500,
    },
    location: {
      type: 'string',
      example: 'City Name, Province or detail address',
    },
    ...commonProperties,
  },
}

export const deleteSessionResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        ...sessionSchema.properties,
        message: {
          type: 'string',
          example: 'Successfully delete session',
        },
      },
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
    message: {
      type: 'string',
      example: 'Successfully delete session',
    },
  },
}

export const allWorkshopResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: {
        oneOf: [schema.properties.data, schema.properties.data],
      },
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
    message: {
      type: 'string',
      example: 'Successfully delete session',
    },
  },
}
