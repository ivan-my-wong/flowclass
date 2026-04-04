import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { zonedTimeToUtc } from 'date-fns-tz'
import * as dayjs from 'dayjs'
import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  Not,
  ObjectLiteral,
} from 'typeorm'

import { CreateClassRegularScheduleDto } from '@/application/admin/class-regular-schedules/dto/class-regular-schedules.dto'
import {
  BulkUpdateClassDTO,
  ClassPageOptionDTO,
  CreateClassWithCourseDTO,
  CreateClassWithoutCourseDTO,
  RegularCoursePageOptionDTO,
  UpdateClassDTO,
} from '@/application/admin/courses/dto/create-or-update-class.dto'
import { LessonDateDTO } from '@/application/admin/courses/dto/create-or-update-lesson-date.dto'
import { ValidatelessonsDto } from '@/application/admin/courses/dto/create-or-update-lessons.dto'
import {
  CreateRegularPeriodsDto,
  UpdateRegularPeriodsDto,
} from '@/application/admin/courses/dto/create-or-update-regular-periods.dto'
import { DeleteLessonPhaseDto } from '@/application/admin/courses/dto/delete-lesson-phase.dto'
import { SetMultipleClassDto } from '@/application/admin/courses/dto/setMultipleClass.dto'
import {
  CreateRepeatFormatDto,
  UpdateRepeatFormatDto,
} from '@/application/admin/institutions/dto/institution-repeat-format.dto'
import { classSelectRelations } from '@/common/constants/class.constants'
import { CourseErrorMessage } from '@/exceptions/error-message/course'
import { ErrorCode } from '@/exceptions/error-message/errors'
import { FieldValidationFailedException } from '@/exceptions/field-validation.exception'
import { ClassEntity } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import { RecurringSchedulesRepository } from '@/models/course-recurring-schedules.entity'
import { RegularPeriods, RegularPeriodsRepository } from '@/models/course-regular-periods.entity'
import { Course } from '@/models/courses.entity'
import { CoursesRepository } from '@/models/courses.repository'
import { EnrollCourseRepository } from '@/models/enroll-courses.repository'
import { ClassTypeEnum, PriceType } from '@/models/enums'
import { InvoiceRepository } from '@/models/invoice.repository'
import { RepeatFormats, RepeatFormatsRepository } from '@/models/repeat-formats.entity'
import { SitesRepository } from '@/models/sites.repository'
import { User } from '@/models/user.entity'
import { BaseService } from '@/modules/base/base.service'
import { softRemoveWithRelation } from '@/utils/database.utils'
import { sortByCriterias, trimMetaData } from '@/utils/response.utils'
import { shallow } from '@/utils/shallow.utils'

import { AppointmentService } from './appointment.service'
import { ClassLessonService } from './class-lesson.service'
import { ClassPriceOptionService } from './class-price-option.service'
import { ClassRegularSchedulesV2Service } from './class-regular-schedules.service'
import { RecurringSchedulesService } from './course-recurring-schedules.service'
import { LocationRoomService } from './location-room.service'
import { RegularPeriodsService } from './regular-periods.service'

@Injectable()
export class ClassService extends BaseService<ClassEntity> {
  private readonly logger = new Logger(ClassService.name)

  constructor(
    private readonly classRepository: ClassRepository,
    private readonly regularPeriodsService: RegularPeriodsService,
    private readonly regularPeriodsRepository: RegularPeriodsRepository,
    private readonly lessonDateRepository: RecurringSchedulesRepository,
    private readonly courseRepository: CoursesRepository,
    private readonly recurringSchedulesService: RecurringSchedulesService,
    private readonly repeatFormatsRepository: RepeatFormatsRepository,
    private readonly sitesRepository: SitesRepository,
    private readonly appointmentService: AppointmentService,
    private readonly locationRoomService: LocationRoomService,
    private readonly classLessonService: ClassLessonService,
    private readonly classPriceOptionService: ClassPriceOptionService,
    private readonly classRegularSchedulesV2Service: ClassRegularSchedulesV2Service,
    private readonly invoicesRepository: InvoiceRepository,
    private readonly enrollCoursesRepository: EnrollCourseRepository
  ) {
    super(classRepository)
  }

  private validateApplicationPeriod(ap?: {
    startDatetime?: Date | string
    endDatetime?: Date | string
  }) {
    if (!ap) return
    const start = ap.startDatetime ? new Date(ap.startDatetime) : null
    const end = ap.endDatetime ? new Date(ap.endDatetime) : null
    if ((start && Number.isNaN(start.getTime())) || (end && Number.isNaN(end.getTime()))) {
      throw new BadRequestException(CourseErrorMessage.INVALID_APPLICATION_PERIOD_DATETIME)
    }
    // If equality is allowed, change < to <= and update the message accordingly.
    if (start && end && start.getTime() >= end.getTime()) {
      throw new BadRequestException(CourseErrorMessage.APPLICATION_PERIOD_END_BEFORE_START)
    }
  }

  async listClasses(institutionId: number, includeArchived = false): Promise<ClassEntity[]> {
    const whereCondition: any = {
      institutionId,
      type: Not(ClassTypeEnum.REGULAR),
    }

    if (!includeArchived) {
      whereCondition.isArchived = false
    }

    return this.classRepository.find({
      where: whereCondition,
      relations: {
        course: true,
        instructor: true,
        locationRoom: true,
        regularScheduleV2: {
          periodsV2: {
            lessonRepeatFormat: true,
          },
        },
        recurringSchedules: {
          studentSchedules: true,
        },
        regularPeriods: {
          lessons: true,
        },
        recurringFormat: true,
      },
      select: classSelectRelations,
    })
  }

