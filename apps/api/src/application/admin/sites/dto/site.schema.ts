import { getSchemaPath } from '@nestjs/swagger'
import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

import { PageMetaDto } from '@/common/pagination/page-meta.dto'

import { SiteResponse } from './create-site.dto'
import { SiteDetailDto } from './site-detail.dto'

export const createSiteSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(SiteResponse),
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

export const getAllSiteSchema: SchemaObject = {
  properties: {
    data: {
      type: 'object',
      properties: {
        content: {
          type: 'array',
          items: {
            $ref: getSchemaPath(SiteDetailDto),
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

export const getSiteSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(SiteDetailDto),
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

export const updateSiteSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(SiteDetailDto),
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

export const deleteSiteSchema: SchemaObject = {
  properties: {
    data: {
      $ref: getSchemaPath(SiteDetailDto),
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
