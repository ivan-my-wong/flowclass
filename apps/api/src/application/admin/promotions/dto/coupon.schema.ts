// schema for Swagger output example
import { DiscountType } from '@/models/enums/'

export const couponSchema = {
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
    code: {
      type: 'text',
      example: '123456789',
    },
    discount_type: {
      enum: [DiscountType.PERCENTAGE, DiscountType.FIXED_AMOUNT],
      example: DiscountType.PERCENTAGE,
    },
    quota: {
      type: 'number',
      example: 1,
    },
    amount: {
      type: 'number',
      example: 100000,
    },
    for_bundle: {
      type: 'boolean',
      example: true,
    },
    for_trial_lesson: {
      type: 'boolean',
      example: true,
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
