/* eslint-disable simple-import-sort/imports */
import { AdditionalFeeController } from '@/application/admin/additional-fee/additional-fee.controller'
import { AuthController } from '@/application/admin/auth/auth.controller'
import { JwtStrategy } from '@/application/admin/auth/jwt.strategy'
// import { AutomationFlowController } from '@/application/admin/automation-flow/automation-flow.controller'
import { ClassLessonController } from '@/application/admin/class-lesson/class-lesson.controller'
import { CourseActivitiesOrderController } from '@/application/admin/course-activities-order/course-activities-order.controller'
import { AppointmentController } from '@/application/admin/courses/appointment.controller'
import { ClassesController } from '@/application/admin/courses/classes.controller'
import { CommentController } from '@/application/admin/courses/comment.controller'
import { CoursesController } from '@/application/admin/courses/courses.controller'
import { RegularCourseController } from '@/application/admin/courses/regular-course.controller'
import { RegularPeriodsController } from '@/application/admin/courses/regular-periods.controller'
import { WorkshopController } from '@/application/admin/courses/workshop.controller'
import { EnrollCoursesController } from '@/application/admin/enroll-courses/enroll-courses.controller'
import { EnrollmentFormController } from '@/application/admin/enrollment-form/enrollment-form.controller'
import { GoogleAnalyticsController } from '@/application/admin/google-analytics/google-analytics.controller'
import { InstitutionsController } from '@/application/admin/institutions/institutions.controller'
import { InvoicesController } from '@/application/admin/invoices/invoices.controller'
import { MasterAdminController } from '@/application/admin/master-admin/master-admin.controller'
import { MediaAdminController } from '@/application/admin/media/media-admin.controller'
import { OpenAiController } from '@/application/admin/open-ai/openai.controller'
import { OpenAiChatGptController } from '@/application/admin/open-ai/openaiChatStream.controller'
import { PasswordResetTokenController } from '@/application/admin/password-reset-token/password-reset-token.controller'
import { PaymentEvidenceController } from '@/application/admin/payment-evidence/payment-evidence.controller'
import { BundleDiscountsController } from '@/application/admin/promotions/bundle-discounts.controller'
import { CouponsController } from '@/application/admin/promotions/coupons.controller'
import { PromotionsController } from '@/application/admin/promotions/promotions.controller'
import { RecordLogController } from '@/application/admin/record-log/record-logs.controller'
import { RequestPayoutController } from '@/application/admin/request-payout/request-payout.controller'
import { SeoSettingsController } from '@/application/admin/seo-settings/seo-setting.controller'
import { SetingBlockTimeController } from '@/application/admin/setting-block-time/setting-block-time.controller'
import { SettingNotificationsController } from '@/application/admin/setting-notifications/setting-notifications.controller'
import { WhatsappMessagesController } from '@/application/admin/setting-notifications/whatsapp-messages.controller'
import { EmailTestController } from '@/application/admin/email-test/email-test.controller'
import { SettingSiteController } from '@/application/admin/setting-site/setting-site.controller'
import { SettingSocialController } from '@/application/admin/setting-social/setting-social.controller'
import { SettingWebpageInstitutionController } from '@/application/admin/setting-webpage-institution/setting-webpage-institution.controller'
import { SiteRegisterController } from '@/application/admin/sites/site-register.controller'
import { SitesController } from '@/application/admin/sites/sites.controller'
import { StripeConnectController } from '@/application/admin/stripe-connect/stripe-connect.controller'
import { StripeProductPricesController } from '@/application/admin/stripe-product-prices/stripe-product-prices.controller'
import { StripeProductsController } from '@/application/admin/stripe-products/stripe-products.controller'
import { StudentOnbController } from '@/application/admin/student-onboard/student-onboard.controller'
import { PlansController } from '@/application/admin/subscription-plans/subscription-plans.controller'
import { UsersController } from '@/application/admin/users/users.controller'
import { WhatsappTemplateController } from '@/application/admin/whatsapp-template/whatsapp-template.controller'
import { HealthModule } from '@/application/health/health.module'
import {
  QUEUE_ENROLL_COURSE,
  QUEUE_NAME_BLOCK_TIME,
  QUEUE_NAME_IMPORT_CSV,
  QUEUE_REMIND,
} from '@/common/constants'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { AuthMiddleware } from '@/common/middlewares/auth-middleware'
import { JsonBodyMiddleware } from '@/common/middlewares/json-body.middleware'
import { MultipartMiddleware } from '@/common/middlewares/multer.middleware'
import { RawBodyMiddleware } from '@/common/middlewares/raw-body.middleware'
import { InstitutionExistsRule } from '@/common/validators/institution-exists.validator'
import { LessonExistsRule } from '@/common/validators/lesson-exits.validator'
import { IsModeratelyStrongPassword } from '@/common/validators/moderately-strong-password'
import { SiteExistsRule } from '@/common/validators/site-exists.validator'
import { UserExistsRule } from '@/common/validators/user-exists.validator'
import { TAppConfig } from '@/config/config.schema'
import { getAllEntities, getAllRepositories, getAllServices } from '@/config/database'
import { CloudWatchLoggerProvider } from '@/config/loggers/cloudwatch-nestjs.provider'
import { DatabaseModule } from '@/modules/database.module'

