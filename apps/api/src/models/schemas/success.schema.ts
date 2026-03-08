export const successSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      example: {},
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
    message: {
      type: 'string',
      example: '',
    },
  },
}
