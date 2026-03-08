import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { FindOptionsWhere } from 'typeorm'

import { REQUIRE_PARAM_KEY } from '@/common/constants'
import { AppointmentService } from '@/domain/service/appointment.service'
import { BundleDiscountsService } from '@/domain/service/bundle-discounts.service'
import { ClassService } from '@/domain/service/class.service'
import { CommentService } from '@/domain/service/comment.service'
import { CouponsService } from '@/domain/service/coupons.service'
import { CoursesService } from '@/domain/service/courses.service'
import { InstitutionsService } from '@/domain/service/institutions.service'
import { RegularPeriodsService } from '@/domain/service/regular-periods.service'
import { SeoSettingsService } from '@/domain/service/seo-setting.service'
import { SettingSiteService } from '@/domain/service/setting-site.service'
import { SettingSocialService } from '@/domain/service/setting-social.service'
import { SettingWebpageInstitutionService } from '@/domain/service/setting-webpage-institution.service'
import { SitesService } from '@/domain/service/sites.service'
import { WorkshopService } from '@/domain/service/workshop.service'
import { NotFoundErrorMessage } from '@/exceptions/error-message/not-found'
import { RequiredErrorMessage } from '@/exceptions/error-message/required'
import { Appointment } from '@/models/appointment.entity'
import { ClassEntity } from '@/models/classes.entity'
import { RegularPeriods } from '@/models/course-regular-periods.entity'
import { Course } from '@/models/courses.entity'
import { CoursesRepository } from '@/models/courses.repository'
import { PriceType, RequireParam } from '@/models/enums'
import { Institution } from '@/models/institutions.entity'
import { SeoSetting } from '@/models/seo-setting.entity'
import { SettingSite } from '@/models/setting-site.entity'
import { SettingSocial } from '@/models/setting-social.entity'
import { SettingWebpageInstitution } from '@/models/setting-webpage-institutions.entity'
import { Site } from '@/models/site.entity'
import { getParamId } from '@/utils/requests.utils'
import { sortByCriterias } from '@/utils/response.utils'