  async getDetailClass(classId: number, institutionId: number): Promise<ClassEntity | undefined> {
    return this.classRepository.findOne({
      where: { id: classId, type: Not(ClassTypeEnum.REGULAR), institutionId },
      relations: {
        course: true,
        instructor: true,
        locationRoom: true,
        regularPeriods: {
          lessons: true,
        },
        regularScheduleV2: {
          periodsV2: {
            lessonRepeatFormat: true,
          },
        },
        recurringFormat: true,
        appointment: {
          availability: true,
        },
        recurringSchedules: {
          studentSchedules: true,
        },
      },
      select: classSelectRelations,
    })
  }

  async previewRecurringLessons(
    classId: number,
    institutionId: number,
    date: string,
    lessonDateId: number
  ) {
    // Implementation for previewing lessons by classType
    const classEntity = await this.getDetailClass(classId, institutionId)
    if (!classEntity) {
      throw new NotFoundException(CourseErrorMessage.CLASS_NOT_FOUND)
    }
    return this.recurringSchedulesService.previewRecurringLessons(date, classEntity, lessonDateId)
  }

  private setDerivedTuition(entity: ClassEntity): void {
    if (entity.priceType !== PriceType.MULTIPLE_OPTIONS && entity.priceOptions?.length) {
      entity.tuition = entity.priceOptions[0].amount
    }
  }

  async findOneByName(siteId: number, institutionId: number, courseId: number, className: string) {
    const classResult = await this.classRepository.findOneBy({
      siteId,
      institutionId,
      courseId,
      name: className,
    })

    return classResult
  }

  async getAllRegularCourseClasses(dto: RegularCoursePageOptionDTO) {
    const whereCondition: FindOptionsWhere<ClassEntity> = {}
    if (dto.institutionId) {
      whereCondition.institutionId = dto.institutionId
    }
    // whereCondition.type = CourseTypeEnum.REGULAR;

    const orderOption: FindOptionsOrder<Course> = {}
    if (dto.orderBy) {
      orderOption[dto.orderBy] = dto.order
    }

    const relations: FindOptionsRelations<Course> = {
      classes: true,
    }

    const courses = await this.courseRepository.pagination(
      dto,
      whereCondition,
      orderOption,
      relations
    )
    return courses
  }

  /** ========================================================================================================
   * TODO
   * @param dto CreateClassDTO
   */
  async createClass(
    dto: CreateClassWithCourseDTO | CreateClassWithoutCourseDTO,
    course: Course,
    user?: User
  ) {
    dto.createdBy = user?.id
    dto.updatedBy = user?.id
    this.validateApplicationPeriod(dto.applicationPeriod)
    /**
     * STEP 1: CREATE CLASS
     */
    const created = this.classRepository.create({
      siteId: dto.siteId,
      institutionId: dto.institutionId,
      courseId: dto.courseId,
      name: dto.name,
      type: dto.type,
      quota: dto.quota,
      priceType: dto.priceType,
      dropIn: dto.dropIn,
      enrollmentOffset: dto.enrollmentOffset,
      discountedPrice: dto.discountedPrice,
      teachingLanguage: dto.teachingLanguage,
      locality: dto.locality,
      detailAddress: dto.detailAddress,
      classDescription: dto.classDescription,
      classMeetingUrl: dto.classMeetingUrl,
      classRemark: dto.classRemark,
      createdBy: dto.createdBy,
      updatedBy: dto.updatedBy,
      isArchived: dto.isArchived ?? false,

      setMultipleClass: dto.setMultipleClass ?? false,
      setMultipleApplicant: dto.setMultipleApplicant ?? false,
      applicationPeriod: dto.applicationPeriod,
    })

    const classSaved = await this.classRepository.save(created)

    /**
     * STEP 2: CREATE PRICE OPTIONS
     */

    if (dto.priceType === PriceType.MULTIPLE_OPTIONS) {
      if (!dto.priceOptions || dto.priceOptions.length === 0) {
        throw new BadRequestException(
          'Multiple price options required for MULTIPLE_OPTIONS price type'
        )
      }

      await this.classPriceOptionService.createForClass(
        classSaved.id,
        dto.priceType,
        dto.priceOptions,
        user
      )
    } else {
      if (!dto.priceOptions?.length) {
        throw new BadRequestException('At least one price option is required')
      }
      if (dto.priceOptions.length > 1) {
        throw new BadRequestException(
          `priceType ${dto.priceType} expects a single option but ${dto.priceOptions.length} provided`
        )
      }

      await this.classPriceOptionService.createForClass(
        classSaved.id,
        dto.priceType,
        [dto.priceOptions[0]],
        user
      )
    }

    /**
     * STEP 3: CREATE CLASS TYPE SPECIFIC DATA
     */
    const classWithRelations = await this.getClassById(classSaved.id)

    if (dto.type === ClassTypeEnum.REGULAR_V2) {
      let regularScheduleDto: CreateClassRegularScheduleDto = {
        classId: classSaved.id,
        siteId: dto.siteId,
        institutionId: dto.institutionId,
        courseId: dto.courseId,
      }

      if (dto.regularScheduleV2) {
        // Strip identity/relation fields from the original schedule to avoid
        // duplicate key errors when duplicating a class
        const {
          id: _id,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          deletedAt: _deletedAt,
          createdBy: _createdBy,
          updatedBy: _updatedBy,
          classId: _classId,
          siteId: _siteId,
          institutionId: _institutionId,
          courseId: _courseId,
          classEntity: _classEntity,
          ...scheduleFields
        } = dto.regularScheduleV2 as any
        regularScheduleDto = {
          ...regularScheduleDto,
          ...scheduleFields,
        }
      }

      const regularSchedule = await this.classRegularSchedulesV2Service.create(regularScheduleDto)

      classSaved.regularScheduleV2 = regularSchedule

      await this.classRepository.update(
        { id: classSaved.id },
        { regularScheduleId: regularSchedule.id }
      )
      this.setDerivedTuition(classWithRelations)
      return classWithRelations
    }
    if ([ClassTypeEnum.REGULAR, ClassTypeEnum.WORKSHOP].includes(dto.type)) {
      this.setDerivedTuition(classWithRelations)
      return this.setupRegularPeriods(classWithRelations, dto, user)
    } else if ([ClassTypeEnum.SUBSCRIPTION, ClassTypeEnum.RECURRING].includes(dto.type)) {
      return this.setupRecurringClass(classWithRelations, dto)
    } else if (dto.type === ClassTypeEnum.APPOINTMENT) {
      await this.setupRecurringClass(classWithRelations, dto)

      const appointment = await this.appointmentService.createWithClass(user, {
        ...dto.appointment,
        institutionId: dto.institutionId,
        classId: classSaved.id,
        siteId: dto.siteId,
      })

      classWithRelations.appointmentId = appointment.id
      classWithRelations.appointment = appointment
      return classWithRelations
    }
    return classSaved
  }

