export enum MediaFileDirectory {
  SITE = 'site',
  INSTITUTION = 'institution',
  COURSE = 'course',
  PAYMENT_METHOD = 'payment-method',
  CUSTOM_FORM = 'custom-form',
  AI_TOOL = 'ai-tool',
}

export const isPrivateMediaDirectory = {
  [MediaFileDirectory.SITE]: false,
  [MediaFileDirectory.INSTITUTION]: false,
  [MediaFileDirectory.COURSE]: false,
  [MediaFileDirectory.PAYMENT_METHOD]: true,
  [MediaFileDirectory.CUSTOM_FORM]: false,
}
