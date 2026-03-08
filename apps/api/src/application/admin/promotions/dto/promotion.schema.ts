// schema for Swagger output example
import { PromotionType } from '@/models/enums/'

export const promotionSchema = {
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
    count: {
      type: 'number',
      example: 1,
    },
    type: {
      enum: [
        PromotionType.BUNDLE_DISCOUNT,
        PromotionType.DIRECT_DISCOUNT,
        PromotionType.COUPON_DISCOUNT,
        PromotionType.RECURRING_DISCOUNT,
        PromotionType.TRIAL_LESSON,
      ],
      example: PromotionType.COUPON_DISCOUNT,
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
