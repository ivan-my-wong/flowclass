export enum PhoneContactMethod {
  WhatsApp = 'WhatsApp',
  Line = 'Line',
  Wechat = 'Wechat',
  Signal = 'Signal',
  KakaoTalk = 'KakaoTalk',
  Telegram = 'Telegram',
  Email = 'Email',
}

export enum RenewalType {
  Automatic = 'Automatic',
  Manual = 'Manual',
}

export enum WeekDayEnum {
  SUN = 'SUN',
  MON = 'MON',
  TUE = 'TUE',
  WED = 'WED',
  THU = 'THU',
  FRI = 'FRI',
  SAT = 'SAT',
}

export enum DateOverrideType {
  BLOCKED = 'blocked',
  AVAILABLE = 'available',
}

export enum ImportRequiredFields {
  StudentName = 'StudentName',
  StudentEmail = 'StudentEmail',
  StudentPhone = 'StudentPhone',
  CourseName = 'CourseName',
  ClassName = 'ClassName',
  AmountCharged = 'AmountCharged',
  FirstChargeDate = 'FirstChargeDate',
  ChargeFrequency = 'ChargeFrequency',
  NotApplicable = 'NotApplicable',
}

export enum MediaTypes {
  PAYMENT_EVIDENCE = 'PAYMENT_EVIDENCE',
}

export enum PayoutMethodName {
  EXTERNAL = 'external',
  BANK_TRANSFER = 'bankTransfer',
  OTHERS = 'others',
}

export enum ChargeFrequency {
  daily = 'daily',
  monthly = 'monthly',
  weekly = 'weekly',
  biWeekly = 'biWeekly',
  quarterly = 'quarterly',
  biMonthly = 'biMonthly',
  annually = 'annually',
  yearly = 'yearly',
}

export enum RecordLogType {
  ASSIGN_COUPON_FOR_STUDENT = 'ASSIGN_COUPON_FOR_STUDENT',
  CREATE_COUPON = 'CREATE_COUPON',
  USAGE_COUPON = 'USAGE_COUPON',
  CONFIRM_USAGE_COUPON = 'CONFIRM_USAGE_COUPON',
  DELETE_COUPON = 'DELETE_COUPON',
  INACTIVE_COUPON = 'INACTIVE_COUPON',
  STUDENT_CHANGE_INFOMATION = 'STUDENT_CHANGE_INFOMATION',
  STUDENT_ADD_CLASS = 'STUDENT_ADD_CLASS',
  STUDENT_CHANGE_TIME_TABLE = 'STUDENT_CHANGE_TIME_TABLE',
  ADDING_CLASS = 'ADDING_CLASS',
  RESCHEDULE_LESSON = 'RESCHEDULE_LESSON',
  UPDATE_PAYMENT_AMOUNT = 'UPDATE_PAYMENT_AMOUNT',
  UPDATE_INVOICE_REMARK = 'UPDATE_INVOICE_REMARK',
  DELETE_INVOICE_REMARK = 'DELETE_INVOICE_REMARK',
  UPDATE_PAYMENT_DATE = 'UPDATE_PAYMENT_DATE',
}

export enum AdditionalFeeConditions {
  NEW_STUDENT = 'NEW_STUDENT',
  ALWAYS = 'ALWAYS',
}

export enum CustomMessageVariable {
  STUDENT_NAME = '{{studentName}}',
  INSTITUTION_NAME = '{{institutionName}}',
  CLASS_NAME = '{{className}}',
  PAYMENT_LINK = '{{paymentLink}}',
  COURSE_NAME = '{{courseName}}',
}

export enum PlanTypes {
  FREE_TIER = 'FREE_TIER',
  STARTER_TIER = 'STARTER_TIER',
  GROWTH_TIER = 'GROWTH_TIER',
  PRO_TIER = 'PRO_TIER',
  ENTERPRISE_TIER = 'ENTERPRISE_TIER',
}

export enum StripePlanPriceLookupKey {
  STARTER_TIER_MONTH = 'STARTER_TIER_MONTH',
  STARTER_TIER_YEAR = 'STARTER_TIER_YEAR',
  GROWTH_TIER_MONTH = 'GROWTH_TIER_MONTH',
  GROWTH_TIER_YEAR = 'GROWTH_TIER_YEAR',
  PRO_TIER_MONTH = 'PRO_TIER_MONTH',
  PRO_TIER_YEAR = 'PRO_TIER_YEAR',
  ENTERPRISE_TIER_MONTH = 'ENTERPRISE_TIER_MONTH',
  ENTERPRISE_TIER_YEAR = 'ENTERPRISE_TIER_YEAR',
}

export enum ClassTypeEnum {
  REGULAR = 'regular',
  REGULAR_V2 = 'regularV2',
  WORKSHOP = 'workshop',
  APPOINTMENT = 'appointment',
  RECURRING = 'recurring',
  SUBSCRIPTION = 'subscription',
}

export enum CampusTypeEnum {
  HONG_KONG = 'Hong Kong',
}

export enum AgeGroupTypeEnum {
  PRIMARY = 'Primary',
  SECONDARY = 'Secondary',
  ADULT = 'Adult',
}

export enum LanguageTypeEnum {
  ENGLISH = 'English',
  Cantonese = 'Cantonese',
  Chinese = 'Chinese',
}

export enum STRIPE_CURRENCY {
  USD = 'USD',
  HKD = 'HKD',
  JPY = 'JPY',
  KRW = 'KRW',
  VND = 'VND',
}

export enum PaymentMethod {
  PAY_LATER = 'PAY_LATER',
  PAY_NOW = 'PAY_NOW',
  PAY_NOW_DIVIT = 'PAY_NOW_DIVIT',
  NOT_REQUIRED = 'NOT_REQUIRED',
}

