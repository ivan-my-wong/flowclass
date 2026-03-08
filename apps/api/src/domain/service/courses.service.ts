import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  In,
  Not,
  ObjectLiteral,
} from 'typeorm'

import { CheckQuotaResponseDto } from '@/application/admin/class-lesson/dto/list-class-lesson.dto'
import { ClassWithEnrolCountModel } from '@/application/admin/courses/dto/create-or-update-class.dto'
import {
  CourseSettingsDTO,
  CreateCourseBasicDTO,
  CreateCourseDesDTO,
  CreateCourseDTO,
  CreateCourseMessDTO,
  CreateCoursePaymentDTO,
  CreateCourseQnaDTO,
  CreateCourseRecruitmentDTO,
  CreateCourseTagsDTO,
  CreateOrUpdateWorkshopSessionDTO,
  DuplicateCourseDTO,
  GetAllCourseDTO,
} from '@/application/admin/courses/dto/create-or-update-course.dto'
import { CreateCourseEmailSettingsDTO } from '@/application/admin/courses/dto/create-or-update-email-settings.dto'
import { UpdatePeriodLessonsDto } from '@/application/admin/courses/dto/create-or-update-regular-periods.dto'
import {
  EmailVerificationDto,
  StudentGetAllCourseDTO,
  StudentGetSingleCourseResponseDto,
} from '@/application/student/course/dto/course.dto'
import { FEATURE_FLAG } from '@/common/constants'
import { PageDto } from '@/common/pagination/page.dto'
import { InstitutionsService } from '@/domain/service/institutions.service'
import { CourseErrorMessage } from '@/exceptions/error-message/course'
import { InstitutionErrorMessage } from '@/exceptions/error-message/institution'
import { FieldValidationFailedException } from '@/exceptions/field-validation.exception'
import { ClassLessonRepository } from '@/models/class-lesson.repository'
import { ClassPriceOption } from '@/models/class-price-options.entity'
import { ClassEntity } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import { CommonFormRepository } from '@/models/common-form.repository'
import { Course } from '@/models/courses.entity'
import { CoursesRepository } from '@/models/courses.repository'
import { ClassTypeEnum, PriceType } from '@/models/enums'
import { PaymentStatus } from '@/models/enums/status'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { SeoContent } from '@/models/seo-setting.entity'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { StudentScheduleRepository } from '@/models/student-schedule.repository'
import { User } from '@/models/user.entity'
import { WorkshopSessionRepository } from '@/models/workshop-sessions.entity'
import { BaseService } from '@/modules/base/base.service'
import { softRemoveWithRelation } from '@/utils/database.utils'
import { buildApplicationLink } from '@/utils/payment-link.utils'
import { trimMetaData } from '@/utils/response.utils'

import { EmailService } from '../external/email.service'

import { ClassPriceOptionService } from './class-price-option.service'
import { PeriodLessonsService } from './period-lessons.service'

@Injectable()
export class CoursesService extends BaseService<Course> {
  constructor(
    private courseRepository: CoursesRepository,
    private classRepository: ClassRepository,
    private readonly periodLessonsService: PeriodLessonsService,
    private readonly institutionRepository: InstitutionsRepository,
    private readonly workshopSessionRepository: WorkshopSessionRepository,
    private readonly commonFormRepository: CommonFormRepository,
    private institutionService: InstitutionsService,
    private readonly studentLessonRepository: StudentLessonRepository,
    private readonly classLessonRepository: ClassLessonRepository,
    private readonly studentScheduleRepository: StudentScheduleRepository,
    private readonly emailService: EmailService,
    private readonly classPriceOptionService: ClassPriceOptionService
  ) {
    super(courseRepository)
  }

  get courseWithRelations(): FindOptionsRelations<Course> {
    return {
      classes: {
        recurringFormat: true,
        regularPeriods: {
          lessons: true,
          repeatFormat: true,
        },
        recurringSchedules: true,
      },
      courseActivitiesOrder: true,
    }
  }

  async create(dto: CreateCourseBasicDTO) {
    return await this.courseRepository.save({
      ...this.courseRepository.create(dto),
      name: dto.name,
    })
  }

  async updateHistory(course: Course, user: User) {
    return await this.courseRepository.save({
      ...course,
      updatedBy: user.id,
    })
  }

  findAll(condition: any): Promise<Course[]> {
    return this.courseRepository.find(condition)
  }

  async findOneWithRelations(id: number): Promise<Course> {
    return await this.courseRepository.findOne({
      where: { id },
      relations: this.courseWithRelations,
    })
  }

  findOne(id: number): Promise<Course> {
    return this.courseRepository.findOneBy({ id })
  }