  async setupRegularPeriods(
    created: ClassEntity,
    createClassDTO: CreateClassWithCourseDTO,
    user?: User
  ) {
    const regularPeriods = await this.createRegularPeriods(
      createClassDTO.regularPeriods,
      created.siteId,
      created.institutionId,
      created.courseId,
      created.id,
      user
    )

    created.regularPeriods = regularPeriods
    return created
  }

  async setupRecurringClass(created: ClassEntity, createClassDTO: CreateClassWithCourseDTO) {
    const updatedRecurringFormats = await this.createOrUpdateRecurringFormats(
      created,
      createClassDTO.recurringFormat
    )
    created.recurringFormat = updatedRecurringFormats

    if (createClassDTO.recurringSchedules && createClassDTO.recurringSchedules.length > 0) {
      const lessonDatesToCreate = createClassDTO.recurringSchedules?.map((item) => {
        // Check if the weekDay value is valid
        if ((!item.weekDay && item.weekDay !== 0) || !item.startTime || !item.endTime) {
          throw new Error(`Invalid lesson date item: ${JSON.stringify(item)}`)
        } else {
          return {
            classId: created.id,
            weekDay: item.weekDay,
            startTime: item.startTime,
            endTime: item.endTime,
          }
        }
      })

      const cleanedLessonDates = lessonDatesToCreate.filter((item) => !!item)
      const createdLessonDates = await this.lessonDateRepository.save(cleanedLessonDates)

      created.recurringSchedules = createdLessonDates
    }
    return created
    // return await this.getClassById(created.id)
  }

  async createRegularPeriods(
    periodJSONs: CreateRegularPeriodsDto[],
    siteId: number,
    institutionId: number,
    courseId: number,
    classId: number,
    user?: User
  ) {
    const results = []
    if (!periodJSONs || !(periodJSONs instanceof Array)) {
      return results
    }
    const promises = periodJSONs.map(async (periodJSON: CreateRegularPeriodsDto) => {
      const dto = {
        ...shallow({
          source: periodJSON,
          fields: Object.keys(periodJSON).filter((key) => key !== 'id'),
        }),
        siteId,
        institutionId,
        courseId,
        classId,
      }

      return await this.regularPeriodsService.create(dto, user)
    })

    return await Promise.all(promises)
  }

  async createOrUpdateRegularPeriods(
    periodJSONs: CreateRegularPeriodsDto[] | UpdateRegularPeriodsDto[],
    siteId: number,
    institutionId: number,
    courseId: number,
    classEntity: ClassEntity,
    user?: User
  ) {
    const results = []
    if (!periodJSONs || !(periodJSONs instanceof Array)) {
      return results
    }

    const promises = periodJSONs.map(
      async (periodJSON: CreateRegularPeriodsDto | UpdateRegularPeriodsDto) => {
        if ('id' in periodJSON && periodJSON.id) {
          if (periodJSON.deleted) {
            await this.deleteLessonPhase({ lessonId: periodJSON.id, classId: periodJSON.classId })
            return
          }

          const dto = {
            ...periodJSON,
            classId: classEntity.id,
            siteId,
            institutionId,
            courseId,
          }
          const updated = await this.regularPeriodsService.update(dto, user)
          if (dto.repeatFormat) {
            updated.repeatFormat = await this.createOrUpdateRecurringFormats(
              classEntity,
              dto.repeatFormat
            )
          }
          return updated
        } else {
          const dto = {
            ...periodJSON,
            classId: classEntity.id,
            siteId,
            institutionId,
            courseId,
          }

          const periodObject = await this.regularPeriodsService.create(dto, user)
          return periodObject
        }
      }
    )

    return await Promise.all(promises)
  }

  async createOrUpdateRecurringFormats(
    classEntity: ClassEntity,
    recurringFormats: CreateRepeatFormatDto | UpdateRepeatFormatDto
  ) {
    let found: RepeatFormats
    if ('id' in recurringFormats && recurringFormats.id) {
      found = await this.repeatFormatsRepository.findOne({
        where: { id: recurringFormats.id },
      })
    }

    if (found) {
      const result = await this.repeatFormatsRepository.save({
        ...found,
        ...recurringFormats,
      })
      await this.classRepository.update({ id: classEntity.id }, { recurringFormat: result })
      return result
    } else {
      const result = await this.repeatFormatsRepository.save({
        ...recurringFormats,
        institutionId: classEntity.institutionId,
      })
      await this.classRepository.update({ id: classEntity.id }, { recurringFormat: result })
      return result
    }
  }

  async getAllRegularPeriodsLessons(classId: number) {
    return await this.regularPeriodsService.getAll(classId)
  }

