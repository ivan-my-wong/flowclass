import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

import { schema } from '@/application/admin/courses/dto/course.schema'

export const lessonProperties = {
  courseId: {
    type: 'number',
    example: 0,
  },
  classId: {
    type: 'number',
    example: 0,
  },
  period: {
    type: 'object',
    properties: {
      repeatType: {
        type: 'object',
        properties: {
          repeat: {
            type: 'boolean',
            example: true,
          },
          every: {
            type: 'number',
            example: 1,
          },
          unit: {
            type: 'string',
            example: 'weeks',
          },
          times: {
            type: 'number',
            example: 10,
          },
        },
      },
      duration: {
        type: 'number',
        example: 10,
      },
      lessons: {
        type: 'array',
        items: {
          oneOf: [
            {
              type: 'string',
              example: '2023-03-22T07:10:43.293Z 2023-03-23T07:10:43.293Z',
            },
            {
              type: 'string',
              example: '2023-03-23T07:10:43.293Z 2023-03-243T07:10:43.293Z',
            },
          ],
        },
      },
    },
  },
}

export const lessonResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    ...schema.properties,
    data: {
      type: 'object',
      properties: {
        id: schema.properties.data.properties.id,
        siteId: schema.properties.data.properties.siteId,
        institutionId: schema.properties.data.properties.institutionId,
        ...lessonProperties,
      },
    },
  },
}

export const getLessonResponseSchema: SchemaObject = {
  type: 'object',
  properties: {
    ...schema.properties,
    data: {
      type: 'array',
      items: {
        oneOf: [lessonResponseSchema.properties.data, lessonResponseSchema.properties.data],
      },
    },
  },
}
