import { HttpModule } from '@nestjs/axios'
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { RouterModule } from '@nestjs/core'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { ScheduleModule } from '@nestjs/schedule'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AuthController } from '@/application/student/auth/auth.controller'
import { JwtStrategy } from '@/application/student/auth/jwt.strategy'
import { CommentStudentController } from '@/application/student/course/comment-student.controller'
import { CoursesStudentController } from '@/application/student/course/courses-student.controller'
import { StudentPrerequisitesCourseController } from '@/application/student/course/prerequisite-course.controller'
import { RecurringLessonsController } from '@/application/student/course/recurring-lessons.controller'
import { StudentRegularSchedulesController } from '@/application/student/course/regular-schedule-student.controller'
import { EnrollCoursesController } from '@/application/student/enroll-courses/enroll-courses.controller'
import { MediaStudentController } from '@/application/student/media/media-student.controller'
import { PaymentEvidenceController } from '@/application/student/payment-evidence/payment-evidence.controller'
import { ProfileStudentController } from '@/application/student/profile/profile.controller'
import { BundleDiscountsController } from '@/application/student/promotions/bundle-discounts.controller'
import { CouponsController } from '@/application/student/promotions/coupons.controller'
import { TrialLessonController } from '@/application/student/promotions/trial-lesson.controller'
import { RequestPayoutController } from '@/application/student/request-payout/request-payout.controller'
import { SchoolsStudentController } from '@/application/student/school/schools-student.controller'
import { SitesStudentController } from '@/application/student/site/sites-student.controller'
import { StudentSubmissionController } from '@/application/student/student-submission/student-submission.controller'
import { UsersController } from '@/application/student/users/users.controller'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { InstitutionExistsRule } from '@/common/validators/institution-exists.validator'
import { IsModeratelyStrongPassword } from '@/common/validators/moderately-strong-password'
import { SiteExistsRule } from '@/common/validators/site-exists.validator'
import { UserExistsRule } from '@/common/validators/user-exists.validator'
import { TAppConfig } from '@/config/config.schema'
import { getAllEntities, getAllRepositories, getAllServices } from '@/config/database'
import { CloudWatchLoggerProvider } from '@/config/loggers/cloudwatch-nestjs.provider'
import { ObjectStorageProvider } from '@/config/storage/object-storage.provider'
import { SitesService } from '@/domain/service/sites.service'

import { StripeClientModule } from './stripe-client/stripe-client.module'
import { DivitStudentModule } from './divit/divit-student.module'
import { AzureOpenaiModule } from './azure-openai.module'
import { DatabaseModule } from './database.module'

@Module({
  imports: [
    StripeClientModule,
    DivitStudentModule,
    ScheduleModule.forRoot(),
    PassportModule.register({
      defaultStrategy: 'jwt',
      property: 'user',
      session: false,
    }),
    DatabaseModule,
    JwtModule.registerAsync({
      imports: [],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService<TAppConfig>) => ({
        secret: configService.get('JWT_SECRET_STUDENT'),
        signOptions: { expiresIn: configService.get('JWT_EXPIRES_IN') },
      }),
    }),
    AzureOpenaiModule,
    TypeOrmModule.forFeature([...getAllEntities()]),
    RouterModule.register([
      {
        path: 'student',
        module: StudentModule,
        children: [DivitStudentModule],
      },
    ]),
    HttpModule,
  ],
  controllers: [
    AuthController,
    EnrollCoursesController,
    CommentStudentController,
    CoursesStudentController,
    UsersController,
    MediaStudentController,
    PaymentEvidenceController,
    SitesStudentController,
    SchoolsStudentController,
    RequestPayoutController,
    CouponsController,
    BundleDiscountsController,
    RecurringLessonsController,
    StudentRegularSchedulesController,
    StudentPrerequisitesCourseController,
    TrialLessonController,
    ProfileStudentController,
    StudentSubmissionController,
  ],
  providers: [
    ...getAllRepositories(),
    ...getAllServices(),
    CloudWatchLoggerProvider,

    JwtStrategy,

    SitesService,

    RequireParamsGuard,

    SiteExistsRule,
    InstitutionExistsRule,
    UserExistsRule,
    IsModeratelyStrongPassword,

    ObjectStorageProvider,
  ],
})
export class StudentModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    // ✅ LoggerMiddleware removed - now registered at app level to prevent duplicate logs
  }
}