  async deleteLessonPhase(dto: DeleteLessonPhaseDto) {
    const { lessonId, classId } = dto
    const lesson = await this.regularPeriodsService.findOneBy({
      id: lessonId,
      classId,
    })
    if (!lesson) {
      throw new BadRequestException('Can not find any lesson with id: ' + lessonId)
    }
    return await this.regularPeriodsService.deleteBy(lessonId, classId)
  }

  async updateLessonDates(recurringSchedules: LessonDateDTO[]) {
    const results = []

    if (!recurringSchedules || !(recurringSchedules instanceof Array)) {
      return results
    }

    for (let i = 0; i < recurringSchedules.length; i++) {
      const lessonDate = recurringSchedules[i]
      if (lessonDate.deleted) {
        await this.recurringSchedulesService.deleteBy(lessonDate.id)
        continue
      }

      const dto = new LessonDateDTO()
      Object.assign(dto, lessonDate)
      const updated = await this.recurringSchedulesService.upsert(dto)

      trimMetaData(updated)
      results.push(updated)
    }

    return results
  }

  async getClassById(id: number) {
    const classEntity = await this.classRepository.findOne({
      where: { id },
      relations: {
        locationRoom: true,
        instructor: true,
        priceOptions: true,
        recurringFormat: true,
      },
    })

    if (classEntity) {
      this.setDerivedTuition(classEntity)
    }

    return classEntity
  }

  /** ========================================================================================================
   * TODO
   * @param dto CreateClassDTO
   */
  async updateClass(dto: UpdateClassDTO, user?: User) {
    dto.updatedBy = user?.id

    const {
      regularPeriods,
      regularScheduleV2,
      recurringSchedules,
      recurringFormat,
      priceOptions,
      appointment,
      ...classDto
    } = dto
    const found = await this.getClassById(dto.id)

    if (found) {
      await this.classRepository.update(
        {
          id: dto.id,
        },
        classDto
      )

      if (priceOptions && priceOptions.length > 0) {
        await this.classPriceOptionService.createForClass(dto.id, dto.priceType, priceOptions, user)
      }

      return this.getClassById(dto.id)
    } else {
      throw new BadRequestException(
        'Can not find any class with id: ' + dto.id + ' and courseId: ' + dto.courseId
      )
    }
  }

  async updateSingleClass(dto: UpdateClassDTO, user?: User) {
    this.validateApplicationPeriod(dto.applicationPeriod)
    const updated = await this.updateClass(dto, user)

    if (dto.type === ClassTypeEnum.REGULAR_V2) {
      const regularSchedule = await this.classRegularSchedulesV2Service.update(
        updated.regularScheduleId,
        dto.regularScheduleV2
      )

      updated.regularScheduleV2 = regularSchedule
    } else if (dto.type === ClassTypeEnum.REGULAR || dto.type === ClassTypeEnum.WORKSHOP) {
      // First, check if any of the period no longer exists in the new data
      const existingRegularPeriods: RegularPeriods[] = await this.regularPeriodsRepository.find({
        where: { classId: dto.id },
      })

      const regularPeriodsToBeUpdated: Array<any> = dto.regularPeriods
      if (existingRegularPeriods.length > 0) {
        const listOfNewRegularPeriodIds = dto.regularPeriods.map((classes) => classes.id)

        existingRegularPeriods.forEach((classItem) => {
          if (!listOfNewRegularPeriodIds.includes(classItem.id)) {
            regularPeriodsToBeUpdated.push({ ...classItem, deleted: true })
          }
        })
      }

      const regularPeriods = await this.createOrUpdateRegularPeriods(
        regularPeriodsToBeUpdated as CreateRegularPeriodsDto[] | UpdateRegularPeriodsDto[],
        updated.siteId,
        updated.institutionId,
        updated.courseId,
        updated,
        user
      )

      updated.regularPeriods = regularPeriods
    } else if (dto.type === ClassTypeEnum.RECURRING) {
      const updatedRecurringFormats = await this.createOrUpdateRecurringFormats(
        updated,
        dto.recurringFormat
      )
      updated.recurringFormat = updatedRecurringFormats
      const updatedRecurringSchedules = await this.updateLessonDates(dto.recurringSchedules)
      updated.recurringSchedules = updatedRecurringSchedules
      if (dto.applicationPeriod !== undefined) {
        updated.applicationPeriod = dto.applicationPeriod
      }
    } else if (dto.type === ClassTypeEnum.SUBSCRIPTION) {
      const updatedRecurringFormats = await this.createOrUpdateRecurringFormats(
        updated,
        dto.recurringFormat
      )
      updated.recurringFormat = updatedRecurringFormats
    } else if (dto.type === ClassTypeEnum.APPOINTMENT) {
      if (dto.applicationPeriod !== undefined) {
        updated.applicationPeriod = dto.applicationPeriod
      }
      const updatedRecurringFormats = await this.createOrUpdateRecurringFormats(
        updated,
        dto.recurringFormat
      )

      updated.recurringFormat = updatedRecurringFormats

      if (!updated.appointment && !dto.appointmentId) {
        const updatedAppointment = await this.appointmentService.createWithClass(user, {
          ...dto.appointment,
          institutionId: dto.institutionId,
          classId: updated.id,
          siteId: dto.siteId,
        })
        updated.appointment = updatedAppointment
      } else {
        const updatedAppointment = await this.appointmentService.update(
          dto.appointmentId,
          dto.appointment,
          user
        )
        updated.appointment = updatedAppointment
      }
    }

    this.setDerivedTuition(updated)

    return updated
  }

  async bulkUpdateClasses(dto: BulkUpdateClassDTO, user?: User) {
    const classes = dto.classes
    const updatedClasses = await Promise.all(
      classes.map(async (classDTO) => {
        return this.updateSingleClass(classDTO, user)
      })
    )
    return updatedClasses
  }

