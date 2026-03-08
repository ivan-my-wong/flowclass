import { SchemaObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface'

// schema for Swagger output example
export const settingSocialSchema = {
  type: 'object',
  properties: {
    data: {
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
        facebookLink: {
          type: 'string',
          example: '',
        },
        youtubeLink: {
          type: 'string',
          example: '',
        },
        instagramLink: {
          type: 'string',
          example: '',
        },
        twitterLink: {
          type: 'string',
          example: '',
        },
      },
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

export const settingSocialProperties = {
  id: {
    type: 'number',
    example: 0,
  },
  siteId: {
    type: 'number',
    example: 0,
  },
  institutionId: {
    type: 'number',
    example: '0',
  },
  facebookLink: {
    type: 'string',
    example: 'link',
  },
  youtubeLink: {
    type: 'string',
    example: 'link',
  },
  instagramLink: {
    type: 'string',
    example: 'link',
  },
  twitterLink: {
    type: 'string',
    example: 'link',
  },
}

export const getSettingSocialSchema: SchemaObject = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        id: settingSocialProperties.id,
        siteId: settingSocialProperties.siteId,
        institutionId: settingSocialProperties.institutionId,
        facebookLink: settingSocialProperties.facebookLink,
        youtubeLink: settingSocialProperties.youtubeLink,
        instagramLink: settingSocialProperties.instagramLink,
        twitterLink: settingSocialProperties.twitterLink,
      },
    },
  },
}
