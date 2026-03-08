import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

import {
  baseProperties,
  baseResponse,
  commonProperties,
  pageContent,
  pageMeta,
} from './base.schema'

export const commentProperties = {
  rating: {
    type: 'number',
    example: 5,
  },
  content: {
    type: 'string',
    example: 'This is a good course',
  },
}

export const commentSchema = {
  type: 'object',
  properties: {
    ...baseResponse,
    data: {
      type: 'object',
      properties: {
        ...baseProperties,
        rating: {
          type: 'number',
          example: 5,
        },
        content: {
          type: 'string',
          example: 'This course is fantastic',
        },
        ...commonProperties,
      },
    },
  },
}

export const responseGetAllComment: SchemaObject = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        ...pageContent(commentSchema.properties.data.properties),
        ...pageMeta,
      },
    },
    ...baseResponse,
  },
}

export const createCommentSchema: SchemaObject = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        ...commentSchema.properties.data.properties,
      },
    },
    ...baseResponse,
  },
}

export const deleteCommentSchema: SchemaObject = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        generatedMaps: {
          type: 'array',
          items: {
            oneOf: [],
          },
        },
        raw: {
          type: 'array',
          items: {
            oneOf: [],
          },
        },
        affected: {
          type: 'number',
          example: 1,
        },
      },
    },
    ...baseResponse,
  },
}