  async deleteClass(id: number): Promise<ClassEntity> {
    const found = await this.classRepository.findOneBy({ id })
    if (!found) {
      throw new BadRequestException('Can not find any class with id: ' + id)
    }

    const whereDeleteObject: FindOptionsWhere<ObjectLiteral> = {
      id,
    }

    const whereDeleteRelationObject: FindOptionsWhere<ObjectLiteral> = {
      classId: id,
    }

    await softRemoveWithRelation(
      this.classRepository.manager,
      'ClassEntity',
      whereDeleteObject,
      whereDeleteRelationObject
    )
    return found
  }

  async softDeleteClass(id: number): Promise<ClassEntity> {
    const found = await this.classRepository.findOneBy({ id })
    if (!found) {
      throw new BadRequestException('Can not find any class with id: ' + id)
    }

    const whereDeleteObject: FindOptionsWhere<ObjectLiteral> = {
      id,
    }

    const whereDeleteRelationObject: FindOptionsWhere<ObjectLiteral> = {
      classId: id,
    }

    await softRemoveWithRelation(
      this.classRepository.manager,
      'ClassEntity',
      whereDeleteObject,
      whereDeleteRelationObject
    )
    return found
  }

  async setMultipleClass(setMultipleClassDto: SetMultipleClassDto) {
    const found = await this.classRepository.findOne({
      where: { id: setMultipleClassDto.classId },
    })
    if (!found) {
      throw new BadRequestException(
        'Can not find any class with id: ' + setMultipleClassDto.classId
      )
    }
    found.setMultipleClass = !found.setMultipleClass
    return await this.classRepository.save(found)
  }

  async validateTimeslot(institutionId: number, payload?: ValidatelessonsDto) {
    const { classId, lessons } = payload || {}

    let baseClass: ClassEntity | null = null
    let inputLessons: { startTime: Date; endTime: Date; id?: string }[] = []

    if (classId) {
      baseClass = await this.classRepository.findOne({ where: { id: classId } })
      if (!baseClass) throw new BadRequestException(ErrorCode.CLASS_NOT_FOUND)

      if (!lessons || lessons.length === 0) {
        throw new BadRequestException('Lessons must be provided if classId is specified.')
      }

      inputLessons = lessons.map((l: any) => ({
        id: l.id || l.uid,
        startTime: new Date(l.startTime),
        endTime: new Date(l.endTime),
      }))
    }

    const listClass = await this.classRepository.find({
      where: {
        institutionId,
        type: Not(ClassTypeEnum.SUBSCRIPTION),
        ...(classId ? { id: Not(classId) } : {}),
      },
      relations: {
        locationRoom: true,
        instructor: true,
        regularPeriods: { lessons: true },
        recurringSchedules: true,
      },
    })

    const site = await this.sitesRepository.findOne({
      where: { institutions: { id: institutionId } },
    })
    const timeZone = site?.timeZone?.id ?? 'Asia/Hong_Kong'

    const groupBy = <T extends keyof ClassEntity>(
      arr: ClassEntity[],
      key: T
    ): Record<string, ClassEntity[]> => {
      return arr.reduce((acc, item) => {
        const id = item[key]
        if (!id) return acc
        const keyId = id.toString()
        if (!acc[keyId]) acc[keyId] = []
        acc[keyId].push(item)
        return acc
      }, {} as Record<string, ClassEntity[]>)
    }

    const getDateFromTime = (hour: number, minute: number, weekDay = 0): Date => {
      return dayjs().day(weekDay).hour(hour).minute(minute).toDate()
    }

    const isSameMinute = (time: Date, start: Date, end: Date) => {
      return dayjs(time).isBetween(start, end, 'minute', '[]')
    }

    const getLessonsFromClass = (
      classess: ClassEntity
    ): { startTime: Date; endTime: Date; weekDay?: number; id?: string }[] => {
      const results = []

      if (classess.type === ClassTypeEnum.RECURRING) {
        for (const sched of classess.recurringSchedules) {
          const [schedStartHour, schedStartMinute] = sched.startTime.toString().split(':')
          const [schedEndHour, schedEndMinute] = sched.endTime.toString().split(':')
          const schedStart = getDateFromTime(+schedStartHour, +schedStartMinute, sched.weekDay)
          const schedEnd = getDateFromTime(+schedEndHour, +schedEndMinute, sched.weekDay)
          results.push({
            startTime: schedStart,
            endTime: schedEnd,
            weekDay: sched.weekDay,
          })
        }
      } else {
        for (const period of classess.regularPeriods) {
          for (const l of period.lessons) {
            results.push({
              startTime: new Date(l.startTime),
              endTime: new Date(l.endTime),
              id: l.id,
            })
          }
        }
      }
      return results
    }

    const checkConflict = (
      compareAgainst: {
        startTime: Date
        endTime: Date
        weekDay?: number
        id?: string
        uid?: string
      }[],
      targetClass: ClassEntity
    ): ClassEntity | null => {
      const lessonsSameIds: any[] = []

      if (targetClass.type !== ClassTypeEnum.RECURRING) {
        for (const period of targetClass.regularPeriods) {
          for (const l of period.lessons) {
            for (const item of compareAgainst) {
              const sameStart = isSameMinute(item.startTime, l.startTime, l.endTime)
              const sameEnd = isSameMinute(item.endTime, l.startTime, l.endTime)
              if (sameStart || sameEnd) {
                lessonsSameIds.push({
                  lessonId: item.id || item?.uid || '',
                  isSameStart: sameStart,
                  isSameEnd: sameEnd,
                })
              }
            }
          }
        }
      } else {
        for (const sched of targetClass.recurringSchedules) {
          const weekDay = sched.weekDay ?? 0
          const [schedStartHour, schedStartMinute] = sched.startTime.toString().split(':')
          const [schedEndHour, schedEndMinute] = sched.endTime.toString().split(':')
          const schedStart = getDateFromTime(+schedStartHour, +schedStartMinute, weekDay)
          const schedEnd = getDateFromTime(+schedEndHour, +schedEndMinute, weekDay)

          for (const item of compareAgainst) {
            const sameDay = dayjs(item.startTime).weekday() === weekDay
            const startTime = dayjs(zonedTimeToUtc(item.startTime, timeZone))
            const endTime = dayjs(zonedTimeToUtc(item.endTime, timeZone))

            const compareStart = getDateFromTime(startTime.hour(), startTime.minute(), weekDay)
            const compareEnd = getDateFromTime(endTime.hour(), endTime.minute(), weekDay)

            const sameStart = isSameMinute(compareStart, schedStart, schedEnd)
            const sameEnd = isSameMinute(compareEnd, schedStart, schedEnd)

            if ((sameStart || sameEnd) && sameDay) {
              lessonsSameIds.push({
                lessonId: item.id || item?.uid || '',
                isSameStart: sameStart,
                isSameEnd: sameEnd,
              })
            }
          }
        }
      }

      return lessonsSameIds.length > 0 ? ({ ...targetClass, lessonsSameIds } as ClassEntity) : null
    }

    const result = { classroom: [] as ClassEntity[], teacher: [] as ClassEntity[] }

    const checkGroupConflict = (group: Record<string, ClassEntity[]>, key: keyof typeof result) => {
      for (const groupId in group) {
        const groupList = group[groupId]

        if (classId && inputLessons.length) {
          for (const target of groupList) {
            if (target.id === classId) continue
            const conflict = checkConflict(inputLessons, target)
            if (conflict && !result[key].some((c) => c.id === conflict.id)) {
              result[key].push(conflict)
            }
          }
        } else {
          for (let i = 0; i < groupList.length; i++) {
            const base = groupList[i]
            const baseLessons = getLessonsFromClass(base)

            for (let j = 0; j < groupList.length; j++) {
              if (i === j) continue
              const target = groupList[j]
              const conflict = checkConflict(baseLessons, target)
              if (conflict && !result[key].some((c) => c.id === conflict.id)) {
                result[key].push(conflict)
              }
            }
          }
        }
      }
    }

    const byLocation = groupBy(listClass, 'locationId')
    const byInstructor = groupBy(listClass, 'instructorId')

    checkGroupConflict(byLocation, 'classroom')
    checkGroupConflict(byInstructor, 'teacher')

    return result
  }

