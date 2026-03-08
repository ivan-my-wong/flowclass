import { getSchemaPath } from '@nestjs/swagger'
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

import { PageMetaDto } from '@/common/pagination/page-meta.dto'

import { InstitutionDetailDto } from './institution-detail.dto'
import { WorkflowDto } from './workflow.dto'

export const createInstitutionSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(InstitutionDetailDto),
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

export const getAllInstitutionSchema: SchemaObject = {
  properties: {
    data: {
      type: 'object',
      properties: {
        content: {
          type: 'array',
          items: {
            $ref: getSchemaPath(InstitutionDetailDto),
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

export const getInstitutionSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(InstitutionDetailDto),
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

export const updateInstitutionSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(InstitutionDetailDto),
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

export const deleteInstitutionSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(InstitutionDetailDto),
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

export const getWorkflowSchema: SchemaObject = {
  properties: {
    data: {
      type: 'object',
      $ref: getSchemaPath(WorkflowDto),
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