  async findOneByName(siteId: number, institutionId: number, courseName: string) {
    const course = await this.courseRepository.findOneBy({
      siteId,
      institutionId,
      name: courseName,
    })

    return course
  }

  async countBy(institutionId: number) {
    return await this.courseRepository.countBy({ institutionId })
  }

  async publishCourseDeprecated(courseId: number) {
    const course = await this.courseRepository.findOneBy({ id: courseId })

    if (!course) {
      throw new NotFoundException(CourseErrorMessage.COURSE_NOT_FOUND)
    }

    const errorMessages = []
    // check course name
    const invalidName = this.checkDataForPublish('name', 'name', course)
    if (invalidName) errorMessages.push(invalidName)

    const invalidPath = this.checkDataForPublish('path', 'path', course)
    if (invalidPath) errorMessages.push(invalidPath)
    // // check short-description
    // check long-description
    const invalidLongDescription = this.checkDataForPublish(
      'longDescriptions',
      'longDescriptions',
      course
    )
    if (invalidLongDescription) errorMessages.push(invalidLongDescription)
    // // check registrationMes
    // this.checkDataForPublish('registrationMes', 'registrationMes', course);
    // // check recruitment time not null
    // this.checkDataForPublish('recruitStart', 'recruitStart', course);
    // this.checkDataForPublish('recruitEnd', 'recruitEnd', course);

    // check recruitment time valid
    // start time is before end time and end time still in the future
    const recruitEndFail = this.checkRecruitmentTimeForPublish(course)
    if (recruitEndFail) errorMessages.push(recruitEndFail)

    if (errorMessages.filter((item) => item !== null).length > 0) {
      throw new FieldValidationFailedException(errorMessages)
    }

    // update publish state
    return await this.courseRepository.save({
      ...course,
      published: true,
    })
  }

  async publishCourse(courseId: number) {
    const course = await this.courseRepository.findOneBy({ id: courseId })

    if (!course) {
      throw new NotFoundException(CourseErrorMessage.COURSE_NOT_FOUND)
    }

    const errorMessages = []
    // check course name
    const invalidName = this.checkDataForPublish('name', 'name', course)
    if (invalidName) errorMessages.push(invalidName)

    const invalidPath = this.checkDataForPublish('path', 'path', course)
    if (invalidPath) errorMessages.push(invalidName)
    // // check short-description
    // check long-description
    const invalidLongDescription = this.checkDataForPublish(
      'longDescriptions',
      'longDescriptions',
      course
    )
    if (invalidLongDescription) errorMessages.push(invalidLongDescription)
    // // check registrationMes
    // this.checkDataForPublish('registrationMes', 'registrationMes', course);
    // // check recruitment time not null
    // this.checkDataForPublish('recruitStart', 'recruitStart', course);
    // this.checkDataForPublish('recruitEnd', 'recruitEnd', course);

    // check recruitment time valid
    // start time is before end time and end time still in the future
    const recruitEndFail = this.checkRecruitmentTimeForPublish(course)
    if (recruitEndFail) errorMessages.push(recruitEndFail)

    if (errorMessages.filter((item) => item !== null).length > 0) {
      throw new FieldValidationFailedException(errorMessages)
    }

    // update publish state
    return await this.courseRepository.save({
      ...course,
      published: true,
    })
  }

  checkDataForPublish(propName: string, displayName: string, course: Course) {
    if (!course[propName] || course[propName] === '') {
      return {
        field: propName,
        message:
          CourseErrorMessage.CAN_NOT_PUBLISH +
          '; ' +
          CourseErrorMessage.INVALID_COURSE_DATA +
          `: ${displayName} can't be null or empty`,
      }
    }
  }

  checkRecruitmentTimeForPublish(course: Course) {
    const recruitEnd = course.recruitEnd
    const now = new Date()
    if (recruitEnd && new Date(recruitEnd) < now) {
      return {
        field: 'recruitEnd',
        message: CourseErrorMessage.CAN_NOT_PUBLISH + '; RECRUITMENT TIME ENDED',
      }
    }
  }

  async unpublishCourse(courseId: number) {
    const course = await this.courseRepository.findOneBy({ id: courseId })

    if (!course) {
      throw new BadRequestException(CourseErrorMessage.COURSE_NOT_FOUND)
    }
    return await this.courseRepository.save({
      ...course,
      published: false,
    })
  }

  async updateCourseSettings(dto: CourseSettingsDTO) {
    const course = await this.courseRepository.findOneBy({ id: dto.courseId })
    if (!course) {
      throw new BadRequestException(CourseErrorMessage.COURSE_NOT_FOUND)
    }

    if (dto.isPrivate !== undefined) {
      course.isPrivate = dto.isPrivate
    }

    if (dto.requireEmailVerification !== undefined) {
      course.requireEmailVerification = dto.requireEmailVerification
    }
    if (dto.blockDuplicateEmailEnrollment !== undefined) {
      course.blockDuplicateEmailEnrollment = dto.blockDuplicateEmailEnrollment
    }

    return await this.courseRepository.save(course)
  }

