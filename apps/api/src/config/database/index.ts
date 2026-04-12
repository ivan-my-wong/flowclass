/* eslint-disable simple-import-sort/imports */
import { ObjectStorageProvider } from '@/config/storage/object-storage.provider'
import { EmailService } from '@/domain/external/email.service'
import { ChatGPTService } from '@/domain/external/openAi.service'
import { StripeConnectService } from '@/domain/external/stripe-connect.service'
import { StripeProductPricesService } from '@/domain/service/stripe-product-prices.service'
import { WhatsappService } from '@/domain/external/whatsapp.service'
import { AdditionalFeeService } from '@/domain/service/additional-fee.service'
import { AppointmentService } from '@/domain/service/appointment.service'
import { AuthService } from '@/domain/service/auth.service'
import { AvailabilityService } from '@/domain/service/availability.service'
import { BundleDiscountsService } from '@/domain/service/bundle-discounts.service'
import { PackageDiscountsService } from '@/domain/service/package-discounts.service'
import { ClassLessonService } from '@/domain/service/class-lesson.service'
import { ClassService } from '@/domain/service/class.service'
import { CommentService } from '@/domain/service/comment.service'
import { CouponsService } from '@/domain/service/coupons.service'
import { CourseActivitiesOrderService } from '@/domain/service/course-activities-order.service'
import { RecurringSchedulesService } from '@/domain/service/course-recurring-schedules.service'
import { CoursesService } from '@/domain/service/courses.service'
import { CustomMessageService } from '@/domain/service/custom-message.service'
import { EnrollCoursesService } from '@/domain/service/enroll-courses.service'
import { EnrollmentFormService } from '@/domain/service/enrollment-form.service'
import { InstitutionsService } from '@/domain/service/institutions.service'
import { InvoiceService } from '@/domain/service/invoice.service'
import { LocationRoomService } from '@/domain/service/location-room.service'
import { ManagementService } from '@/domain/service/management.service'
import { NotificationRecordService } from '@/domain/service/notification-log.service'
import { PasswordResetTokenService } from '@/domain/service/password-reset-token.service'
import { PaymentEvidenceService } from '@/domain/service/payment-evidence.service'
import { PaymentService } from '@/domain/service/payment.service'
import { PeriodLessonsService } from '@/domain/service/period-lessons.service'
import { PrerequisitesCoursesService } from '@/domain/service/prerequisites-course.service'
import { ProfileService } from '@/domain/service/profile.service'
import { PromotionsService } from '@/domain/service/promotions.service'
import { RecordLogService } from '@/domain/service/record-log.service'
import { RegularPeriodsService } from '@/domain/service/regular-periods.service'
import { RequestPayoutService } from '@/domain/service/request-payout.service'
import { RescheduleApprovalService } from '@/domain/service/reschedule-approval.service'
import { SeoSettingsService } from '@/domain/service/seo-setting.service'
import { SetingBlockTimeService } from '@/domain/service/setting-block-time.service'
import { SettingNotificationsService } from '@/domain/service/setting-notifications.service'
import { SettingSiteService } from '@/domain/service/setting-site.service'
import { SettingSocialService } from '@/domain/service/setting-social.service'
import { SettingWebpageInstitutionService } from '@/domain/service/setting-webpage-institution.service'
import { SitesService } from '@/domain/service/sites.service'
import { StudentOnbService } from '@/domain/service/student-onboard.service'
import { StudentScheduleService } from '@/domain/service/student-schedule.service'
import { TrialLessonService } from '@/domain/service/trial-lesson.service'
import { UserRolesService } from '@/domain/service/user-roles.service'
import { UsersService } from '@/domain/service/users.service'
import { WhatsappTemplateService } from '@/domain/service/whatsapp-template.service'
import { WorkshopService } from '@/domain/service/workshop.service'
import { AdditionalFee, AdditionalFeeRepository } from '@/models/additional-fee.entity'
import { AiRunsRecord, AiRunsRecordRepository } from '@/models/ai-runs-record.entity'
import { Appointment, AppointmentRepository } from '@/models/appointment.entity'
import { Availability, AvailabilityRepository } from '@/models/availability.entity'
import { BundleDiscount } from '@/models/bundle-discounts.entity'
import { BundleDiscountsRepository } from '@/models/bundle-discounts.repository'
import { PackageDiscount } from '@/models/package-discounts.entity'
import { PackageDiscountsRepository } from '@/models/package-discounts.repository'
import { ClassLessonRepository } from '@/models/class-lesson.repository'
import { ClassLesson } from '@/models/class-lessons.entity'
import { ClassEntity } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import { CommentEntity, CommentRepository } from '@/models/comments.entity'
import { CommonField } from '@/models/common-field.entity'
import { CommonFieldRepository } from '@/models/common-field.repository'
import { CommonForm } from '@/models/common-form.entity'
import { CommonFormRepository } from '@/models/common-form.repository'
import { Coupon } from '@/models/coupons.entity'
import { CouponsRepository } from '@/models/coupons.repository'
import {
  RecurringSchedules,
  RecurringSchedulesRepository,
} from '@/models/course-recurring-schedules.entity'
import { RegularPeriods, RegularPeriodsRepository } from '@/models/course-regular-periods.entity'
import {
  CourseActivitiesOrderEntity,
  CourseActivitiesOrderRepository,
} from '@/models/course-activities-order.entity'
import { Course } from '@/models/courses.entity'
import { CoursesRepository } from '@/models/courses.repository'
import { CustomMessageEntity, CustomMessageRepository } from '@/models/custom-message.entity'
import { EnrollClassMapping, EnrollCourse } from '@/models/enroll-courses.entity'
import {
  EnrollClassMappingRepository,
  EnrollCourseRepository,
} from '@/models/enroll-courses.repository'
import { InstitutionGallery } from '@/models/institution-gallery.entity'
import { InstitutionGalleryRepository } from '@/models/institution-gallery.repository'
import { Institution } from '@/models/institutions.entity'
import { InstitutionsRepository } from '@/models/institutions.repository'

