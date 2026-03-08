// schema for Swagger output example

export const schema = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        fileName: {
          type: 'string',
          example: '0a453f28-06d1-4565-99f7-7eb3913b06d8.jpg',
        },
        originalName: {
          type: 'string',
          example: 'pupy.jpg',
        },
        mimeType: {
          type: 'string',
          example: 'image/jpeg',
        },
        size: {
          type: 'number',
          example: 33156,
        },
        url: {
          type: 'string',
          example: 'localhost:3001/media/get/0a453f28-06d1-4565-99f7-7eb3913b06d8/jpg',
        },
        id: {
          type: 'number',
          example: 111,
        },
      },
    },
    statusCode: {
      type: 'number',
      example: 201,
    },
    message: {
      type: 'string',
      example: 'Success',
    },
  },
}