  /** =================================================================================
   * Find all course in an institution
   * @param id institutionId
   * @returns Course[]
   */
  async findAllWithPaginate(dto: GetAllCourseDTO): Promise<PageDto<Course>> {
    const institution = await this.institutionService.findOne(dto.institutionId)

    const whereOption: FindOptionsWhere<Course> = {}
    whereOption.institutionId = dto.institutionId

    const orderOption: FindOptionsOrder<Course> = {}
    if (dto.orderBy) {
      orderOption[dto.orderBy] = dto.order
    }

    const relations: FindOptionsRelations<Course> = {
      site: {
        siteSettings: true,
      },
      courseActivitiesOrder: true,
      classes: {
        regularPeriods: {
          lessons: true,
        },
        regularScheduleV2: {
          periodsV2: {
            lessonRepeatFormat: true,
          },
        },
        recurringSchedules: true,
        recurringFormat: true,
        priceOptions: true,
      },
    }

    const courses = await this.courseRepository.pagination(dto, whereOption, orderOption, relations)

    for (const course of courses.content) {
      if (course.classes && course.classes.length > 0) {
        course.classes = await this.enrichClassesWithPriceInfo(course.classes)
      }
    }

    // If the courseOrder is not all added to the courses, there will be an error as those not in courseOrder will not be included in the courses
    if (institution.courseOrder && institution.courseOrder.length === courses.content.length) {
      const coursesContent = (courses.content = institution.courseOrder
        .map((id) => courses.content.find((item) => item.id === id))
        .filter((item) => item !== undefined))

      courses.content = coursesContent
    }
    return courses
  }
  private async enrichClassesWithPriceInfo(classes: ClassEntity[]): Promise<ClassEntity[]> {
    const classIds = classes.map((c) => c.id)
    const allPriceOptions = await this.classPriceOptionService.getByClassIds(classIds)
    const priceOptionsMap = new Map<number, ClassPriceOption[]>()
    allPriceOptions.forEach((option) => {
      if (!priceOptionsMap.has(option.classId)) {
        priceOptionsMap.set(option.classId, [])
      }
      priceOptionsMap.get(option.classId)!.push(option)
    })
    return classes.map((classItem) => {
      const classOptions = priceOptionsMap.get(classItem.id) || []

      classItem.priceOptions = classOptions

      if (
        classItem.priceType !== PriceType.MULTIPLE_OPTIONS &&
        classOptions &&
        classOptions.length > 0
      ) {
        classItem.tuition = Number(classOptions[0].amount)
      }

      return classItem
    })
  }

  async studentFindAllWithPaginate(dto: StudentGetAllCourseDTO): Promise<PageDto<Course>> {
    const whereOption: FindOptionsWhere<Course> = {
      siteId: dto.siteId,
      institutionId: dto.institutionId,
      published: true,
      isPrivate: false,
      isArchived: false,
    }

    const orderOption: FindOptionsOrder<Course> = {}
    if (dto.orderBy) {
      orderOption[dto.orderBy] = dto.order
    }

    const relations: FindOptionsRelations<Course> = {
      site: {
        siteSettings: true,
      },
      classes: {
        regularPeriods: {
          lessons: true,
        },
        recurringSchedules: true,
        regularScheduleV2: {
          periodsV2: {
            lessonRepeatFormat: true,
          },
        },
        recurringFormat: true,
        priceOptions: true,
      },
    }

    const result = await this.courseRepository.pagination(dto, whereOption, orderOption, relations)

    for (const course of result.content) {
      if (course.classes && course.classes.length > 0) {
        course.classes = await this.enrichClassesWithPriceInfo(course.classes)
      }
    }

    return result
  }

