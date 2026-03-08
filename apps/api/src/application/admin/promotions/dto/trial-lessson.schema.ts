// schema for Swagger output example
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

export const classTrialLesson: SchemaObject = {
  type: 'object',
  properties: {
    id: {
      type: 'number',
      example: 1,
    },
    classEntity: {
      type: 'object',
      properties: {
        id: { type: 'number' },
        name: { type: 'string' },
      },
    },
    price: {
      type: 'number',
      example: 1,
    },
  },
}
export const trialLessonSchema: SchemaObject = {
  type: 'object',
  properties: {
    siteId: {
      type: 'number',
      example: 1,
    },
    institutionId: {
      type: 'number',
      example: 1,
    },
    price: {
      type: 'number',
      example: 1,
    },
    useOriginalPrice: {
      type: 'boolean',
      example: false,
    },
    enabled: {
      type: 'boolean',
      example: false,
    },
    courseIds: {
      type: 'array',
      example: [1, 2, 3],
    },
    classes: {
      type: 'array',
      items: classTrialLesson,
    },
  },
}
export const listTrialLessonSchema: SchemaObject = {
  type: 'object',
  properties: {
    data: {
      type: 'array',
      items: trialLessonSchema,
    },
    message: {
      type: 'string',
      example: 'Success',
    },
    status: {
      type: 'number',
      example: 200,
    },
  },
}

export const detailTrialLessonSchema: SchemaObject = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: trialLessonSchema.properties,
    },
    message: {
      type: 'string',
      example: 'Success',
    },
    status: {
      type: 'number',
      example: 200,
    },
  },
}