  async getClassQuota(classId: number) {
    const classEntity = await this.getClassById(classId)
    if (!classEntity) throw new NotFoundException(CourseErrorMessage.CLASS_NOT_FOUND)
    const quotaData = {
      locationQuota: null,
      classQuota: null,
    }
    if (classEntity.locationId) {
      const { timeSlotQuota } = await this.locationRoomService.getLocationRoomQuota(
        classEntity.institutionId,
        classEntity.siteId,
        classEntity.locationId
      )
      quotaData.locationQuota = timeSlotQuota
    }
    const { timeSlotQuota } = await this.classLessonService.classQuotaByTimeSlot(classEntity)
    quotaData.classQuota = timeSlotQuota
    return quotaData
  }

  async archiveClass(classId: number): Promise<ClassEntity> {
    const classEntity = await this.classRepository.findOneBy({ id: classId })

    if (!classEntity) {
      throw new NotFoundException('Cannot find any class with id: ' + classId)
    }

    if (classEntity.isArchived) {
      throw new BadRequestException('Class is already archived')
    }

    const errorMessages = []

    if (errorMessages.length > 0) {
      throw new FieldValidationFailedException(errorMessages)
    }

    return await this.classRepository.save({
      ...classEntity,
      isArchived: true,
      archivedAt: new Date(),
    })
  }

  async unarchiveClass(classId: number): Promise<ClassEntity> {
    const classEntity = await this.classRepository.findOneBy({ id: classId })

    if (!classEntity) {
      throw new NotFoundException('Cannot find any class with id: ' + classId)
    }

    if (!classEntity.isArchived) {
      throw new BadRequestException('Class is not archived')
    }

    return await this.classRepository.save({
      ...classEntity,
      isArchived: false,
      archivedAt: null,
    })
  }

  async getClassDeletionStatus(classId: number) {
    const hasInvoices = await this.checkClassHasInvoices(classId)

    let invoiceCount = 0
    let enrollmentCount = 0

    if (hasInvoices) {
      const classEntity = await this.classRepository.findOne({
        where: { id: classId },
        select: ['id', 'courseId'],
      })

      if (classEntity) {
        // Get detailed counts for better UX messaging
        enrollmentCount = await this.enrollCoursesRepository.count({
          where: {
            courseId: classEntity.courseId,
            deletedAt: null,
          },
        })

        // Get total invoice count for this class
        invoiceCount = await this.invoicesRepository
          .createQueryBuilder('invoice')
          .innerJoin('invoice.enrollCourse', 'enrollCourse')
          .innerJoin('enrollCourse.course', 'course')
          .innerJoin('course.classes', 'class')
          .where('class.id = :classId', { classId })
          .andWhere('invoice.deletedAt IS NULL')
          .getCount()
      }
    }

    return {
      canDelete: !hasInvoices,
      hasInvoices,
      mustArchive: hasInvoices,
      invoiceCount,
      enrollmentCount,
      message: hasInvoices
        ? `Class has ${invoiceCount} invoice(s) from ${enrollmentCount} enrollment(s) and can only be archived`
        : 'Class can be deleted',
    }
  }