import { CreateNewInvoiceScheduleConsumer, ImportStudentConsumer } from './cron/cron.consumer'

import { AvailabilityController } from '@/application/admin/availability/availability.controller'
import { ClassMaterialsController } from '@/application/admin/class-materials/class-materials.controller'
import { ClassRegularSchedulesV2Controller } from '@/application/admin/class-regular-schedules/class-regular-schedules.controller'
import { PrerequisitesCourseController } from '@/application/admin/courses/prerequisites.controller'
import { CreditManagementController } from '@/application/admin/credit/credit-management.controller'
import { CustomMessageController } from '@/application/admin/custom-messages/custom-message.controller'
import { InstructorsController } from '@/application/admin/instructors/instructors.controller'
import { IntegrationGoogleController } from '@/application/admin/integration-google/integration-google.controller'
import { InvoiceCampaignController } from '@/application/admin/invoice-campaign/invoice-campaign.controller'
import { LocationRoomController } from '@/application/admin/location-room/location-room.controller'
import { TrialLessonsController } from '@/application/admin/promotions/trial-lessons.controller'
import { RescheduleApprovalController } from '@/application/admin/reschedule-approval/reschedule-approval.controller'
import { SitesFeatureEnabledController } from '@/application/admin/sites-feature-enabled/sites-feature-enabled.controller'
import { AdminStudentSubmissionController } from '@/application/admin/student-submission/student-submission.controller'
import { SubscriptionPlanRecordsController } from '@/application/admin/subscription-plans/subscription-plan-records.controller'
import { TemplateManagementController } from '@/application/admin/template-management/template-management.controller'
import { WebHookController } from '@/application/admin/web-hooks/web-hook.controller'
import { WhatsappWebController } from '@/application/admin/whatsapp-web/whatsapp-web.controller'
import { PostgresStore } from '@/domain/external/whatsapp/postgres.store'
import { HttpModule } from '@nestjs/axios'
import { BullModule } from '@nestjs/bull'
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RouterModule } from '@nestjs/core'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ScheduleModule } from '@nestjs/schedule'
import { ServeStaticModule } from '@nestjs/serve-static'
import { TypeOrmModule } from '@nestjs/typeorm'
import { join } from 'path'
import { AzureOpenaiModule } from './azure-openai.module'
import { StripeClientModule } from './stripe-client/stripe-client.module'
import { StatisticsController } from '@/application/admin/statistics/statistics.controller'
import { MetaController } from '@/application/admin/meta/meta.controller'
import { MetaWhatsAppProfileController } from '@/application/admin/meta/meta-whatsapp-profile.controller'
import { InvoiceCampaignWorker } from '@/modules/worker/invoice-campaign.worker'

