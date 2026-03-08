// schema for Swagger output example

export const seoSettingSchema = {
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
    metaPixelId: {
      type: 'string',
      example: '123456789',
    },
    googleAdsConversionId: {
      type: 'string',
      example: '123456789',
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