import { IntegrationGoogleService } from '@/domain/external/integration-google.service'
import { StudentNotifSettingService } from '@/domain/service/student-notif-setting.service'
import { WhatsappWebService } from '@/domain/service/whatsapp-web.service'
import {
  IntegrationGoogleEntity,
  IntegrationGoogleRepository,
} from '@/models/integration-google.entity'
import { InviteMember } from '@/models/invite-member.entity'
import { InviteMembersRepository } from '@/models/invite-members.repository'
import { Invoice } from '@/models/invoice.entity'
import { InvoicePromotionUsed } from '@/models/invoice-promotion-used.entity'
import { InvoicePromotionUsedRepository } from '@/models/invoice-promotion-used.repository'
import { InvoiceRepository } from '@/models/invoice.repository'
import { LessonQuestion } from '@/models/lesson-question.entity'
import { LessonQuestionRepository } from '@/models/lesson-question.repository'
import { LocationRoom } from '@/models/location-room.entity'
import { LocationRoomRepository } from '@/models/location-room.repository'
import { Media } from '@/models/media.entity'
import { MediaRepository } from '@/models/media.repository'
import { NotificationRecord } from '@/models/notification-record.entity'
import { NotificationRecordRepository } from '@/models/notification-record.repository'
import { PasswordResetToken } from '@/models/password-reset-token.entity'
import { PasswordResetTokenRepository } from '@/models/password-reset-token.repository'
import { PaymentEvidence } from '@/models/payment-evidence.entity'
import { PaymentEvidenceRepository } from '@/models/payment-evidence.repository'
import { PayoutMethod, PayoutMethodRepository } from '@/models/payout-method.entity'
import { PeriodLessons, PeriodLessonsRepository } from '@/models/period-lessons.entity'
import { RecordLog } from '@/models/record-log.entity'
import { RepeatFormats, RepeatFormatsRepository } from '@/models/repeat-formats.entity'
import { RequestTimeChange } from '@/models/request-time-change.entity'
import { RequestTimeChangeRepository } from '@/models/request-time-change.repository'
import { SeoSetting } from '@/models/seo-setting.entity'
import { SeoSettingsRepository } from '@/models/seo-setting.repository'
import { SettingBlockTime } from '@/models/setting-block-time.entity'
import {
  SettingNotifications,
  SettingNotificationsRepository,
} from '@/models/setting-notifications.entity'
import { SettingSite } from '@/models/setting-site.entity'
import { SettingSiteRepository } from '@/models/setting-site.repository'
import { SettingSocial } from '@/models/setting-social.entity'
import { SettingSocialRepository } from '@/models/setting-social.repository'
import { SettingWebpageInstitution } from '@/models/setting-webpage-institutions.entity'
import { SettingWebpageInstitutionRepository } from '@/models/setting-webpage-institutions.repository'
import { SiteGallery } from '@/models/site-gallery.entity'
import { Site } from '@/models/site.entity'
import { SitesRepository } from '@/models/sites.repository'
import { StripeConnect } from '@/models/stripe-connect.entity'
import { StripeConnectRepository } from '@/models/stripe-connect.repository'
import { StripeProductPricesEntity } from '@/models/stripe-product-prices.entity'
import { StripeProductPricesRepository } from '@/models/stripe-product-prices.repository'
import { StudentForm } from '@/models/student-form.entity'
import { StudentLesson } from '@/models/student-lesson.entity'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import {
  StudentNotificationSetting,
  StudentNotificationSettingRepository,
} from '@/models/student-notification-setting.entity'
import { StudentSchedule } from '@/models/student-schedule.entity'
import { StudentScheduleRepository } from '@/models/student-schedule.repository'
import { Transaction } from '@/models/transaction.entity'
import { TransactionRepository } from '@/models/transaction.repository'
import { ClassTrialLesson, TrialLesson } from '@/models/trial-lesson.entity'
import { ClassTrialLessonRepository, TrialLessonRepository } from '@/models/trial-lesson.repository'
import { UserAlias } from '@/models/user-aliases.entity'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { UserRole } from '@/models/user-role.entity'
import { UserRolesRepository } from '@/models/user-roles.repository'
import { User } from '@/models/user.entity'
import { UsersRepository } from '@/models/users.repository'
import { WhatsAppSession, WhatsappSessionRepository } from '@/models/whatsapp-session.entity'
import {
  WhatsappTemplateEntity,
  WhatsappTemplateRepository,
} from '@/models/whatsapp-template.entity'
import { WKSession, WorkshopSessionRepository } from '@/models/workshop-sessions.entity'
import { MediaService } from '@/modules/media/media.service'
import InvoiceWorker from '@/modules/worker/invoice.worker'
import LessonWorker from '@/modules/worker/lesson.worker'
import { SetupReminderWorker } from '@/modules/worker/setup-reminder.worker'