@Module({
  imports: [
    StripeClientModule,
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '@/..', 'exports'),
      serveRoot: '/exports/',
    }),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    DatabaseModule,
    RouterModule.register([
      {
        path: 'admin',
        module: AdminModule,
      },
    ]),
    JwtModule.registerAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<TAppConfig>) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
        }
      },
    }),
    AzureOpenaiModule,
    TypeOrmModule.forFeature([...getAllEntities()]),
    HttpModule,
    HealthModule,
    BullModule.registerQueueAsync(
      {
        name: QUEUE_NAME_BLOCK_TIME,
      },
      {
        name: QUEUE_NAME_IMPORT_CSV,
      },
      {
        name: QUEUE_REMIND,
      },
      {
        name: QUEUE_ENROLL_COURSE,
      }
    ),
    EventEmitterModule.forRoot(),
  ],
  controllers: [
    AuthController,
    UsersController,
    PasswordResetTokenController,
    SitesController,
    SiteRegisterController,
    InstitutionsController,
    CoursesController,
    ClassesController,
    RegularCourseController,
    PrerequisitesCourseController,
    RegularPeriodsController,
    WorkshopController,
    AppointmentController,
    CommentController,
    PromotionsController,
    CouponsController,
    RequestPayoutController,
    SettingSocialController,
    SettingSiteController,
    StripeConnectController,
    SettingWebpageInstitutionController,
    MediaAdminController,
    EnrollCoursesController,
    SeoSettingsController,
    PlansController,
    PaymentEvidenceController,
    OpenAiController,
    OpenAiChatGptController,
    RecordLogController,
    ClassLessonController,
    CourseActivitiesOrderController,
    BundleDiscountsController,
    StripeProductsController,
    StripeProductPricesController,
    MasterAdminController,
    EnrollmentFormController,
    SetingBlockTimeController,
    GoogleAnalyticsController,
    SettingNotificationsController,
    WhatsappMessagesController,
    EmailTestController,
    StudentOnbController,
    AdditionalFeeController,
    InvoicesController,
    // AutomationFlowController,
    WhatsappTemplateController,
    TrialLessonsController,
    RescheduleApprovalController,
    LocationRoomController,
    AvailabilityController,
    WhatsappWebController,
    IntegrationGoogleController,
    WebHookController,
    CustomMessageController,
    SubscriptionPlanRecordsController,
    TemplateManagementController,
    InstructorsController,
    ClassRegularSchedulesV2Controller,
    InvoiceCampaignController,
    CreditManagementController,
    SitesFeatureEnabledController,
    ClassMaterialsController,
    AdminStudentSubmissionController,
    StatisticsController,
    MetaController,
    MetaWhatsAppProfileController,
  ],
  providers: [
    PostgresStore,
    ...getAllRepositories(),
    ...getAllServices(),
    CloudWatchLoggerProvider,
    SiteExistsRule,
    InstitutionExistsRule,
    UserExistsRule,
    IsModeratelyStrongPassword,
    LessonExistsRule,

    JwtStrategy,

    RequireParamsGuard,

    RolesGuard,

    // These are BULL consumers
    ImportStudentConsumer,
    CreateNewInvoiceScheduleConsumer,
    InvoiceCampaignWorker,
  ],
})
export class AdminModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // ✅ LoggerMiddleware removed - now registered at app level to prevent duplicate logs
    consumer.apply(AuthMiddleware).exclude(
      {
        path: '/admin/auth/login',
        method: RequestMethod.ALL,
      },
      {
        path: '/admin/auth/login/social',
        method: RequestMethod.ALL,
      },
      {
        path: '/admin/auth/register',
        method: RequestMethod.ALL,
      },
      {
        path: '/admin/auth/reset-password',
        method: RequestMethod.ALL,
      },
      {
        path: '/admin/auth/forgot-password',
        method: RequestMethod.ALL,
      },
      {
        path: '/media/get/(.*)',
        method: RequestMethod.GET,
      },
      {
        path: '/stream/(.*)',
        method: RequestMethod.GET,
      }
    )
    consumer
      .apply(RawBodyMiddleware)
      .forRoutes({
        path: '/admin/stripe-connects/webhook',
        method: RequestMethod.POST,
      })
      .apply(JsonBodyMiddleware)
      .forRoutes('*')

    consumer.apply(MultipartMiddleware).forRoutes(
      {
        path: '/admin/student-onboard/column-names',
        method: RequestMethod.POST,
      },
      {
        path: '/admin/student-onboard/import',
        method: RequestMethod.POST,
      }
    )
  }
}
