export enum InviteSiteMemberStatus {
  INVITING = 'inviting',
  REFUSE = 'refuse',
  ACCEPT = 'accept',
}

export enum RequestPayoutStatus {
  PENDING = 'PENDING',
  REJECT = 'REJECT',
  APPROVE = 'APPROVE',
}

export enum IntegrationConnectStatus {
  RESTRICTED = 'RESTRICTED',
  RESTRICTED_SOON = 'RESTRICTED_SOON',
  PENDING = 'PENDING',
  ENABLED = 'ENABLED',
  COMPLETE = 'COMPLETE',
  NOTFOUND = 'NOTFOUND',
}

export enum CheckoutStatus {
  PROCESSING = 'PROCESSING',
  FAILED = 'FAILED',
  SUCCEEDED = 'SUCCEEDED',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
}
export enum PaymentEvidenceStatus {
  PROCESSING = 'PROCESSING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum CouponStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
}

export enum PromotionUsedStatus {
  REDEEMED = 'REDEEMED',
  CONFIRMED = 'CONFIRMED',
}

export enum AttendanceStatus {
  ATTENDED = 'ATTENDED',
  NOT_ATTENDED = 'NOT_ATTENDED',
  PENDING = 'PENDING',
  CANCELLED = 'CANCELLED',
  POSTPONE = 'POSTPONE',
  DEDUCT = 'DEDUCT',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUBMITTED = 'SUBMITTED',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  REFUNDED = 'REFUNDED',
  CRITICAL = 'CRITICAL',
  REJECTED = 'REJECTED',
}

export enum PaymentProofStatusParams {
  CONFIRMED = 'CONFIRMED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WAITING_REVIEW_PROOF = 'WAITING_REVIEW_PROOF',
  WAITING_REVIEW_WITHOUT_PROOF = 'WAITING_REVIEW_WITHOUT_PROOF',
}
export enum EnrollConfirmStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',

  PAUSED = 'PAUSED',
  STOPPED = 'STOPPED',
}

export enum WhatsappTemplateStatus {
  RECEIVED = 'Received',
  PENDING = 'Pending',
  UNSUBMITTED = 'Unsubmitted',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum WhatsappTemplateCategory {
  AUTH = 'Authentication',
  UTILITY = 'Utility',
  MARKETING = 'Marketing',
  REJECTED = 'Rejected',
}

export enum WhatsappTemplateLanguage {
  EN = 'en',
  ZH = 'zh',
}

export enum EnrollCourseSteps {
  STARTED = 'started',
  VALIDATING_COURSE = 'validating_course',
  CHECKING_SEAT_AVAILABILITY = 'checking_seat_availability',
  CHECKING_SCHEDULE_AVAILABILITY = 'checking_schedule_availability',
  CREATING_STUDENT = 'creating_student',
  CREATING_MULTIPLE_CLASS_INFORMATION = 'creating_multiple_class_information',
  CREATING_APPLICATION_FORM = 'creating_application_form',
  ENROLLING_COURSE = 'enrolling_course',
  PREPARING_PAYMENT = 'preparing_payment',
  CREATING_INVOICE = 'creating_invoice',
  CREATING_STUDENT_SCHEDULE = 'creating_student_schedule',
  SENDING_REMINDER = 'sending_reminder',
  DONE = 'done',
  FAILED = 'failed',
}

export enum RequestTimeChangeStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING',
}

export enum AvailabilityStatus {
  AVAILABLE = 'AVAILABLE',
  CONFLICT = 'CONFLICT',
  FULLY_BOOKED = 'FULLY_BOOKED',
}

export enum LessonType {
  REGULAR = 'REGULAR',
  WORKSHOP = 'WORKSHOP',
  TRIAL = 'TRIAL',
}

export enum SharedVideoStatus {
  NONE = 'NONE',
  SHARED = 'SHARED',
}