import { UploadProgressService } from '@/domain/external/upload-progress'
import { ClassMaterialsService } from '@/domain/service/class-materials.service'
import { ClassPriceOptionService } from '@/domain/service/class-price-option.service'
import { ClassRegularSchedulesV2Service } from '@/domain/service/class-regular-schedules.service'
import { CreditManagementService } from '@/domain/service/credit-management.service'
import { InstructorProfilesService } from '@/domain/service/instructor-profiles.service'
import { InvoiceCampaignService } from '@/domain/service/invoice-campaign.service'
import { InvoiceStatisticsService } from '@/domain/service/invoice-statistics.service'
import { SitesFeatureEnabledService } from '@/domain/service/sites-feature-enabled.service'
import { StudentSubmissionService } from '@/domain/service/student-submission.service'
import { TemplateManagementService } from '@/domain/service/template-management.service'

import { ClassMaterials } from '@/models/class-materials.entity'
import { ClassMaterialsRepository } from '@/models/class-materials.repository'
import { MediaMaterials } from '@/models/class-media-materials.entity'
import { ClassMediaMaterialsRepository } from '@/models/class-media-materials.repository'
import { ClassPriceOption } from '@/models/class-price-options.entity'
import { ClassPriceOptionRepository } from '@/models/class-price-options.repository'
import {
  ClassRegularPeriodsV2,
  ClassRegularPeriodsV2Repository,
} from '@/models/class-regular-periods.entity'
import {
  ClassRegularSchedulesV2,
  ClassRegularSchedulesV2Repository,
} from '@/models/class-regular-schedules.entity'
import { CreditSettings } from '@/models/credit-settings.entity'
import { CreditSettingsRepository } from '@/models/credit-settings.repository'
import { CreditTransactions } from '@/models/credit-transactions.entity'
import { CreditTransactionsRepository } from '@/models/credit-transactions.repository'
import { DocumentCampaignRecipients } from '@/models/document-campaign-recipients.entity'
import { DocumentCampaignRecipientsRepository } from '@/models/document-campaign-recipients.repository'
import { DocumentCampaign } from '@/models/document-campaign.entity'
import { DocumentCampaignRepository } from '@/models/document-campaign.repository'
import { DocumentTemplate } from '@/models/document-template.entity'
import { DocumentTemplateRepository } from '@/models/document-template.repository'
import { InstructorProfile, InstructorProfileRepository } from '@/models/instructor-profile.entity'
import { InstructorRate, InstructorRatesRepository } from '@/models/instructor-rates.entity'
import { RescheduleSettings } from '@/models/reschedule-settings.entity'
import { RescheduleSettingsRepository } from '@/models/reschedule-settings.repository'
import {
  SitesFeatureEnabled,
  SitesFeatureEnabledRepository,
} from '@/models/sites-feature-enabled.entity'
import { StudentSubmissions } from '@/models/student-submission.entity'
import { StudentSubmissionRepository } from '@/models/student-submission.repository'
import { TeacherFeedback } from '@/models/teacher-feedback.entity'
import { TeacherFeedbackRepository } from '@/models/teacher-feedback.repository'