  async studentFindSingleCourse({
    siteId,
    institutionId,
    path,
  }: {
    siteId: number
    institutionId: number
    path: string
  }) {
    const course: StudentGetSingleCourseResponseDto = await this.courseRepository.findOne({
      where: {
        siteId,
        institutionId,
        path,
        published: true,
        isArchived: false,
      },
      relations: { courseActivitiesOrder: true, site: true },
    })

    if (!course) {
      const archivedCourse = await this.courseRepository.findOne({
        where: { siteId, institutionId, path, isArchived: true },
      })

      if (archivedCourse) {
        throw new BadRequestException(
          'This course has been archived and is no longer accepting new applications'
        )
      }

      return null
    }

    const classes: ClassEntity[] = await this.classRepository.findAll({
      where: { courseId: course.id },
      relations: {
        regularPeriods: {
          repeatFormat: true,
          lessons: true,
        },
        recurringSchedules: true,
        regularScheduleV2: {
          periodsV2: {
            lessonRepeatFormat: true,
          },
        },
        recurringFormat: true,
        appointment: {
          availability: true,
        },
        priceOptions: true,
      },
    })

    const classIds = classes.map((c) => c.id)
    const allClassLessons =
      classIds.length > 0
        ? await this.classLessonRepository.find({
            where: { classId: In(classIds) },
            select: ['id', 'classId', 'startTime', 'endTime'],
          })
        : []
    const lessonsByClassId = new Map<number, typeof allClassLessons>()
    for (const lesson of allClassLessons) {
      const list = lessonsByClassId.get(lesson.classId) ?? []
      list.push(lesson)
      lessonsByClassId.set(lesson.classId, list)
    }

    const classesWithQuotaValue: ClassWithEnrolCountModel[] = await Promise.all(
      classes.map(async (classObj) => {
        const classQuota = await this.countAppliedStudentCount(
          classObj.id,
          classObj.type,
          classObj.quota,
          lessonsByClassId.get(classObj.id)
        )

        let tuition: number | undefined
        if (
          classObj.priceType !== PriceType.MULTIPLE_OPTIONS &&
          classObj.priceOptions &&
          classObj.priceOptions.length > 0
        ) {
          tuition = Number(classObj.priceOptions[0].amount)
        }
        if (classQuota.length > 0) {
          return {
            ...classObj,
            classQuota,
            tuition,
          } as ClassWithEnrolCountModel
        }
        return { ...classObj, classQuota: [], tuition } as ClassWithEnrolCountModel
      })
    )

    // classes.map(async (item) => {
    //   if (item.type === CourseTypeEnum.WORKSHOP || item.type === CourseTypeEnum.REGULAR) {
    //     const regularPeriods = await this.regularPeriodsRepository.findOne({
    //       where: { classId: item.regid },
    //       relations: { lessons: true, repeatFormat: true },
    //     });
    //     if (regularPeriods) {
    //       return {
    //         ...item,
    //         regularPeriods,
    //       };
    //     }
    //   } else {
    //     return item;
    //   }
    // });
    course.classes = classesWithQuotaValue

    // get form & fields
    const form = await this.commonFormRepository.getDetailForm(course?.formId)

    return { ...course, form }
  }

  remove(id: number) {
    return `This action removes a #${id} course`
  }

  /** =================================================================================================
   *  TODO: Create a course
   * @param dto DTO object (Data Transfer Object)
   * @returns The course that has been created
   */
  async createCourse(dto: CreateCourseDTO) {
    const newCourse = await this.courseRepository.create(dto)
    newCourse.name = dto.name
    newCourse.path = dto.path
    // Set published to true by default, allow override from DTO
    newCourse.published = dto.published ?? true

    if (dto.longDescriptions && dto.longDescriptions.length > 0) {
      newCourse.longDescriptions = dto.longDescriptions
    }

    await this.courseRepository.save(newCourse)

    const found = await this.getOneOrFail({
      id: newCourse.id,
      institutionId: newCourse.institutionId,
    } as FindOptionsWhere<Course>)
    //    await this.checkTypeChange(found, dto);

    const saved = this.courseRepository.save({
      ...found,
      name: dto.name,
      path: dto.path,
    })

    const currentInstitution = await this.institutionService.findOne(newCourse.institutionId)
    if (currentInstitution.courseOrder && currentInstitution.courseOrder.length !== 0) {
      currentInstitution.courseOrder.unshift(newCourse.id)
      await this.institutionRepository.update(
        { id: newCourse.institutionId },
        {
          courseOrder: currentInstitution.courseOrder,
        }
      )
    }

    return saved
  }

  async duplicateCourse(dto: DuplicateCourseDTO) {
    let newCourse = await this.createCourse({
      courseId: null,
      name: dto.name,
      path: dto.path,

      institutionId: dto.institutionId,
      siteId: dto.siteId,
    })

    if (newCourse) {
      newCourse = await this.updateCourseBasic({
        ...newCourse,
        ...dto,
        courseId: newCourse.id,
      })

      newCourse = await this.updateDescription({
        ...newCourse,
        courseId: newCourse.id,
        longDescriptions: dto.longDescriptions,
      })

      newCourse = await this.updateMessage({
        ...newCourse,
        courseId: newCourse.id,
        message: dto.registrationMes,
      })

      newCourse = await this.createOrUpdateTags({
        siteId: dto.siteId,
        institutionId: dto.institutionId,
        courseId: newCourse.id,
        tags: dto.tags,
      })
    }
    return newCourse
  }

