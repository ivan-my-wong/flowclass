import { getSchemaPath } from '@nestjs/swagger'
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

import { schema } from '@/application/admin/courses/dto/course.schema'
import { UserDetailDto } from '@/application/admin/users/dto/user-detail.dto'
import {
  baseProperties,
  baseResponse,
  commonProperties,
  pageContent,
  pageMeta,
} from '@/models/schemas/base.schema'

import { lessonProperties } from './lesson.schema'
export const locationRoomSchema = {
  type: 'object',
  example: null,
  properties: {
    id: {
      type: 'number',
      example: 1,
    },
    name: {
      type: 'string',
      example: 'Room 101',
    },
    capacity: {
      type: 'number',
      example: 30,
    },
    coordinate: {
      type: 'object',
      example: null,
      properties: {
        lat: { type: 'number', example: 10.7785 },
        lng: { type: 'number', example: 106.7027 },
      },
    },
    address: {
      type: 'string',
      example: '123 Main St, Anytown, USA',
    },
    equipment: {
      type: 'array',
      example: ['Projector', 'Whiteboard'],
      items: {
        type: 'string',
      },
    },
    locationGroups: {
      type: 'array',
      example: ['Outdoor', 'Indoor'],
      items: {
        type: 'string',
      },
    },
  },
}

export const classProperties = {
  name: {
    type: 'string',
    example: 'name class',
  },
  quota: {
    type: 'number',
    example: 0,
  },
  tuition: {
    type: 'number',
    example: 2000,
  },
  dropIn: {
    type: 'boolean',
    example: true,
  },
  enrollmentOffset: {
    type: 'number',
    example: 2,
  },
  discountedPrice: {
    type: 'number',
    example: 1000,
  },
  teachingLanguage: {
    type: 'string',
    example: 'EN',
  },
  locality: {
    type: 'string',
    example: null,
  },
  detailAddress: {
    type: 'string',
    example: null,
  },
  classDescription: {
    type: 'string',
    example: null,
  },
  classMeetingUrl: {
    type: 'string',
    example: null,
  },
  classRemark: {
    type: 'string',
    example: null,
  },
  locationRoom: locationRoomSchema,
}

export const classScheme: SchemaObject = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        ...baseProperties,
        ...classProperties,
      },
    },
  },
}

export const responseGetAllClass: SchemaObject = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        ...pageContent({ ...baseProperties, ...classProperties }),
        ...pageMeta,
      },
    },
    ...baseResponse,
  },
}

const lesson = {
  type: 'object',
  properties: {
    id: schema.properties.data.properties.id,
    siteId: schema.properties.data.properties.siteId,
    institutionId: schema.properties.data.properties.institutionId,
    ...lessonProperties,
  },
}

export const detailClassSchema: SchemaObject = {
  type: 'object',
  properties: {
    ...schema.properties,
    data: {
      type: 'object',
      properties: {
        ...baseProperties,
        ...classProperties,
        schedule: {
          type: 'array',
          items: {
            oneOf: [lesson, lesson],
          },
        },
      },
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
  },
}

export const deleteClassSchema: SchemaObject = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        ...baseProperties,
        ...classProperties,
        ...commonProperties,
        message: {
          type: 'string',
          example: 'Successfully delete class',
        },
      },
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
    message: {
      type: 'string',
      example: 'Successfully delete class',
    },
  },
}

export const studentInClassSchema: SchemaObject = {
  properties: {
    data: {
      type: 'array',
      $ref: getSchemaPath(UserDetailDto),
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

export const detailLessonSchema: SchemaObject = {
  type: 'object',
  properties: {
    data: {
      ...lesson,
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
  },
}