export const getAllEntities = () => [
  Appointment,
  ClassEntity,
  ClassPriceOption,
  CommentEntity,
  Coupon,
  Course,
  EnrollClassMapping,
  EnrollCourse,
  InstitutionGallery,
  Institution,
  InviteMember,
  Invoice,
  InvoicePromotionUsed,
  RegularPeriods,
  PasswordResetToken,
  PaymentEvidence,
  PayoutMethod,
  SeoSetting,
  PeriodLessons,
  // Delete after migration
  WKSession,
  RecordLog,
  SettingSocial,
  SettingWebpageInstitution,
  SettingSite,
  SiteGallery,
  Site,
  StripeConnect,
  StripeProductPricesEntity,
  StudentSchedule,
  Transaction,
  UserRole,
  User,
  UserAlias,
  Media,
  ClassLesson,
  StudentLesson,
  CourseActivitiesOrderEntity,
  BundleDiscount,
  PackageDiscount,
  CommonForm,
  CommonField,
  SettingBlockTime,
  StudentForm,
  RecurringSchedules,
  SettingNotifications,
  AdditionalFee,
  AiRunsRecord,
  RepeatFormats,
  NotificationRecord,
  WhatsappTemplateEntity,
  TrialLesson,
  ClassTrialLesson,
  LessonQuestion,
  RequestTimeChange,
  LocationRoom,
  Availability,
  WhatsAppSession,
  IntegrationGoogleEntity,
  CustomMessageEntity,
  StudentNotificationSetting,
  DocumentTemplate,
  DocumentCampaign,
  DocumentCampaignRecipients,
  InstructorRate,
  InstructorProfile,
  ClassRegularSchedulesV2,
  ClassRegularPeriodsV2,
  CreditTransactions,
  CreditSettings,
  SitesFeatureEnabled,
  RescheduleSettings,
  ClassMaterials,
  StudentSubmissions,
  TeacherFeedback,
  MediaMaterials,
  RescheduleSettings,
]