  async duplicateCourseToAnotherInstitution({
    dto,
    institutionId,
    originalSiteId,
    user,
  }: {
    dto: DuplicateCourseDTO
    institutionId: number
    originalSiteId: number
    user: User
  }) {
    const institution = await this.institutionService.findOne(institutionId)

    if (!institution || institution.siteId !== originalSiteId) {
      throw new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
    }

    dto.institutionId = institutionId
    dto.siteId = originalSiteId

    return await this.duplicateCourse(dto)
  }

  /** ================================================================================================
   * Create a course if not exist, or update its description by course id
   * @param dto DTO object (Data Transfer Object)
   * @returns The course that has been updated, or created
   */
  async updateDescription(dto: CreateCourseDesDTO) {
    if (dto.courseId == null) {
      const newCourse = await this.courseRepository.create(dto)
      newCourse.longDescriptions = dto.longDescriptions
      await this.courseRepository.save(newCourse)
      return newCourse
    }

    const found = await this.getOneOrFail(
      {
        id: dto.courseId,
        institutionId: dto.institutionId,
      } as FindOptionsWhere<Course>,
      this.courseWithRelations
    )
    //    await this.checkTypeChange(found, dto);

    return this.courseRepository.save({
      ...found,
      longDescriptions: dto.longDescriptions,
    })
  }

  /** =================================================================================================
   *  TODO: Create a course if not exist, or update its description by course id
   * @param dto DTO object (Data Transfer Object)
   * @returns The course that has been updated, or created
   */
  async updateCourseBasicDeprecated(dto: CreateCourseBasicDTO) {
    if (dto.courseId == null) {
      const newCourse = await this.courseRepository.create(dto)
      newCourse.name = dto.name
      newCourse.previewImageUrl = dto.previewImageUrl
      newCourse.path = dto.path
      newCourse.formId = dto.formId
      newCourse.recruitStart = dto.recruitStart
      newCourse.recruitEnd = dto.recruitEnd
      newCourse.longDescriptions = dto.longDescriptions
      newCourse.useQrAttendance = dto.useQrAttendance
      newCourse.published = true

      await this.courseRepository.save(newCourse)

      const currentInstitution = await this.institutionService.findOne(newCourse.institutionId)
      if (currentInstitution.courseOrder && currentInstitution.courseOrder.length !== 0) {
        currentInstitution.courseOrder.unshift(newCourse.id)
        await this.institutionRepository.update(
          { id: newCourse.institutionId },
          {
            courseOrder: currentInstitution.courseOrder,
          }
        )
      }

      return newCourse
    }

    const found = await this.getOneOrFail(
      {
        id: dto.courseId,
        institutionId: dto.institutionId,
      } as FindOptionsWhere<Course>,
      this.courseWithRelations
    )
    //    await this.checkTypeChange(found, dto);
    return this.courseRepository.save({
      ...found,
      ...dto,
    })
  }

  async updateCourseBasic(dto: CreateCourseBasicDTO) {
    const { courseId, institutionId, courseCode } = dto

    if (courseCode) {
      const existingCourseWithSameCode = await this.courseRepository.findOne({
        where: {
          courseCode,
          institutionId,
          ...(courseId ? { id: Not(courseId) } : {}),
        },
      })

      if (existingCourseWithSameCode) {
        throw new BadRequestException(
          'Course ID already exists in this institution. Please choose a different ID.'
        )
      }
    }

    if (courseId == null) {
      const newCourse = this.courseRepository.create({
        ...dto,
        name: dto.name,
        previewImageUrl: dto.previewImageUrl,
        path: dto.path,
        formId: dto.formId,
        recruitStart: dto.recruitStart,
        recruitEnd: dto.recruitEnd,
        longDescriptions: dto.longDescriptions,
        useQrAttendance: dto.useQrAttendance,
        published: true,
      })

      await this.courseRepository.save(newCourse)

      const currentInstitution = await this.institutionService.findOne(newCourse.institutionId)
      if (currentInstitution.courseOrder && currentInstitution.courseOrder.length !== 0) {
        currentInstitution.courseOrder.unshift(newCourse.id)
        await this.institutionRepository.update(
          { id: newCourse.institutionId },
          { courseOrder: currentInstitution.courseOrder }
        )
      }

      return newCourse
    }

    // Updating existing course
    const found = await this.getOneOrFail(
      {
        id: courseId,
        institutionId,
      } as FindOptionsWhere<Course>,
      this.courseWithRelations
    )

    return this.courseRepository.save({
      ...found,
      ...dto,
    })
  }