export enum StripeWebhookEvent {
  CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed',
  CHECKOUT_SESSION_FAILED = 'checkout.session.async_payment_failed',
  ACCOUNT_UPDATED = 'account.updated',
  SUBSCRIPTION_UPDATED = 'customer.subscription.updated',
  SUBSCRIPTION_DELETED = 'customer.subscription.deleted',
  SUBSCRIPTION_CREATED = 'customer.subscription.created',
}

export enum StripeCheckoutSessionType {
  ENROLL_COURSE = 'ENROLL_COURSE',
  CREATE_SUBSCRIPTION = 'CREATE_SUBSCRIPTION',
  SUBSCRIPTION_PLAN_EVENT = 'SUBSCRIPTION_PLAN_EVENT',
  SUBSCRIPTION_PRESET_PLAN_EVENT = 'SUBSCRIPTION_PRESET_PLAN_EVENT',
  UPGRADE_SUBSCRIPTION = 'UPGRADE_SUBSCRIPTION',
  ADD_FEATURE = 'ADD_FEATURE',
}

export enum StripePriceSessionType {
  PLAN = 'plan',
}

export enum WebsiteTemplate {
  Minimal = 'minimal',
  Vertical = 'vertical',
  Hero = 'hero',
  Barebone = 'barebone',
}

export enum StripePriceType {
  RECURRING = 'recurring',
  ONE_TIME = 'one_time',
}

export enum StripePriceInterval {
  MONTH = 'month',
  YEAR = 'year',
  WEEK = 'week',
  DAY = 'day',
}

export enum RequireParam {
  SITE_ID = 'siteId',
  INSTITUTION_ID = 'institutionId',
  COURSE_ID = 'courseId',
  COURSE_IDS = 'courseIds',
  CLASS_ID = 'classId',
  ENROL_ID = 'enrolId',
  PERIOD_ID = 'periodId',
  WORKSHOP_SESSION_ID = 'workshopSessionId',
  LESSON_ID = 'lessonId',
  WORKSHOP_ID = 'workshopId',
  COUPON_ID = 'couponId',
  SETTING_SITE_ID = 'settingSiteId',
  REQUEST_PAYOUT_ID = 'requestPayoutId',
  SETTING_SOCIAL_ID = 'settingSocialId',
  SETTING_NOTIFICATIONS_ID = 'settingNotificationsId',
  SETTING_WEBPAGE_INSTITUTION_ID = 'settingWebpageInstitutionId',
  SEO_SETTING_ID = 'seoSettingId',
  COMMENT_ID = 'commentId',
  APPOINTMENT_ID = 'appointmentId',
  TOKEN = 'token',
  BUNDLE_ID = 'bundleId',
  TRIAL_LESSON_ID = 'trialLessonId',
  ENROLLMENTID = 'enrollmentId',
  USER_ID = 'userId',
  USER_ALIAS_ID = 'userAliasId',
}

export enum PromotionType {
  BUNDLE_DISCOUNT = 'BUNDLE_DISCOUNT',
  DIRECT_DISCOUNT = 'DIRECT_DISCOUNT',
  COUPON_DISCOUNT = 'COUPON_DISCOUNT',
  RECURRING_DISCOUNT = 'RECURRING_DISCOUNT',
  TRIAL_LESSON = 'TRIAL_LESSON',
  PACKAGE_DISCOUNT = 'PACKAGE_DISCOUNT',
}

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixedAmount',
}

export enum FeeType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
}

export enum FeeModeType {
  ADD_FEE = 'add',
  DEDUCT_FEE = 'deduct',
}

export enum Order {
  ASC = 'ASC',
  DESC = 'DESC',
}

export enum OrderBy {
  CREATED_AT = 'createdAt',
  UPDATED_AT = 'updatedAt',
  ID = 'id',
}

export enum Role {
  MASTER_ADMIN = 'master-admin',
  SITE_MANAGER = 'site-manager',
  INSTITUTION_MANAGER = 'institution-manager',
  INSTRUCTOR = 'instructor',
  OPERATOR = 'operator',
  STUDENT = 'student',
}

export enum RoleInSite {
  SITE_MANAGER = 'site-manager',
  INSTITUTION_MANAGER = 'institution-manager',
  INSTRUCTOR = 'instructor',
  OPERATOR = 'operator',
}

export enum RoleInInstitution {
  INSTITUTION_MANAGER = 'institution-manager',
  INSTRUCTOR = 'instructor',
  OPERATOR = 'operator',
}

export enum HandleImportError {
  Overwrite = 'overwrite',
  KeepOriginalData = 'keepOriginalData',
  SkipErrorData = 'skipErrorData',
}

// export enum TuitionMode {
//   PER_LESSON = 'PER_LESSON',
//   PER_CLASS = 'PER_CLASS',
// }

export enum PriceType {
  PER_LESSON = 'PER_LESSON',
  PER_CLASS = 'PER_CLASS',
  MULTIPLE_OPTIONS = 'MULTIPLE_OPTIONS',
}

export enum FilterMatchMode {
  All = 'all',
  Any = 'any',
}

export enum Operator {
  Contain = 'contain',
  NotContain = 'notContain',
  IsEmpty = 'isEmpty',
  NotEmpty = 'notEmpty',
  Equals = 'equals',
  Before = 'before',
  After = 'after',
}

export enum TextVersion {
  SCHOOL = 'school',
  EVENT = 'event',
  SERVICE = 'service',
}

export enum StudentPrimaryIdentifier {
  EMAIL = 'email',
  PHONE = 'phone',
}

export enum GaMeasurementEventName {
  PURCHASE = 'purchase',
}

export * from './status'