export const getAllRepositories = () => [
  UsersRepository,
  UserAliasesRepository,
  InviteMembersRepository,
  UserRolesRepository,
  SitesRepository,
  InstitutionsRepository,
  InstitutionGalleryRepository,
  StripeConnectRepository,
  StripeProductPricesRepository,
  ClassRepository,
  ClassLessonRepository,
  ClassPriceOptionRepository,
  CourseActivitiesOrderRepository,
  TrialLessonRepository,
  ClassTrialLessonRepository,
  CouponsRepository,
  RegularPeriodsRepository,
  PasswordResetTokenRepository,
  PayoutMethodRepository,
  PeriodLessonsRepository,
  SettingSocialRepository,
  SettingSiteRepository,
  CoursesRepository,
  AppointmentRepository,
  WorkshopSessionRepository,
  CommentRepository,
  SettingWebpageInstitutionRepository,
  MediaRepository,
  EnrollCourseRepository,
  EnrollClassMappingRepository,
  SeoSettingsRepository,
  TransactionRepository,
  PaymentEvidenceRepository,
  InvoiceRepository,
  InvoicePromotionUsedRepository,
  BundleDiscountsRepository,
  PackageDiscountsRepository,
  RecurringSchedulesRepository,
  SettingNotificationsRepository,
  StudentScheduleRepository,
  AdditionalFeeRepository,
  RepeatFormatsRepository,
  StudentLessonRepository,
  AiRunsRecordRepository,
  NotificationRecordRepository,
  WhatsappTemplateRepository,
  CommonFormRepository,
  CommonFieldRepository,
  LessonQuestionRepository,
  RequestTimeChangeRepository,
  LocationRoomRepository,
  AvailabilityRepository,
  IntegrationGoogleRepository,
  CustomMessageRepository,
  WhatsappSessionRepository,
  StudentNotificationSettingRepository,
  DocumentTemplateRepository,
  DocumentCampaignRepository,
  DocumentCampaignRecipientsRepository,
  InstructorRatesRepository,
  InstructorProfileRepository,
  ClassRegularSchedulesV2Repository,
  ClassRegularPeriodsV2Repository,
  CreditTransactionsRepository,
  CreditSettingsRepository,
  SitesFeatureEnabledRepository,
  RescheduleSettingsRepository,
  ClassMaterialsRepository,
  ClassMediaMaterialsRepository,
  StudentSubmissionRepository,
  TeacherFeedbackRepository,
  RescheduleSettingsRepository,
]

export const getAllServices = () => [
  AuthService,
  UsersService,
  UserRolesService,
  SitesService,
  InstitutionsService,
  StripeConnectService,
  StripeProductPricesService,
  ClassService,
  ClassPriceOptionService,
  CouponsService,
  RegularPeriodsService,
  AppointmentService,
  PasswordResetTokenService,
  PromotionsService,
  RequestPayoutService,
  PeriodLessonsService,
  SettingSocialService,
  SettingSiteService,
  CoursesService,
  PrerequisitesCoursesService,
  CommentService,
  WorkshopService,
  SettingWebpageInstitutionService,
  MediaService,
  EnrollCoursesService,
  SeoSettingsService,
  EmailService,
  PaymentService,
  PaymentEvidenceService,
  InvoiceService,
  ChatGPTService,
  ObjectStorageProvider,
  RecordLogService,
  StudentOnbService,
  ClassLessonService,
  CourseActivitiesOrderService,
  BundleDiscountsService,
  PackageDiscountsService,
  ManagementService,
  EnrollmentFormService,
  SetingBlockTimeService,
  RecurringSchedulesService,
  SettingNotificationsService,
  SetingBlockTimeService,
  WhatsappService,
  StudentScheduleService,
  AdditionalFeeService,
  SettingBlockTime,
  NotificationRecordService,
  WhatsappTemplateService,
  TrialLessonService,
  RescheduleApprovalService,
  LocationRoomService,
  AvailabilityService,
  AppointmentService,
  ProfileService,
  IntegrationGoogleService,
  SetupReminderWorker,
  InvoiceWorker,
  LessonWorker,
  WhatsappWebService,
  CustomMessageService,
  WhatsappWebService,
  StudentNotifSettingService,
  TemplateManagementService,
  InstructorProfilesService,
  ClassRegularSchedulesV2Service,
  InvoiceCampaignService,
  CreditManagementService,
  ClassRegularSchedulesV2Service,
  SitesFeatureEnabledService,
  ClassMaterialsService,
  StudentSubmissionService,
  UploadProgressService,
  InvoiceStatisticsService,
]
