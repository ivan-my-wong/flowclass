import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  addWeeks,
  Day,
  getDay,
  nextDay,
  setHours,
  setMilliseconds,
  setMinutes,
  setSeconds,
  subWeeks,
} from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'
import * as dayjs from 'dayjs'
import { In, Repository } from 'typeorm'

import { LessonDateDTO } from '@/application/admin/courses/dto/create-or-update-lesson-date.dto'
import { ApiError } from '@/common/api-formats/api-error'
import { ClassLessonService } from '@/domain/service/class-lesson.service'
import { SetingBlockTimeService } from '@/domain/service/setting-block-time.service'
import { ErrorCode } from '@/exceptions/error-message/errors'
import { ClassLesson } from '@/models/class-lessons.entity'
import { ClassEntity } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import {
  RecurringSchedules,
  RecurringSchedulesRepository,
} from '@/models/course-recurring-schedules.entity'
import { LessonString } from '@/models/custom-types/lesson-string'
import { RepeatFormats, RepeatFormatsRepository } from '@/models/repeat-formats.entity'
import { StudentLesson } from '@/models/student-lesson.entity'
import { BaseService } from '@/modules/base/base.service'
import {
  checkDateInBlockTimeRange,
  filterTimeslotStringsWithinPeriod,
  getCurrentTimeStamp,
} from '@/utils/time.utils'

import { ClassPriceOptionService } from './class-price-option.service'
import { SettingSiteService } from './setting-site.service'

type LessonSet = {
  [id: string]: LessonString[]
}

@Injectable()
export class RecurringSchedulesService extends BaseService<RecurringSchedules> {
  constructor(
    private lessonDateRepository: RecurringSchedulesRepository,
    private settingSiteService: SettingSiteService,
    @InjectRepository(ClassLesson)
    private classLessonRepository: Repository<ClassLesson>,
    @InjectRepository(StudentLesson)
    private readonly studentLessonRepository: Repository<StudentLesson>,
    private classLessonService: ClassLessonService,
    private readonly blockTimeService: SetingBlockTimeService,
    private readonly classPriceOptionService: ClassPriceOptionService,
    private readonly repeatFormatsRepository: RepeatFormatsRepository,
    private readonly classRepository: ClassRepository
  ) {
    super(lessonDateRepository)
  }

  async upsert(dto: LessonDateDTO) {
    const found = await this.lessonDateRepository.findOne({
      where: { id: dto.id | 0 },
    })
    if (found) {
      const updated = await this.lessonDateRepository.save({
        ...found,
        ...dto,
      })
      return updated
    } else {
      const crDto = new LessonDateDTO()
      Object.assign(crDto, dto)
      const created = await this.create(crDto)
      return created
    }
  }

  async create(dto: LessonDateDTO) {
    const created = this.lessonDateRepository.create(dto)
    return await this.lessonDateRepository.save({
      ...created,
    })
  }

  async deleteBy(id: number) {
    const found = await this.lessonDateRepository.findOne({
      where: { id: id | 0 },
    })
    if (found) {
      return await this.lessonDateRepository.save({
        ...found,
        deletedAt: getCurrentTimeStamp(),
      })
    }
  }

  async getAllLessonsByRecurringClassId(recurringClassId: number) {
    const recurringSchedules = await this.lessonDateRepository.find({
      where: { classId: recurringClassId },
    })

    return recurringSchedules.map((ld) => ld.id)
  }

  async previewRecurringLessons(
    date: string,
    classEntity: ClassEntity,
    lessonDateId: number,
    priceOptionId?: number
  ) {
    let numberOfLessons: number
    if (priceOptionId) {
      const priceOption = await this.classPriceOptionService.getById(priceOptionId)

      if (!priceOption || priceOption.classId !== classEntity.id) {
        throw new ApiError(ErrorCode.PRICE_OPTION_NOT_BELONGS_TO_CLASS)
      }

      numberOfLessons = priceOption.numberOfLessons
    } else {
      const recurringFormat = await this.repeatFormatsRepository.findOne({
        where: { id: classEntity.recurringFormat?.id },
      })
      numberOfLessons = recurringFormat?.times ?? classEntity.recurringFormat?.times ?? 1
    }
    const list = await this.getSingleClassRecurringLessons(
      date,
      lessonDateId,
      numberOfLessons,
      classEntity.siteId,
      classEntity.institutionId
    )
    const ap = classEntity.applicationPeriod
    const apStart = ap?.startDatetime ? new Date(ap.startDatetime) : null
    const apEnd = ap?.endDatetime ? new Date(ap.endDatetime) : null
    return apStart || apEnd ? filterTimeslotStringsWithinPeriod(list, apStart, apEnd) : list
  }

