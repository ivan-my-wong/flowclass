export const couponSchema = {
  type: 'object',
  properties: {
    data: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          example: 1,
        },
        siteId: {
          type: 'number',
          example: 1,
        },
        discountType: {
          type: 'string',
          enum: ['PERCENTAGE', 'FIXED_AMOUNT'],
          example: 'PERCENTAGE',
        },
        amount: {
          type: 'number',
          example: 20,
        },
        code: {
          type: 'string',
          example: 'ABC123',
        },
        quota: {
          type: 'number',
          example: 100,
        },
        institutionId: {
          type: 'number',
          example: 1,
        },
        forBundle: {
          type: 'boolean',
          example: false,
        },
        forTrialLesson: {
          type: 'boolean',
          example: false,
        },
        expireDate: {
          type: 'string',
          example: '2023-12-31T23:59:59.999Z',
        },
        status: {
          type: 'string',
          enum: ['ACTIVE', 'INACTIVE'],
          example: 'ACTIVE',
        },
        userIds: {
          type: 'array',
          items: {
            type: 'number',
            example: 1,
          },
        },
        courseIds: {
          type: 'array',
          items: {
            type: 'number',
            example: 1,
          },
        },
      },
    },
    statusCode: {
      type: 'number',
      example: 200,
    },
    message: {
      type: 'string',
      example: 'Coupon retrieved successfully',
    },
  },
}