  async updateSeoContent(courseId: number, dto: SeoContent) {
    const course = await this.getOneOrFail(
      {
        id: courseId,
      } as FindOptionsWhere<Course>,
      this.courseWithRelations
    )

    course.seoContent = dto
    return await this.courseRepository.save(course)
  }

  /** ================================================================================================
   * Create a course if not exist, or update its QnA by course id
   * @param dto DTO object (Data Transfer Object)
   */
  async updateQnA(dto: CreateCourseQnaDTO) {
    if (dto.courseId == null) {
      const newCourse = await this.courseRepository.create(dto)
      return await this.courseRepository.save(newCourse)
    }

    const found = await this.getOneOrFail(
      {
        id: dto.courseId,
        institutionId: dto.institutionId,
      } as FindOptionsWhere<Course>,
      this.courseWithRelations
    )
    //    await this.checkTypeChange(found, dto);

    return this.courseRepository.save({
      ...found,
      faqs: dto.faqs,
    })
  }

  /** ================================================================================================
   *  Create a course if not exist, or update its message by course id
   * @param dto DTO object (Data Transfer Object)
   */
  async updateMessage(dto: CreateCourseMessDTO) {
    if (dto.courseId == null) {
      const newCourse = await this.courseRepository.create(dto)
      newCourse.registrationMes = dto.message
      await this.courseRepository.save(newCourse)
      return newCourse
    }

    const found = await this.getOneOrFail(
      {
        id: dto.courseId,
        institutionId: dto.institutionId,
      } as FindOptionsWhere<Course>,
      this.courseWithRelations
    )
    //    await this.checkTypeChange(found, dto);

    return this.courseRepository.save({
      ...found,
      registrationMes: dto.message,
    })
  }

  /** ================================================================================================
   *  Create a course if not exist, or update its message by course id
   * @param dto DTO object (Data Transfer Object)
   */
  async updatePayment(dto: CreateCoursePaymentDTO) {
    if (dto.courseId == null) {
      const newCourse = await this.courseRepository.create(dto)
      newCourse.onlineBooking = dto.isOnlineBooking
      await this.courseRepository.save(newCourse)
      return newCourse
    }

    const found = await this.getOneOrFail(
      {
        id: dto.courseId,
        institutionId: dto.institutionId,
      } as FindOptionsWhere<Course>,
      this.courseWithRelations
    )
    //    await this.checkTypeChange(found, dto);

    return this.courseRepository.save({
      ...found,
      onlineBooking: dto.isOnlineBooking,
    })
  }

  /** ================================================================================================
   * Create a course if not exist, or update its message by course id
   * @param dto DTO object (Data Transfer Object)
   * @returns created course or updated course
   */
  async updateRecruitment(dto: CreateCourseRecruitmentDTO) {
    if (dto.courseId == null) {
      const newCourse = await this.courseRepository.create(dto)
      newCourse.recruitStart = dto.startDate
      newCourse.recruitEnd = dto.endDate
      await this.courseRepository.save(newCourse)
      return newCourse
    }

    const found = await this.getOneOrFail(
      {
        id: dto.courseId,
        institutionId: dto.institutionId,
      } as FindOptionsWhere<Course>,
      this.courseWithRelations
    )
    //    await this.checkTypeChange(found, dto);

    return this.courseRepository.save({
      ...found,
      recruitStart: dto.startDate,
      recruitEnd: dto.endDate,
    })
  }

  /**
   * Returns an array of enroll counts for each lesson in a class, similar to CheckQuotaResponseDto.
   * @param classId - The ID of the class
   * @returns Array of lesson enroll info
   */
  async countAppliedStudentCount(
    classId: number,
    classType: ClassTypeEnum,
    classQuota: number,
    preloadedClassLessons?: Array<{ id: number; classId: number; startTime: Date; endTime: Date }>
  ): Promise<CheckQuotaResponseDto[]> {
    const result = []
    if (classType !== ClassTypeEnum.SUBSCRIPTION) {
      const classLessons =
        preloadedClassLessons ?? (await this.classLessonRepository.findBy({ classId }))

      const slots = classLessons.map((l) => ({ startTime: l.startTime, endTime: l.endTime }))
      const counts =
        slots.length > 0
          ? await this.studentLessonRepository.getStudentLessonsCountOfLessonBatch(classId, slots)
          : []

      classLessons.forEach((lesson, i) => {
        result.push({
          lessonId: lesson.id,
          startTime: lesson.startTime,
          endTime: lesson.endTime,
          quota: classQuota,
          remainingQuota: classQuota - (counts[i] ?? 0),
        })
      })
    } else if (classType === ClassTypeEnum.SUBSCRIPTION) {
      const numberOfApplied = await this.studentScheduleRepository.count({
        where: {
          classId,
          invoice: FEATURE_FLAG.CLASS_QUOTA_COUNT_ALL_INVOICE_STATUSES
            ? {
                paymentState: Not(In([PaymentStatus.REJECTED, PaymentStatus.REFUNDED])),
              }
            : {
                paymentState: PaymentStatus.PAID,
              },
        },
        relations: {
          invoice: true,
        },
      })
      result.push({
        lessonId: 0,
        startTime: new Date(),
        endTime: new Date(),
        quota: classQuota,
        remainingQuota: classQuota - numberOfApplied,
      })
    }
    return result
  }

