export const baseResponse = {
  statusCode: {
    type: 'number',
    example: 200,
  },
  message: {
    type: 'string',
    example: 'Success',
  },
}

export const baseProperties = {
  id: {
    type: 'number',
    example: 1,
  },
  siteId: {
    type: 'number',
    example: 1,
  },
  institutionId: {
    type: 'number',
    example: 1,
  },
  courseId: {
    type: 'number',
    example: 1,
  },
}

export const commonProperties = {
  createdAt: {
    type: 'string',
    example: '2023-03-09T07:40:05.481Z',
  },
  updatedAt: {
    type: 'string',
    example: '2023-03-09T07:40:05.481Z',
  },
  deletedAt: {
    type: 'string',
    example: null,
  },
  createdBy: {
    type: 'number',
    example: 6,
  },
  updatedBy: {
    type: 'number',
    example: 6,
  },
}

export const pageContent = (objectProperties) => {
  return {
    content: {
      type: 'array',
      items: {
        oneOf: [
          {
            type: 'object',
            properties: {
              ...objectProperties,
            },
          },
          {
            type: 'object',
            properties: {
              ...objectProperties,
            },
          },
        ],
      },
    },
  }
}

export const pageMeta = {
  meta: {
    type: 'object',
    properties: {
      page: {
        type: 'number',
        example: 1,
      },
      num: {
        type: 'number',
        example: 10,
      },
      itemCount: {
        type: 'number',
        example: 2,
      },
      pageCount: {
        type: 'number',
        example: 1,
      },
      hasPreviousPage: {
        type: 'boolean',
        example: false,
      },
      hasNextPage: {
        type: 'boolean',
        example: false,
      },
    },
  },
}