@Injectable()
export class RequireParamsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly sitesService: SitesService,
    private readonly institutionsService: InstitutionsService,
    private readonly coursesService: CoursesService,
    private readonly classService: ClassService,
    private readonly workshopService: WorkshopService,
    private readonly regularPeriodsService: RegularPeriodsService,
    private readonly couponService: CouponsService,
    private readonly settingSiteService: SettingSiteService,
    private readonly settingWebpageInstitutionService: SettingWebpageInstitutionService,
    private readonly settingSocialService: SettingSocialService,
    private readonly seoSettingsService: SeoSettingsService,
    private readonly commentService: CommentService,
    private readonly appointmentService: AppointmentService,
    private readonly bundleDiscountsService: BundleDiscountsService,
    private readonly courseRepository: CoursesRepository
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const requiredParams = this.reflector.getAllAndOverride<RequireParam[]>(REQUIRE_PARAM_KEY, [
      context.getHandler(),
      context.getClass(),
    ])

    let siteId = 0
    let institutionId = 0
    let courseId = 0
    let classId = 0
    let workshopSessionId = 0
    let lessonId = 0
    let couponId = 0
    let settingSiteId = 0
    let settingWebpageInstitutionId = 0
    let requestPayoutId = 0
    let settingSocialId = 0
    let seoSettingId = 0
    let commentId = 0

    const appointmentId = 0
    let bundleId = 0
    if (!requiredParams) {
      return true
    }

    if (requiredParams.includes(RequireParam.SITE_ID)) {
      siteId = getParamId(request, RequireParam.SITE_ID)
      if (Number.isNaN(siteId) || siteId == 0) {
        throw new BadRequestException(RequiredErrorMessage.SITE_ID_IS_REQUIRED)
      }
      await this.getSite(siteId, request)
    }

    if (requiredParams.includes(RequireParam.INSTITUTION_ID)) {
      institutionId = getParamId(request, RequireParam.INSTITUTION_ID)
      if (Number.isNaN(institutionId) || institutionId == 0) {
        throw new BadRequestException(RequiredErrorMessage.INSTITUTION_ID_IS_REQUIRED)
      }
      const institution = await this.getInstitution(institutionId, request)

      if (siteId != 0 && institution.siteId != siteId) {
        throw new BadRequestException(
          NotFoundErrorMessage.INSTITUTION_IN_SITE.replace(
            '{#1}',
            institutionId.toString()
          ).replace('{#2}', siteId.toString())
        )
      }
      await this.getSite(institution.siteId, request)
    }

    if (requiredParams.includes(RequireParam.COURSE_ID)) {
      courseId = getParamId(request, RequireParam.COURSE_ID)
      if (Number.isNaN(courseId) || courseId == 0) {
        throw new BadRequestException(RequiredErrorMessage.COURSE_ID_IS_REQUIRED)
      }
      const course = await this.getCourseWithRelation(courseId, request)

      if (siteId != 0 && course.siteId != siteId) {
        throw new BadRequestException(
          NotFoundErrorMessage.COURSE_IN_SITE.replace('{#1}', courseId.toString()).replace(
            '{#2}',
            siteId.toString()
          )
        )
      }
      await this.getSite(course.siteId, request)

      if (institutionId != 0 && course.institutionId != institutionId) {
        throw new BadRequestException(
          NotFoundErrorMessage.COURSE_IN_INSTITUTION.replace('{#1}', courseId.toString()).replace(
            '{#2}',
            siteId.toString()
          )
        )
      }
      await this.getInstitution(course.institutionId, request)
    }

    if (requiredParams.includes(RequireParam.CLASS_ID)) {
      classId = getParamId(request, RequireParam.CLASS_ID)
      if (Number.isNaN(classId) || classId == 0) {
        throw new BadRequestException(RequiredErrorMessage.CLASS_ID_IS_REQUIRED)
      }

      const classEntity = await this.getClassEntity(classId, request)

      if (siteId != 0 && classEntity.siteId != siteId) {
        throw new BadRequestException(
          NotFoundErrorMessage.CLASS_IN_SITE.replace('{#1}', classId.toString()).replace(
            '{#2}',
            siteId.toString()
          )
        )
      }
      await this.getSite(classEntity.siteId, request)

      if (institutionId != 0 && classEntity.institutionId != institutionId) {
        throw new BadRequestException(
          NotFoundErrorMessage.CLASS_IN_INSTITUTION.replace('{#1}', classId.toString()).replace(
            '{#2}',
            institutionId.toString()
          )
        )
      }
      await this.getInstitution(classEntity.institutionId, request)

      if (courseId != 0 && classEntity.courseId != courseId) {
        throw new BadRequestException(
          NotFoundErrorMessage.CLASS_IN_COURSE.replace('{#1}', classId.toString()).replace(
            '{#2}',
            courseId.toString()
          )
        )
      }
      await this.getCourse(classEntity.courseId, request)
    }

    if (requiredParams.includes(RequireParam.LESSON_ID)) {
      lessonId = getParamId(request, RequireParam.LESSON_ID)
      if (Number.isNaN(lessonId) || lessonId == 0) {
        throw new BadRequestException(RequiredErrorMessage.LESSON_ID_IS_REQUIRED)
      }
      const lesson = await this.getLesson(lessonId, request)

      if (siteId != 0 && lesson.siteId != siteId) {
        throw new BadRequestException(
          NotFoundErrorMessage.LESSON_IN_SITE.replace('{#1}', lessonId.toString()).replace(
            '{#2}',
            siteId.toString()
          )
        )
      }
      await this.getSite(lesson.siteId, request)

      if (institutionId != 0 && lesson.institutionId != institutionId) {
        throw new BadRequestException(
          NotFoundErrorMessage.LESSON_IN_INSTITUTION.replace('{#1}', lessonId.toString()).replace(
            '{#2}',
            institutionId.toString()
          )
        )
      }
      await this.getInstitution(lesson.institutionId, request)

      if (courseId != 0 && lesson.courseId != courseId) {
        throw new BadRequestException(
          NotFoundErrorMessage.LESSON_IN_COURSE.replace('{#1}', lessonId.toString()).replace(
            '{#2}',
            courseId.toString()
          )
        )
      }
      await this.getCourse(lesson.courseId, request)

      if (classId != 0 && lesson.classId != classId) {
        throw new BadRequestException(
          NotFoundErrorMessage.LESSON_IN_CLASS.replace('{#1}', lessonId.toString()).replace(
            '{#2}',
            classId.toString()
          )
        )
      }
      await this.getClassEntity(lesson.classId, request)
    }

    if (requiredParams.includes(RequireParam.WORKSHOP_SESSION_ID)) {
      workshopSessionId = getParamId(request, RequireParam.WORKSHOP_SESSION_ID)
      if (Number.isNaN(workshopSessionId) || workshopSessionId == 0) {
        throw new BadRequestException(RequiredErrorMessage.WORKSHOP_SESSION_ID_IS_REQUIRED)
      }

      const workshopSession = await this.getWorkshopSession(workshopSessionId, request)

      if (siteId != 0 && workshopSession.siteId != siteId) {
        throw new BadRequestException(
          NotFoundErrorMessage.WORKSHOP_SESSION_IN_SITE.replace(
            '{#1}',
            workshopSessionId.toString()
          ).replace('{#2}', siteId.toString())
        )
      }
      await this.getSite(workshopSession.siteId, request)

      if (institutionId != 0 && workshopSession.institutionId != institutionId) {
        throw new BadRequestException(
          NotFoundErrorMessage.WORKSHOP_SESSION_IN_INSTITUTION.replace(
            '{#1}',
            workshopSessionId.toString()
          ).replace('{#2}', institutionId.toString())
        )
      }
      await this.getInstitution(workshopSession.institutionId, request)

      if (courseId != 0 && workshopSession.courseId != courseId) {
        throw new BadRequestException(
          NotFoundErrorMessage.WORKSHOP_SESSION_IN_COURSE.replace(
            '{#1}',
            workshopSessionId.toString()
          ).replace('{#2}', courseId.toString())
        )
      }
      await this.getCourse(workshopSession.courseId, request)
    }

    if (requiredParams.includes(RequireParam.COUPON_ID)) {
      couponId = getParamId(request, RequireParam.COUPON_ID)
      if (Number.isNaN(couponId) || couponId == 0) {
        throw new BadRequestException(RequiredErrorMessage.COUPON_ID_IS_REQUIRED)
      }
      const coupon = await this.getCoupon(couponId, request)

      if (siteId != 0 && coupon.siteId != siteId) {
        throw new BadRequestException(
          NotFoundErrorMessage.COUPON_IN_SITE.replace('{#1}', couponId.toString()).replace(
            '{#2}',
            siteId.toString()
          )
        )
      }
      await this.getSite(coupon.siteId, request)

      if (institutionId != 0 && coupon.institutionId != institutionId) {
        throw new BadRequestException(
          NotFoundErrorMessage.COUPON_IN_INSTITUTION.replace('{#1}', couponId.toString()).replace(
            '{#2}',
            institutionId.toString()
          )
        )
      }
      await this.getInstitution(coupon.institutionId, request)
    }

    if (requiredParams.includes(RequireParam.BUNDLE_ID)) {
      bundleId = getParamId(request, RequireParam.BUNDLE_ID)
      if (Number.isNaN(bundleId) || bundleId == 0) {
        throw new BadRequestException(RequiredErrorMessage.BUNDLE_ID_IS_REQUIRED)
      }
      const bundle = await this.getBundleDiscount(bundleId, request)
      if (siteId != 0 && bundle.siteId != siteId) {
        throw new BadRequestException(
          NotFoundErrorMessage.BUNDLE_IN_INSTITUTION.replace('{#1}', bundleId.toString()).replace(
            '{#2}',
            siteId.toString()
          )
        )
      }
      await this.getSite(bundle.siteId, request)

      if (institutionId != 0 && bundle.institutionId != institutionId) {
        throw new BadRequestException(
          NotFoundErrorMessage.BUNDLE_IN_INSTITUTION.replace('{#1}', bundleId.toString()).replace(
            '{#2}',
            institutionId.toString()
          )
        )
      }
      await this.getInstitution(bundle.institutionId, request)
    }
    if (requiredParams.includes(RequireParam.SETTING_SITE_ID)) {
      settingSiteId = getParamId(request, RequireParam.SETTING_SITE_ID)
      if (Number.isNaN(settingSiteId) || settingSiteId == 0) {
        throw new BadRequestException(RequiredErrorMessage.SETTING_SITE_ID_IS_REQUIRED)
      }
      const settingSite = await this.getSettingSite(settingSiteId, request)

      if (siteId != 0 && settingSite.siteId != siteId) {
        throw new BadRequestException(
          NotFoundErrorMessage.SETTING_WEBPAGE_IN_SITE.replace(
            '{#1}',
            settingSiteId.toString()
          ).replace('{#2}', siteId.toString())
        )
      }
      await this.getSite(settingSite.siteId, request)
    }

    if (requiredParams.includes(RequireParam.SETTING_WEBPAGE_INSTITUTION_ID)) {
      settingWebpageInstitutionId = getParamId(request, RequireParam.SETTING_WEBPAGE_INSTITUTION_ID)
      if (Number.isNaN(settingWebpageInstitutionId) || settingWebpageInstitutionId == 0) {
        throw new BadRequestException(
          RequiredErrorMessage.SETTING_WEBPAGE_INSTITUTION_ID_IS_REQUIRED
        )
      }
      const settingWebpageInstitution = await this.getSettingWebpageInstitution(
        settingWebpageInstitutionId,
        request
      )

      if (siteId != 0 && settingWebpageInstitution.siteId != siteId) {
        throw new BadRequestException(
          NotFoundErrorMessage.SETTING_WEBPAGE_INSTITUTION_IN_SITE.replace(
            '{#1}',
            settingWebpageInstitutionId.toString()
          ).replace('{#2}', siteId.toString())
        )
      }
      await this.getSite(settingWebpageInstitution.siteId, request)

      if (institutionId != 0 && settingWebpageInstitution.institutionId != institutionId) {
        throw new BadRequestException(
          NotFoundErrorMessage.SETTING_WEBPAGE_INSTITUTION_IN_INSTITUTION.replace(
            '{#1}',
            settingWebpageInstitutionId.toString()
          ).replace('{#2}', institutionId.toString())
        )
      }
      await this.getInstitution(settingWebpageInstitution.institutionId, request)
    }

    if (requiredParams.includes(RequireParam.REQUEST_PAYOUT_ID)) {
      requestPayoutId = getParamId(request, RequireParam.REQUEST_PAYOUT_ID)
      if (Number.isNaN(requestPayoutId) || requestPayoutId == 0) {
        throw new BadRequestException(RequiredErrorMessage.REQUEST_PAYOUT_ID_IS_REQUIRED)
      }
      const requestPayout = await this.getSettingSite(requestPayoutId, request)

      await this.getSite(requestPayout.siteId, request)
    }

    if (requiredParams.includes(RequireParam.SETTING_SOCIAL_ID)) {
      settingSocialId = getParamId(request, RequireParam.SETTING_SOCIAL_ID)
      if (Number.isNaN(settingSocialId) || settingSocialId == 0) {
        throw new BadRequestException(RequiredErrorMessage.SETTING_SOCIAL_ID_IS_REQUIRED)
      }
      const settingSocial = await this.getSettingSocial(settingSocialId, request)

      if (institutionId != 0 && settingSocial.institutionId != institutionId) {
        throw new BadRequestException(
          NotFoundErrorMessage.SETTING_SOCIAL_IN_INSTITUTION.replace(
            '{#1}',
            settingSocialId.toString()
          ).replace('{#2}', institutionId.toString())
        )
      }
      await this.getInstitution(settingSocial.institutionId, request)
      await this.getSite(settingSocial.siteId, request)
    }

    if (requiredParams.includes(RequireParam.SEO_SETTING_ID)) {
      seoSettingId = getParamId(request, RequireParam.SEO_SETTING_ID)
      if (Number.isNaN(seoSettingId) || seoSettingId == 0) {
        throw new BadRequestException(RequiredErrorMessage.SEO_SETTING_ID_IS_REQUIRED)
      }
      const seoSetting = await this.getSeoSetting(seoSettingId, request)

      if (siteId != 0 && seoSetting.siteId != siteId) {
        throw new BadRequestException(
          NotFoundErrorMessage.SEO_SETTING_IN_SITE.replace('{#1}', seoSettingId.toString()).replace(
            '{#2}',
            siteId.toString()
          )
        )
      }
      await this.getSite(seoSetting.siteId, request)

      if (institutionId != 0 && seoSetting.institutionId != institutionId) {
        throw new BadRequestException(
          NotFoundErrorMessage.SEO_SETTING_IN_INSTITUTION.replace(
            '{#1}',
            seoSetting.toString()
          ).replace('{#2}', institutionId.toString())
        )
      }
      await this.getInstitution(seoSetting.institutionId, request)
    }

    if (requiredParams.includes(RequireParam.COMMENT_ID)) {
      commentId = getParamId(request, RequireParam.COMMENT_ID)
      if (Number.isNaN(commentId) || commentId == 0) {
        throw new BadRequestException(RequiredErrorMessage.COMMENT_ID_IS_REQUIRED)
      }
      const comment = await this.getComment(commentId, request)

      if (siteId != 0 && comment.siteId != siteId) {
        throw new BadRequestException(
          NotFoundErrorMessage.COMMENT_IN_SITE.replace('{#1}', commentId.toString()).replace(
            '{#2}',
            siteId.toString()
          )
        )
      }
      await this.getSite(comment.siteId, request)

      if (institutionId != 0 && comment.institutionId != institutionId) {
        throw new BadRequestException(
          NotFoundErrorMessage.COMMENT_IN_INSTITUTION.replace('{#1}', comment.toString()).replace(
            '{#2}',
            institutionId.toString()
          )
        )
      }
      await this.getInstitution(comment.institutionId, request)
    }
    return true
  }

  private async getSite(siteId, request) {
    const site = await this.sitesService.getOneOrFail({
      id: siteId,
    } as FindOptionsWhere<Site>)
    request.site = site
    return site
  }

  private async getInstitution(institutionId, request) {
    const institution = await this.institutionsService.getOneOrFail({
      id: institutionId,
    } as FindOptionsWhere<Institution>)
    request.institution = institution

    return institution
  }

  private async getCourse(courseId, request) {
    const course = await this.coursesService.getOneOrFail({
      id: courseId,
    } as FindOptionsWhere<Course>)
    request.course = course

    return course
  }

  private async getCourseWithRelation(courseId, request) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: {
        classes: {
          recurringFormat: true,
          regularPeriods: {
            lessons: true,
          },
          recurringSchedules: true,
        },
        courseActivitiesOrder: true,
      },
    })

    if (!course) {
      throw new BadRequestException('COURSE NOT FOUND')
    }
    request.course = course

    return course
  }

  private async getClassEntity(classEntityId, request) {
    const classEntity = await this.classService.getOneOrFail(
      {
        id: classEntityId,
      } as FindOptionsWhere<ClassEntity>,
      {
        recurringFormat: true,
        priceOptions: true,
      }
    )
    sortByCriterias(classEntity, 'schedule', 'ASC', 'orderIndex', 'id')
    if (
      classEntity.priceType !== PriceType.MULTIPLE_OPTIONS &&
      classEntity.priceOptions &&
      classEntity.priceOptions.length > 0
    ) {
      classEntity.tuition = Number(classEntity.priceOptions[0].amount)
    }
    request.classEntity = classEntity

    return classEntity
  }

  private async getWorkshopSession(workshopSessionId, request) {
    const workshopSession = await this.workshopService.getOneOrFail({
      id: workshopSessionId,
    } as FindOptionsWhere<ClassEntity>)
    request.workshopSession = workshopSession

    return workshopSession
  }

  private async getLesson(lessonId, request) {
    const lesson = await this.regularPeriodsService.getOneOrFail({
      id: lessonId,
    } as FindOptionsWhere<RegularPeriods>)
    request.lesson = lesson

    return lesson
  }

  private async getAppointment(appointmentId: number, request: any) {
    const appointment = await this.appointmentService.getOneOrFail({
      id: appointmentId,
    } as FindOptionsWhere<Appointment>)
    request.appointment = appointment

    return appointment
  }

  private async getCoupon(couponId, request) {
    const coupon = await this.couponService.getOneOrFail({
      id: couponId,
    } as FindOptionsWhere<RegularPeriods>)
    request.coupon = coupon

    return coupon
  }

  private async getBundleDiscount(bundleId, request) {
    const bundle = await this.bundleDiscountsService.getOneOrFail({
      id: bundleId,
    } as FindOptionsWhere<RegularPeriods>)
    request.bundleDiscount = bundle

    return bundle
  }

  private async getSettingSite(settingSiteId, request) {
    const settingSite = await this.settingSiteService.getOneOrFail({
      id: settingSiteId,
    } as FindOptionsWhere<SettingSite>)
    request.settingSite = settingSite

    return settingSite
  }

  private async getSettingSocial(settingSocialId, request) {
    const settingSocial = await this.settingSocialService.getOneOrFail({
      id: settingSocialId,
    } as FindOptionsWhere<SettingSocial>)
    request.settingSocial = settingSocial

    return settingSocial
  }

  private async getSettingWebpageInstitution(settingWebpageInstitutionId, request) {
    const settingWebpageInstitution = await this.settingWebpageInstitutionService.getOneOrFail({
      id: settingWebpageInstitutionId,
    } as FindOptionsWhere<SettingWebpageInstitution>)
    request.settingSocial = settingWebpageInstitution

    return settingWebpageInstitution
  }

  private async getSeoSetting(seoSettingId, request) {
    const seoSetting = await this.seoSettingsService.getOneOrFail({
      id: seoSettingId,
    } as FindOptionsWhere<SeoSetting>)
    request.seoSetting = seoSetting

    return seoSetting
  }

  private async getComment(commentId, request) {
    const comment = await this.commentService.getOneOrFail({
      id: commentId,
    } as FindOptionsWhere<SeoSetting>)
    request.comment = comment

    return comment
  }
}