  private async checkClassHasInvoices(classId: number): Promise<boolean> {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      select: ['id', 'courseId'],
    })

    if (!classEntity) {
      return false
    }

    const invoiceCount = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .innerJoin('invoice.enrollCourse', 'enrollCourse')
      .innerJoin('enrollCourse.course', 'course')
      .innerJoin('course.classes', 'class')
      .where('class.id = :classId', { classId })
      .andWhere('invoice.deletedAt IS NULL')
      .getCount()

    return invoiceCount > 0
  }

  async getClassesWithArchiveStatus(dto: ClassPageOptionDTO) {
    const whereCondition: FindOptionsWhere<ClassEntity> = {}
    if (dto.courseId) {
      whereCondition.courseId = dto.courseId
    }

    const orderOption: FindOptionsOrder<ClassEntity> = {}
    if (dto.orderBy) {
      orderOption[dto.orderBy] = dto.order
    }

    const relations: FindOptionsRelations<ClassEntity> = {
      recurringSchedules: true,
      recurringFormat: true,
      regularPeriods: {
        lessons: true,
      },
      regularScheduleV2: {
        periodsV2: {
          lessonRepeatFormat: true,
        },
      },
      appointment: true,
      locationRoom: true,
      instructor: true,
      priceOptions: true,
    }

    // Get all classes (both active and archived)
    const allClasses = await this.classRepository.find({
      where: whereCondition,
      order: orderOption,
      relations,
    })

    // Separate active and archived classes
    const activeClasses = allClasses.filter((cls) => !cls.isArchived)
    const archivedClasses = allClasses.filter((cls) => cls.isArchived)

    // Process classes (same logic as existing getAllClassesOfCourse)
    const processClasses = async (classes: ClassEntity[]) => {
      for (let i = 0; i < classes.length; i++) {
        const classData = classes[i]
        sortByCriterias(classData, 'schedule', 'ASC', 'orderIndex', 'id')
        this.setDerivedTuition(classData)

        const regularPeriods = await this.regularPeriodsService.getAll(classData.id)
        classData.regularPeriods = regularPeriods
      }
      return classes
    }

    const processedActiveClasses = await processClasses(activeClasses)
    const processedArchivedClasses = await processClasses(archivedClasses)

    return {
      activeClasses: processedActiveClasses,
      archivedClasses: processedArchivedClasses,
      counts: {
        active: activeClasses.length,
        archived: archivedClasses.length,
        total: allClasses.length,
      },
    }
  }

  async getAllClassesOfCourse(dto: ClassPageOptionDTO, includeArchived = false) {
    const whereCondition: FindOptionsWhere<ClassEntity> = {}
    if (dto.courseId) {
      whereCondition.courseId = dto.courseId
    }

    // Exclude archived classes by default unless explicitly requested
    // if (!includeArchived) {
    //   whereCondition.isArchived = false
    // }

    // Rest of the existing implementation remains the same...
    const orderOption: FindOptionsOrder<ClassEntity> = {}
    if (dto.orderBy) {
      orderOption[dto.orderBy] = dto.order
    }

    const relations: FindOptionsRelations<ClassEntity> = {
      recurringSchedules: true,
      recurringFormat: true,
      regularPeriods: {
        lessons: true,
      },
      regularScheduleV2: {
        periodsV2: {
          lessonRepeatFormat: true,
        },
      },
      appointment: true,
      locationRoom: true,
      instructor: true,
      priceOptions: true,
      studentSchedules: true,
    }

    const pageData = await this.classRepository.pagination(
      dto,
      whereCondition,
      orderOption,
      relations
    )

    if (pageData?.content?.length > 0) {
      for (let i = 0; i < pageData?.content?.length; i++) {
        const classData = pageData?.content[i]
        sortByCriterias(classData, 'schedule', 'ASC', 'orderIndex', 'id')
        this.setDerivedTuition(classData)

        const regularPeriods = await this.regularPeriodsService.getAll(classData.id)
        classData.regularPeriods = regularPeriods
      }
    }
    return pageData
  }

  async validateClassAccess(classId: number, allowArchived = false): Promise<ClassEntity> {
    const classEntity = await this.getClassById(classId)

    if (!classEntity) {
      throw new NotFoundException('Class not found')
    }

    if (classEntity.isArchived && !allowArchived) {
      throw new BadRequestException(
        'This class has been archived and is no longer accepting new applications'
      )
    }

    return classEntity
  }

  async getClassInvoiceDetails(classId: number) {
    const classEntity = await this.classRepository.findOne({
      where: { id: classId },
      select: ['id', 'courseId', 'name'],
    })

    if (!classEntity) {
      throw new NotFoundException('Class not found')
    }

    // Get all invoices for this class with details
    const invoices = await this.invoicesRepository
      .createQueryBuilder('invoice')
      .innerJoin('invoice.enrollCourse', 'enrollCourse')
      .innerJoin('enrollCourse.course', 'course')
      .innerJoin('course.classes', 'class')
      .where('class.id = :classId', { classId })
      .andWhere('invoice.deletedAt IS NULL')
      .select(['invoice.id', 'invoice.payAmount', 'invoice.paymentState', 'invoice.createdAt'])
      .getMany()

    const totalAmount = invoices.reduce((sum, invoice) => sum + Number(invoice.payAmount), 0)

    return {
      classId,
      className: classEntity.name,
      courseId: classEntity.courseId,
      invoiceCount: invoices.length,
      totalAmount,
      invoices: invoices.map((invoice) => ({
        id: invoice.id,
        amount: invoice.payAmount,
        createdAt: invoice.createdAt,
      })),
    }
  }

  async getClassQuotaStudent(classId: number) {
    const classEntity = await this.getClassById(classId)
    if (!classEntity) throw new NotFoundException(CourseErrorMessage.CLASS_NOT_FOUND)
    const quotaData = {
      locationQuota: null,
      classQuota: null,
    }
    if (classEntity.locationId) {
      const { timeSlotQuota } = await this.locationRoomService.getLocationRoomQuotaStudent(
        classEntity.institutionId,
        classEntity.siteId,
        classEntity.locationId
      )
      quotaData.locationQuota = timeSlotQuota
    }
    const { timeSlotQuota } = await this.classLessonService.classQuotaByTimeSlotStudent(classEntity)
    quotaData.classQuota = timeSlotQuota
    return quotaData
  }

  async validateUniqueClassCode(
    classCode: string,
    institutionId: number,
    excludeClassId?: number
  ): Promise<void> {
    if (!classCode) return

    const existing = await this.classRepository.findOne({
      where: {
        classesCode: classCode,
        institutionId,
        ...(excludeClassId ? { id: Not(excludeClassId) } : {}),
      },
    })

    if (existing) {
      throw new BadRequestException(
        'Class ID already exists in this institution. Please choose a different ID.'
      )
    }
  }

  /**
   * Get all classes with their lessons for a specific course
   * This is used in Invoice Campaign to show all classes' lessons in one view
   * @param courseId Course ID
   * @param institutionId Institution ID
   * @param startDate Optional start date filter
   * @param endDate Optional end date filter
   * @returns Array of classes with their lessons
   */
  async getAllClassesLessonsInCourse(
    courseId: number,
    institutionId: number,
    startDate?: Date,
    endDate?: Date
  ) {
    // Get all classes in the course
    const classes = await this.classRepository.find({
      where: {
        courseId,
        institutionId,
        isArchived: false,
        type: Not(ClassTypeEnum.REGULAR), // Exclude old REGULAR type
      },
      relations: {
        course: true,
        instructor: true,
        locationRoom: true,
        regularScheduleV2: {
          periodsV2: {
            lessonRepeatFormat: true,
          },
        },
        recurringSchedules: true,
        regularPeriods: {
          lessons: true,
        },
        recurringFormat: true,
        appointment: {
          availability: true,
        },
      },
      select: classSelectRelations,
      order: {
        name: 'ASC',
      },
    })

    if (!classes || classes.length === 0) {
      return {
        courseId,
        courseName: '',
        classes: [],
      }
    }

    // Generate color for each class based on index
    const classColors = [
      '#3B82F6', // blue
      '#10B981', // green
      '#8B5CF6', // purple
      '#F59E0B', // yellow
      '#EC4899', // pink
      '#6366F1', // indigo
      '#EF4444', // red
      '#F97316', // orange
    ]

    // Get lessons for each class
    const classesWithLessons = await Promise.all(
      classes.map(async (classItem, index) => {
        let lessons: any[] = []

        try {
          // Get lessons based on class type
          if (classItem.type === ClassTypeEnum.REGULAR_V2) {
            // For regular classes, get lessons from regularScheduleV2
            if (classItem.regularScheduleV2?.id) {
              const previewData =
                await this.classRegularSchedulesV2Service.getRegularSchedulePreview(
                  classItem.regularScheduleV2.id,
                  0,
                  100 // Get up to 100 lessons
                )
              lessons = previewData?.lessons || []
            }
          } else if (classItem.type === ClassTypeEnum.WORKSHOP) {
            // For workshop, get lessons from regularPeriods
            lessons = classItem.regularPeriods?.flatMap((period) => period.lessons || []) || []
          } else if (classItem.type === ClassTypeEnum.RECURRING) {
            // For recurring classes, we'll need to generate preview lessons
            // Get the first recurring schedule
            if (classItem.recurringSchedules && classItem.recurringSchedules.length > 0) {
              const firstSchedule = classItem.recurringSchedules[0]
              const previewDate = startDate || new Date()
              const dateString = previewDate.toISOString().split('T')[0]

              try {
                const lessonStrings = await this.recurringSchedulesService.previewRecurringLessons(
                  dateString,
                  classItem,
                  firstSchedule.id
                )
                // Convert lesson strings to lesson objects
                lessons = lessonStrings.map((lessonStr, idx) => {
                  const [startTimeStr, endTimeStr] = lessonStr.split(' ')
                  return {
                    id: `${classItem.id}-${idx}`,
                    startTime: startTimeStr,
                    endTime: endTimeStr,
                    lessonNumber: idx + 1,
                  }
                })
              } catch (error) {
                this.logger.error(
                  `Error getting recurring lessons for class ${classItem.id}: ${error.message}`
                )
                lessons = []
              }
            }
          } else if (classItem.type === ClassTypeEnum.APPOINTMENT) {
            // For appointment classes, lessons are generated based on availability
            // We'll return empty for now as appointments are typically selected by students
            lessons = []
          }

          // Filter lessons by date range if provided
          if (lessons.length > 0 && (startDate || endDate)) {
            lessons = lessons.filter((lesson) => {
              const lessonStart = new Date(lesson.startTime)
              if (startDate && lessonStart < startDate) return false
              if (endDate && lessonStart > endDate) return false
              return true
            })
          }
        } catch (error) {
          this.logger.error(`Error getting lessons for class ${classItem.id}: ${error.message}`)
          lessons = []
        }

        return {
          classId: classItem.id,
          className: classItem.name,
          courseId: classItem.courseId,
          courseName: classItem.course?.name || '',
          type: classItem.type,
          color: classColors[index % classColors.length],
          instructor: classItem.instructor
            ? {
                id: classItem.instructor.id,
                fullName: classItem.instructor.fullName,
                email: classItem.instructor.email,
              }
            : undefined,
          locationRoom: classItem.locationRoom
            ? {
                id: classItem.locationRoom.id,
                name: classItem.locationRoom.name,
              }
            : undefined,
          lessons: lessons.map((lesson) => ({
            id: lesson.id,
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            lessonNumber: lesson.lessonNumber,
            date: lesson.date,
            period: lesson.period,
            isBlocked: lesson.isBlocked || false,
            isOverride: lesson.isOverride || false,
          })),
        }
      })
    )

    return {
      courseId,
      courseName: classes[0]?.course?.name || '',
      classes: classesWithLessons,
    }
  }
}