  async getSingleClassRecurringLessons(
    date: string,
    recurringScheduleId: number,
    numberOfLessons: number,
    siteId: number,
    institutionId: number
  ): Promise<string[]> {
    const timeZone = await this.settingSiteService.getTimeZone(siteId)
    const lessonDateDetail = await this.lessonDateRepository.findOne({
      where: { id: recurringScheduleId },
    })
    if (!lessonDateDetail)
      throw new BadRequestException(`Recurring Schedule Id ${recurringScheduleId} not found`)

    const blockTimeList = await this.blockTimeService.getBlockTimeArray({
      institutionId,
    })

    const lessonString = new LessonString(date)
    let startHour: number
    let startMinute: number
    let endHour: number
    let endMinute: number
    if (
      typeof lessonDateDetail.startTime === 'string' &&
      typeof lessonDateDetail.endTime === 'string'
    ) {
      const start = (lessonDateDetail.startTime as string).split(':').map(Number)
      startHour = start[0]
      startMinute = start[1]

      const end = (lessonDateDetail.endTime as string).split(':').map(Number)
      endHour = end[0]
      endMinute = end[1]
    } else {
      startHour = lessonDateDetail.startTime.getHours()
      startMinute = lessonDateDetail.startTime.getMinutes()
      endHour = lessonDateDetail.endTime.getHours()
      endMinute = lessonDateDetail.endTime.getMinutes()
    }
    const startDate = setMinutes(
      setHours(setSeconds(setMilliseconds(lessonString.getStartDate(), 0), 0), startHour),
      startMinute
    )
    const endDate = setMinutes(
      setHours(setSeconds(setMilliseconds(lessonString.getEndDate(), 0), 0), endHour),
      endMinute
    )
    const utcStartDate = zonedTimeToUtc(startDate, timeZone)
    const utcEndDate = zonedTimeToUtc(endDate, timeZone)
    return this.getRecurringWeekdayLessons({
      startDate: utcStartDate,
      endDate: utcEndDate,
      weekDay: lessonDateDetail.weekDay,
      numberOfLessons,
      includePassedInStartDate: true,
      blockTimeList,
      timeZone,
    })
  }

  async getStartingLessons(
    ids: number[],
    siteId: number,
    institutionId: number,
    numberOfLessons: number,
    numberOfPastLessons?: number
  ): Promise<LessonSet> {
    const timeZone = await this.settingSiteService.getTimeZone(siteId)
    const lessonsSet = {}
    const blockTimeList = await this.blockTimeService.getBlockTimeArray({
      institutionId,
    })

    for (let i = 0; i < ids.length; i++) {
      const lessonDetail = await this.lessonDateRepository.findOne({
        where: { id: ids[i] },
      })
      if (!lessonDetail) throw new BadRequestException(`Lesson id ${ids[i]} not found`)
      let startHour: number
      let startMinute: number
      let endHour: number
      let endMinute: number

      if (typeof lessonDetail.startTime === 'string' && typeof lessonDetail.endTime === 'string') {
        ;[startHour, startMinute] = (lessonDetail.startTime as string).split(':').map(Number)
        ;[endHour, endMinute] = (lessonDetail.endTime as string).split(':').map(Number)
      } else {
        startHour = lessonDetail.startTime.getHours()
        startMinute = lessonDetail.startTime.getMinutes()
        endHour = lessonDetail.endTime.getHours()
        endMinute = lessonDetail.endTime.getMinutes()
      }

      // Calculate the start date for past lessons
      const currentDate = new Date()
      const currentStartDate = setMinutes(
        setHours(setSeconds(setMilliseconds(currentDate, 0), 0), startHour),
        startMinute
      )
      const currentEndDate = setMinutes(
        setHours(setSeconds(setMilliseconds(currentDate, 0), 0), endHour),
        endMinute
      )

      const utcCurrentStartDate = zonedTimeToUtc(currentStartDate, timeZone)
      const utcCurrentEndDate = zonedTimeToUtc(currentEndDate, timeZone)
      const futureLessons = this.getRecurringWeekdayLessons({
        startDate: utcCurrentStartDate,
        endDate: utcCurrentEndDate,
        weekDay: lessonDetail.weekDay,
        numberOfLessons,
        blockTimeList,
        timeZone,
      })
      // Calculate the date 12 lessons ago (default settings)
      if (numberOfPastLessons > 0) {
        const pastStartDate = subWeeks(currentStartDate, numberOfPastLessons)
        const pastEndDate = subWeeks(currentEndDate, numberOfPastLessons)

        const utcPastStartDate = zonedTimeToUtc(pastStartDate, timeZone)
        const utcPastEndDate = zonedTimeToUtc(pastEndDate, timeZone)

        // Get both past and future lessons
        const pastLessons = this.getRecurringWeekdayLessons({
          startDate: utcPastStartDate,
          endDate: utcPastEndDate,
          weekDay: lessonDetail.weekDay,
          numberOfLessons: numberOfPastLessons,
          blockTimeList,
          timeZone,
        })

        // Combine past and future lessons, filtering out duplicates
        const allLessons = [...pastLessons, ...futureLessons].map((l) => l.toString())
        // filter by class applicationPeriod
        const klass = await this.classRepository.findOneById(lessonDetail.classId)
        const ap = klass?.applicationPeriod
        const apStart = ap?.startDatetime ? new Date(ap.startDatetime) : null
        const apEnd = ap?.endDatetime ? new Date(ap.endDatetime) : null
        const filtered =
          apStart || apEnd
            ? filterTimeslotStringsWithinPeriod(allLessons, apStart, apEnd)
            : allLessons
        lessonsSet[lessonDetail.id] = filtered
      }
    }
    return lessonsSet
  }