  /** ================================================================================================
   * Create an session record if not exist, or update it by sessionId
   * @param dto DTO object (Data Transfer Object)
   * @returns created session or updated session
   */
  async createOrUpdateSession(dto: CreateOrUpdateWorkshopSessionDTO, user?: User) {
    const found = await this.classRepository.findOne({
      where: {
        id: dto.workshopSessionId | 0,
        courseId: dto.courseId | 0,
      },
    })
    if (found) {
      const updated = await this.classRepository.save({
        ...found,
        name: dto.name,
        totalFee: dto.totalFee,
        location: dto.location,
        quota: dto.quota,
        updatedBy: user?.id,
      })
      const sessionDates: UpdatePeriodLessonsDto[] = dto.sessionDates
      await this.periodLessonsService.upsertMany(sessionDates, dto.workshopSessionId)
      const allSessionDates = await this.periodLessonsService.getAll(dto.workshopSessionId)

      await this.periodLessonsService.upsertMany(allSessionDates)
      trimMetaData(updated)
      return updated
    } else {
      const newSession = this.workshopSessionRepository.create(dto)
      newSession.createdBy = user?.id
      newSession.updatedBy = user?.id
      const created = await this.workshopSessionRepository.save(newSession)
      const sessionDates: UpdatePeriodLessonsDto[] = dto.sessionDates
      await this.periodLessonsService.upsertMany(sessionDates, created.id)
      const allSessionDates = await this.periodLessonsService.getAll(created.id)
      await this.periodLessonsService.upsertMany(allSessionDates)
      trimMetaData(created)
      return created
    }
  }

  async createOrUpdateTags(dto: CreateCourseTagsDTO) {
    if (dto.courseId == null) {
      const newCourse = await this.courseRepository.create(dto)
      return await this.courseRepository.save(newCourse)
    }

    const found = await this.getOneOrFail(
      {
        id: dto.courseId,
        institutionId: dto.institutionId,
      } as FindOptionsWhere<Course>,
      this.courseWithRelations
    )
    //    await this.checkTypeChange(found, dto);

    return this.courseRepository.save({
      ...found,
      tags: dto.tags,
    })
  }

  async deleteCourse(id: number): Promise<Course> {
    const course = await this.courseRepository.findOneBy({ id })
    if (!course) {
      throw new BadRequestException(CourseErrorMessage.COURSE_NOT_FOUND)
    }

    const whereDeleteObject: FindOptionsWhere<ObjectLiteral> = {
      id,
    }

    const whereDeleteRelationObject: FindOptionsWhere<ObjectLiteral> = {
      courseId: id,
    }

    await softRemoveWithRelation(
      this.courseRepository.manager,
      'Course',
      whereDeleteObject,
      whereDeleteRelationObject
    )
    return course
  }

  async emailVerification(dto: EmailVerificationDto) {
    const course = await this.courseRepository.findOne({
      where: { id: dto.courseId },
      relations: { institution: true, site: true },
    })
    if (!course) {
      throw new BadRequestException(CourseErrorMessage.COURSE_NOT_FOUND)
    }

    const applicationLink = buildApplicationLink({
      institutionUrl: course.institution.url,
      siteUrl: course.site.url,
      coursePath: course.path,
      email: dto.email,
    })

    await this.emailService.sendCourseEmailVerificationEmail({
      emailAddress: dto.email,
      courseName: course.name,
      applicationLink,
      institutionName: course.institution.name,
      institutionId: course.institution.id,
    })

    return {
      message: 'Email verification sent',
    }
  }

  getCourseByIdAndInstitution(courseId: number, institutionId: number): Promise<Course> {
    const course = this.courseRepository.findOneBy({ id: courseId, institutionId })

    if (!course) {
      throw new NotFoundException(CourseErrorMessage.COURSE_NOT_FOUND)
    }
    return course
  }