  async generateNextPostponeDate(
    institutionId: number,
    recurringFormat: RepeatFormats,
    startTime: Date,
    endTime: Date
  ) {
    const blockTimeList = await this.blockTimeService.getBlockTimeArray({
      institutionId,
    })
    const postponeStartDate = new Date(startTime)
    const postponeEndDate = new Date(endTime)
    // Use dayjs to add the time
    const nextPostponeStartDate = dayjs(postponeStartDate).add(1, 'week').toDate()
    const nextPostponeEndDate = dayjs(postponeEndDate).add(1, 'week').toDate()
    // Check if the next postpone date is in the block time list
    return this.checkDateInBlockTimeList(nextPostponeStartDate, nextPostponeEndDate, blockTimeList)
  }

  getRecurringWeekdayLessons({
    startDate,
    endDate,
    weekDay,
    numberOfLessons,
    includePassedInStartDate,
    blockTimeList,
    timeZone,
  }: {
    startDate: Date
    endDate: Date
    weekDay: number
    numberOfLessons: number
    includePassedInStartDate?: boolean
    blockTimeList?: string[]
    timeZone: string
  }) {
    const result = []

    for (let i = 0; i < numberOfLessons; i++) {
      let tempStartDate: Date
      let tempEndDate: Date

      if (i === 0 && includePassedInStartDate && getDay(startDate) === weekDay) {
        tempStartDate = startDate
        tempEndDate = endDate
      } else {
        if (i === 0) {
          tempStartDate = nextDay(startDate, weekDay as Day)
          tempEndDate = nextDay(endDate, weekDay as Day)
        } else {
          tempStartDate = addWeeks(result[i - 1].startDate, 1)
          tempEndDate = addWeeks(result[i - 1].endDate, 1)
        }
      }
      const { startDate: startTime, endDate: endTime } = this.checkDateInBlockTimeList(
        tempStartDate,
        tempEndDate,
        blockTimeList
      )

      result.push({
        startDate: startTime,
        endDate: endTime,
      })
    }
    const isoDate = result.map((item) => {
      return `${item.startDate.toISOString()} ${item.endDate.toISOString()}`
    })

    return isoDate
  }

  checkDateInBlockTimeList(startDate: Date, endDate: Date, blockTimeList?: string[]) {
    let tempEndDate = endDate,
      tempStartDate = startDate
    if (blockTimeList && blockTimeList.length > 0) {
      const maxRetry = 40
      let retry = 0
      while (checkDateInBlockTimeRange(tempStartDate, tempEndDate, blockTimeList)) {
        tempStartDate = addWeeks(tempStartDate, 1)
        tempEndDate = addWeeks(tempEndDate, 1)
        retry++
        if (retry >= maxRetry) {
          throw new BadRequestException('Cannot find a free date')
        }
      }
    }
    return {
      startDate: tempStartDate,
      endDate: tempEndDate,
    }
  }

  async findClassLessonFromEnrollment({
    recurringSchedules,
    classId,
    courseId,
  }: {
    recurringSchedules: LessonString[] | string[]
    classId: number
    courseId: number
  }) {
    const lessons: ClassLesson[] = []
    const promises = recurringSchedules.map(async (lessonDate) => {
      if (!lessonDate || lessonDate === '' || lessonDate === ' ') return

      const lessonString = new LessonString(lessonDate)
      const lessonData = {
        courseId,
        classId,
        date: lessonString.getStartDate(),
        startTime: lessonString.getStartDate(),
        endTime: lessonString.getEndDate(),
      }
      const classLesson = await this.classLessonRepository.findOneBy(lessonData)

      lessons.push(classLesson)
    })

    await Promise.all(promises)

    if (lessons && lessons.length > 0) {
      const classLessonIds = lessons.map((lesson) => lesson?.id)
      const foundLessons = await this.studentLessonRepository.findBy({
        classLessonId: In(classLessonIds),
      })

      if (foundLessons.length === recurringSchedules.length) {
        return foundLessons
      }
    }

    return null
  }

  async removeStudentLessonsByEnrolId(enrollCourseId: number, userId: number) {
    const toBeDeleted = await this.studentLessonRepository.findBy({
      enrollCourseId,
      userId,
    })
    await this.studentLessonRepository.softRemove(toBeDeleted)
  }

  async removeStudentLessonsByClassId(classId: number, userId: number) {
    const toBeDeleted = await this.studentLessonRepository.findBy({
      classId,
      userId,
    })
    await this.studentLessonRepository.softRemove(toBeDeleted)
  }
}