  /**
   * Retrieves courses by their IDs within a specific site and institution
   * @param courseIds Array of course IDs to retrieve
   * @param siteId Site identifier
   * @param institutionId Institution identifier
   * @returns Promise<Course[]> Array of matching courses (may be fewer than requested if some don't exist)
   */
  async getCoursesByIds(courseIds: number[], siteId: number, institutionId: number) {
    if (!courseIds || courseIds.length === 0) {
      return []
    }

    return this.courseRepository.find({
      where: {
        id: In(courseIds),
        siteId,
        institutionId,
      },
      select: ['id'],
    })
  }

  async archiveCourse(courseId: number) {
    const course = await this.courseRepository.findOneBy({ id: courseId })

    if (!course) {
      throw new NotFoundException(CourseErrorMessage.COURSE_NOT_FOUND)
    }

    if (course.isArchived) {
      throw new BadRequestException('Course is already archived')
    }

    // Run validation before archiving (same as old publish validation)
    const errorMessages = []

    // check course name
    const invalidName = this.checkDataForPublish('name', 'name', course)
    if (invalidName) errorMessages.push(invalidName)

    const invalidPath = this.checkDataForPublish('path', 'path', course)
    if (invalidPath) errorMessages.push(invalidPath)

    // check long-description
    const invalidLongDescription = this.checkDataForPublish(
      'longDescriptions',
      'longDescriptions',
      course
    )
    if (invalidLongDescription) errorMessages.push(invalidLongDescription)

    // check recruitment time valid
    const recruitEndFail = this.checkRecruitmentTimeForPublish(course)
    if (recruitEndFail) errorMessages.push(recruitEndFail)

    if (errorMessages.filter((item) => item !== null).length > 0) {
      throw new FieldValidationFailedException(errorMessages)
    }

    // Use transaction to ensure data consistency
    return await this.courseRepository.manager.transaction(async (manager) => {
      // Archive the main course
      const updatedCourse = await manager.save(Course, {
        ...course,
        isArchived: true, // true = archived
      })

      // Archive all related classes (only those not already archived)
      const updateResult = await manager
        .createQueryBuilder()
        .update(ClassEntity)
        .set({ isArchived: true, archivedAt: () => 'CURRENT_TIMESTAMP' })
        .where('courseId = :courseId AND isArchived = :archived', { courseId, archived: false })
        .execute()

      return {
        course: updatedCourse,
        archivedClassesCount: updateResult.affected || 0,
      }
    })
  }

  async unarchiveCourse(courseId: number) {
    const course = await this.courseRepository.findOneBy({ id: courseId })

    if (!course) {
      throw new NotFoundException(CourseErrorMessage.COURSE_NOT_FOUND)
    }

    if (!course.isArchived) {
      throw new BadRequestException('Course is not archived')
    }

    return await this.courseRepository.manager.transaction(async (manager) => {
      const updatedCourse = await manager.save(Course, {
        ...course,
        isArchived: false, // false = unarchived
      })

      const updateResult = await manager
        .createQueryBuilder()
        .update(ClassEntity)
        .set({
          isArchived: false,
          archivedAt: null,
        })
        .where('courseId = :courseId AND isArchived = :archived', { courseId, archived: true })
        .execute()

      return {
        course: updatedCourse,
        unarchivedClassesCount: updateResult.affected || 0,
      }
    })
  }

  async getArchivedCourses(institutionId: number): Promise<{ courses: Course[]; count: number }> {
    const [courses, count] = await Promise.all([
      this.courseRepository.find({
        where: {
          institutionId,
          isArchived: true,
        },
        relations: this.courseWithRelations,
      }),
      this.courseRepository.count({
        where: {
          institutionId,
          isArchived: true,
        },
      }),
    ])

    return { courses, count }
  }

  async hasInvoices(courseId: number): Promise<boolean> {
    const classIds = await this.classRepository.find({
      where: { courseId },
      select: ['id'],
    })

    if (classIds.length === 0) return false

    const invoiceCount = await this.studentScheduleRepository.count({
      where: {
        classId: In(classIds.map((c) => c.id)),
        invoice: { id: Not(null) },
      },
      relations: { invoice: true },
    })

    return invoiceCount > 0
  }

  async createOrUpdateEmailSettings(dto: CreateCourseEmailSettingsDTO) {
    if (dto.courseId == null) {
      throw new BadRequestException('courseId is required to update email settings')
    }

    if (dto.institutionId == null) {
      throw new BadRequestException('institutionId is required')
    }

    const course = await this.getOneOrFail({
      id: dto.courseId,
      institutionId: dto.institutionId,
    } as FindOptionsWhere<Course>)
    course.emailSettings = {
      ...(course.emailSettings || {}),
      ...(dto.emailTitle !== undefined ? { emailTitle: dto.emailTitle } : {}),
      ...(dto.emailId !== undefined ? { emailId: dto.emailId } : {}),
    }
    return this.courseRepository.save(course)
  }
}
