import { Injectable, Logger, NotFoundException } from '@nestjs/common'
import * as dayjs from 'dayjs'
import { FindOptionsSelect } from 'typeorm'

type BlockTime = {
  startTime: string
  endTime: string
  wholeDay: boolean
}

type SinglePreviewLesson = {
  id: number
  date: string
  period: number
  lessonNumber: number
  startTime: string
  endTime: string
  isOverride: boolean
  isBlocked: boolean
  scheduleIndex: number
}

type LessonDate = {
  period: number
  startTime: string
  endTime: string
  scheduleIndex: number
  lessonNumber?: number
}

import {
  CreateClassRegularScheduleDto,
  CreateOrUpdateClassRegularPeriodDto,
  UpdateClassRegularScheduleDto,
} from '@/application/admin/class-regular-schedules/dto/class-regular-schedules.dto'
import { RegularSchedulePreviewResponseDto } from '@/application/student/course/dto/regular-schedules.dto'
import { classSelectRelations } from '@/common/constants/class.constants'
import { DateOverride } from '@/models/availability.entity'
import { ClassRegularPeriodsV2Repository } from '@/models/class-regular-periods.entity'
import {
  ClassRegularPeriodsSelectionMode,
  ClassRegularSchedulesV2,
  ClassRegularSchedulesV2Repository,
  defaultGapBetweenPeriod,
  defaultPeriodRepeatFormat,
} from '@/models/class-regular-schedules.entity'
import { ClassEntity, RepeatUnit } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import { ClassTypeEnum } from '@/models/enums'
import { RepeatFormatsRepository } from '@/models/repeat-formats.entity'

@Injectable()
export class ClassRegularSchedulesV2Service {
  private readonly logger = new Logger(ClassRegularSchedulesV2Service.name)
  constructor(
    private classRegularSchedulesV2Repository: ClassRegularSchedulesV2Repository,
    private classRegularPeriodsV2Repository: ClassRegularPeriodsV2Repository,
    private repeatFormatsRepository: RepeatFormatsRepository,
    private classRepository: ClassRepository
  ) {}
  get regularClassField(): FindOptionsSelect<ClassEntity> {
    return {
      id: true,
      name: true,
      type: true,
      instructor: {
        id: true,
        firstName: true,
        lastName: true,
      },
      locationRoom: {
        id: true,
        name: true,
        address: true,
      },
      course: {
        name: true,
        id: true,
      },
      institutionId: true,
      siteId: true,
      regularScheduleV2: {
        id: true,
        periodRepeatFormat: {
          every: true,
          unit: true,
          startTime: true,
        },
        gapBetweenPeriods: {
          every: true,
          unit: true,
          startTime: true,
        },
        periodRepeatCount: true,
        selectionMode: true,
        dateOverrides: true,
        periodsV2: {
          id: true,
          startTime: true,
          endTime: true,
          lessonRepeatFormatId: true,
        },
      },
    }
  }
  async findById(id: number): Promise<ClassRegularSchedulesV2> {
    const entity = await this.classRegularSchedulesV2Repository.findOne({
      where: { id },
      relations: {
        classEntity: true,
        periodsV2: {
          lessonRepeatFormat: true,
        },
      },
    })

    if (!entity) {
      throw new NotFoundException(`ClassRegularSchedule with ID ${id} not found`)
    }

    return entity
  }

  async findRegularClasses(institutionId: number): Promise<ClassEntity[]> {
    return this.classRepository.find({
      where: { institutionId, type: ClassTypeEnum.REGULAR_V2 },
      relations: {
        course: true,
        instructor: true,
        locationRoom: true,
        regularScheduleV2: {
          periodsV2: {
            lessonRepeatFormat: true,
          },
        },
      },
      // Select only necessary fields to reduce payload size
      // This is especially useful for large datasets
      select: classSelectRelations,
    })
  }

  async findByClassId(classId: number): Promise<ClassRegularSchedulesV2[]> {
    return await this.classRegularSchedulesV2Repository.findAll({
      where: { classId },
      relations: {
        classEntity: true,
        periodsV2: {
          lessonRepeatFormat: true,
        },
      },
    })
  }

  async create(createDto: CreateClassRegularScheduleDto): Promise<ClassRegularSchedulesV2> {
    const schedule = await this.classRegularSchedulesV2Repository.manager.transaction(
      async (manager) => {
        // Validate class exists
        const classEntity = await this.classRepository.findOne({
          where: { id: createDto.classId },
        })

        if (!classEntity) {
          throw new NotFoundException(`Class with ID ${createDto.classId} not found`)
        }

        // Create the main schedule entity
        const scheduleEntity = manager.create(ClassRegularSchedulesV2, {
          siteId: createDto.siteId,
          institutionId: createDto.institutionId,
          courseId: createDto.courseId,
          classId: createDto.classId,
          periodRepeatFormat: createDto.periodRepeatFormat ?? defaultPeriodRepeatFormat,
          gapBetweenPeriods: createDto.gapBetweenPeriods ?? defaultGapBetweenPeriod,
          periodRepeatCount: createDto.periodRepeatCount ?? -1,
          selectionMode:
            createDto.selectionMode ?? ClassRegularPeriodsSelectionMode.MUST_SELECT_ENTIRE_PERIOD,
        })

        return await manager.save(scheduleEntity)
      }
    )

    if (createDto.periodsV2) {
      // Strip IDs from periods and their repeat formats so the update method
      // creates new records instead of trying to update originals (important for duplication)
      const cleanedPeriods = createDto.periodsV2.map((period) => {
        const { id: _periodId, ...periodFields } = period as any
        if (periodFields.lessonRepeatFormat) {
          const { id: _repeatId, ...repeatFields } = periodFields.lessonRepeatFormat
          periodFields.lessonRepeatFormat = repeatFields
        }
        return periodFields
      })
      await this.update(schedule.id, {
        periodsV2: cleanedPeriods,
      })
    }

    return schedule
  }

  async update(
    id: number,
    updateDto: UpdateClassRegularScheduleDto
  ): Promise<ClassRegularSchedulesV2> {
    const entity = await this.findById(id)

    // Update main schedule fields
    if (
      updateDto.periodRepeatFormat !== undefined &&
      this.validateRegularClassRepeatPeriods(updateDto.periodRepeatFormat)
    ) {
      entity.periodRepeatFormat = {
        every: updateDto.periodRepeatFormat.every,
        unit: updateDto.periodRepeatFormat.unit,
        startTime: updateDto.periodRepeatFormat.startTime,
      }
    }

    if (
      updateDto.gapBetweenPeriods !== undefined &&
      this.validateRegularClassRepeatPeriods(updateDto.gapBetweenPeriods)
    ) {
      entity.gapBetweenPeriods = updateDto.gapBetweenPeriods
    }

    if (updateDto.periodRepeatCount !== undefined) {
      entity.periodRepeatCount = updateDto.periodRepeatCount
    }

    if (updateDto.selectionMode !== undefined) {
      entity.selectionMode = updateDto.selectionMode
    }

    if (updateDto.dateOverrides !== undefined) {
      entity.dateOverrides = updateDto.dateOverrides.map((override) => ({
        date: override.date,
        isAvailable: override.isAvailable,
        startTime: override.startTime,
        endTime: override.endTime,
      }))
    }

    await this.classRegularSchedulesV2Repository.save(entity)

    // Update periods if provided
    if (updateDto.periodsV2 !== undefined) {
      const existingPeriods = await this.classRegularPeriodsV2Repository.find({
        where: { regularScheduleId: id },
      })

      // Create a map of existing periods by ID for quick lookup
      const existingPeriodsMap = new Map(existingPeriods.map((period) => [period.id, period]))

      // Create a map of update DTOs by ID for quick lookup
      const updatePeriodMap = new Map(
        updateDto.periodsV2
          .filter((period) => period.id !== undefined)
          .map((period) => [period.id, period])
      )

      // 1. Handle deletions - remove periods that are not in the update DTO
      const periodsToDelete = existingPeriods.filter((period) => !updatePeriodMap.has(period.id))
      if (periodsToDelete.length > 0) {
        await this.classRegularPeriodsV2Repository.softDelete(
          periodsToDelete.map((period) => period.id)
        )
      }

      // 2. Handle updates and creations
      for (const periodDto of updateDto.periodsV2) {
        let lessonRepeatFormatId: number | undefined

        if (periodDto.lessonRepeatFormat) {
          if (!periodDto.lessonRepeatFormat.id) {
            // Create new repeat format
            const newRepeatFormat = this.repeatFormatsRepository.create({
              ...periodDto.lessonRepeatFormat,
              institutionId: entity.institutionId,
            })

            const savedRepeatFormat = await this.repeatFormatsRepository.save(newRepeatFormat)
            lessonRepeatFormatId = savedRepeatFormat.id
          } else {
            // Update existing repeat format
            const existingRepeatFormat = await this.repeatFormatsRepository.findOne({
              where: { id: periodDto.lessonRepeatFormat.id, institutionId: entity.institutionId },
            })

            if (existingRepeatFormat) {
              await this.repeatFormatsRepository.save({
                ...existingRepeatFormat,
                ...periodDto.lessonRepeatFormat,
              })
              lessonRepeatFormatId = existingRepeatFormat.id
            }
          }
        }

        if (periodDto.id) {
          // Update existing period
          const existingPeriod = existingPeriodsMap.get(periodDto.id)

          if (existingPeriod) {
            await this.classRegularPeriodsV2Repository.update(periodDto.id, {
              classId: entity.classId,
              lessonRepeatFormatId,
              startTime: periodDto.startTime,
              endTime: periodDto.endTime,
              regularScheduleId: id,
            })
          }
        } else {
          // Create new period
          const newPeriod = this.classRegularPeriodsV2Repository.create({
            classId: entity.classId,
            lessonRepeatFormatId,
            startTime: periodDto.startTime,
            endTime: periodDto.endTime,
            regularScheduleId: id,
          })
          await this.classRegularPeriodsV2Repository.save(newPeriod)
        }
      }
    }

    return await this.classRegularSchedulesV2Repository.findOne({
      where: { id },
      relations: {
        periodsV2: {
          lessonRepeatFormat: true,
        },
      },
    })
  }

  async remove(id: number): Promise<void> {
    const entity = await this.findById(id)

    // Remove associated periods first
    await this.classRegularPeriodsV2Repository.delete({ regularScheduleId: id })

    // Remove the main schedule
    await this.classRegularSchedulesV2Repository.remove(entity)
  }

  async updateDateOverrides(
    id: number,
    dateOverrides: DateOverride[]
  ): Promise<ClassRegularSchedulesV2> {
    const entity = await this.findById(id)
    entity.dateOverrides = dateOverrides
    await this.classRegularSchedulesV2Repository.save(entity)
    return await this.findById(id)
  }

  async addDateOverride(id: number, dateOverride: DateOverride): Promise<ClassRegularSchedulesV2> {
    const entity = await this.findById(id)

    if (!entity.dateOverrides) {
      entity.dateOverrides = []
    }

    // Remove existing override for the same date
    entity.dateOverrides = entity.dateOverrides.filter(
      (override) => override.date !== dateOverride.date
    )

    // Add new override
    entity.dateOverrides.push(dateOverride)

    await this.classRegularSchedulesV2Repository.save(entity)
    return await this.findById(id)
  }

  async removeDateOverride(id: number, date: string): Promise<ClassRegularSchedulesV2> {
    const entity = await this.findById(id)

    if (entity.dateOverrides) {
      entity.dateOverrides = entity.dateOverrides.filter((override) => override.date !== date)
    }

    await this.classRegularSchedulesV2Repository.save(entity)
    return await this.findById(id)
  }

  async addPeriod(
    scheduleId: number,
    periodDto: CreateOrUpdateClassRegularPeriodDto
  ): Promise<ClassRegularSchedulesV2> {
    // Validate schedule exists
    await this.findById(scheduleId)

    // Create the period
    const periodEntity = this.classRegularPeriodsV2Repository.create({
      classId: periodDto.classId,
      lessonRepeatFormatId: periodDto.lessonRepeatFormat?.id,
      startTime: periodDto.startTime,
      endTime: periodDto.endTime,
      regularScheduleId: scheduleId,
    })

    await this.classRegularPeriodsV2Repository.save(periodEntity)
    return await this.findById(scheduleId)
  }

  async removePeriod(scheduleId: number, periodId: number): Promise<ClassRegularSchedulesV2> {
    // Validate schedule exists
    await this.findById(scheduleId)

    // Remove the period
    await this.classRegularPeriodsV2Repository.delete({
      id: periodId,
      regularScheduleId: scheduleId,
    })

    return await this.findById(scheduleId)
  }

  async getDetailRegularClassV2(classId: number): Promise<ClassEntity | undefined> {
    return this.classRepository.findOne({
      where: { id: classId, type: ClassTypeEnum.REGULAR_V2 },
      relations: {
        course: true,
        instructor: true,
        locationRoom: true,
        regularScheduleV2: {
          periodsV2: {
            lessonRepeatFormat: true,
          },
        },
      },
      select: classSelectRelations,
    })
  }

  async previewRegularClassLessons(classId: number) {
    const classEntity = await this.getDetailRegularClassV2(classId)
    if (!classEntity || !classEntity.regularScheduleV2) {
      throw new NotFoundException(`Regular class with ID ${classId} not found`)
    }
    return await this.getRegularSchedulePreview(classEntity.regularScheduleV2.id)
  }

  private getDefaultPeriodCount(unit: string, every: number): number {
    const daysPerUnit: Record<string, number> = {
      [RepeatUnit.days]: 1,
      [RepeatUnit.weeks]: 7,
      [RepeatUnit.month]: 30,
    }
    const daysPerPeriod = (daysPerUnit[unit] ?? 7) * every
    return Math.ceil((24 * 30) / daysPerPeriod)
  }

  async getRegularSchedulePreview(
    scheduleId: number,
    startingScheduleIndex = 0,
    previewPeriodCount?: number
  ): Promise<RegularSchedulePreviewResponseDto> {
    const schedule = await this.findById(scheduleId)

    if (!schedule) {
      throw new NotFoundException(`ClassRegularSchedule with ID ${scheduleId} not found`)
    }

    const { periodRepeatFormat, gapBetweenPeriods, periodsV2, dateOverrides, periodRepeatCount } =
      schedule

    if (!periodRepeatFormat || !periodsV2 || periodsV2.length === 0) {
      return {
        scheduleId,
        scheduleStartTime: null,
        scheduleUnit: null,
        scheduleEvery: null,
        lessons: [],
        schedules: [],
        hasNextPeriod: false,
      }
    }

    const {
      startTime: scheduleStartTime,
      unit: scheduleUnit,
      every: scheduleEvery,
    } = periodRepeatFormat

    // Use periodRepeatCount if finite, otherwise generate enough periods to cover 24 months
    const resolvedPeriodCount =
      previewPeriodCount ??
      (periodRepeatCount && periodRepeatCount > 0
        ? periodRepeatCount
        : this.getDefaultPeriodCount(scheduleUnit, scheduleEvery))

    // Calculate period start dates
    const periodDates: { startDate: string; endDate: string }[] = []
    let currentPeriodStart = dayjs(scheduleStartTime)

    if (startingScheduleIndex > 0) {
      for (let i = 0; i < startingScheduleIndex; i++) {
        currentPeriodStart = currentPeriodStart.add(scheduleEvery, scheduleUnit)
        if (gapBetweenPeriods?.every > 0) {
          currentPeriodStart = currentPeriodStart.add(
            gapBetweenPeriods.every,
            gapBetweenPeriods.unit
          )
        }
      }
    }

    for (let i = 0; i < resolvedPeriodCount; i++) {
      periodDates.push({
        startDate: currentPeriodStart.clone().toISOString(),
        endDate: currentPeriodStart.clone().toISOString(),
      })

      // Move to next period
      switch (scheduleUnit) {
        case RepeatUnit.days:
          currentPeriodStart = currentPeriodStart.add(scheduleEvery, 'day')
          periodDates[i].endDate = currentPeriodStart.clone().toISOString()
          break
        case RepeatUnit.weeks:
          currentPeriodStart = currentPeriodStart.add(scheduleEvery, 'week')
          periodDates[i].endDate = currentPeriodStart.clone().toISOString()
          break
        case RepeatUnit.month:
          currentPeriodStart = currentPeriodStart.add(scheduleEvery, 'month')
          periodDates[i].endDate = currentPeriodStart.clone().toISOString()
          break
        default:
          currentPeriodStart = currentPeriodStart.add(scheduleEvery, 'week')
          periodDates[i].endDate = currentPeriodStart.clone().toISOString()
      }

      if (gapBetweenPeriods?.every > 0) {
        currentPeriodStart = currentPeriodStart.add(gapBetweenPeriods.every, gapBetweenPeriods.unit)
      }
    }

    const firstStageDates: {
      period: number
      startTime: string
      endTime: string
      scheduleIndex: number
      isOverride?: boolean
    }[] = []

    const earliestPeriodStartTime = dayjs(periodDates[0].startDate)
    const latestPeriodEndTime = dayjs(periodDates[periodDates.length - 1].endDate)

    // Calculate lessons for each period and each schedule
    periodsV2.forEach((period, scheduleIndex) => {
      const { startTime, endTime, lessonRepeatFormat } = period
      if (!startTime || !endTime || !lessonRepeatFormat || !periodRepeatFormat) return

      const { unit: lessonUnit, every: lessonEvery } = lessonRepeatFormat

      let currentLessonStartTime: dayjs.Dayjs
      let currentLessonEndTime: dayjs.Dayjs

      try {
        currentLessonStartTime = dayjs(startTime)
        currentLessonEndTime = dayjs(endTime)
        if (!currentLessonStartTime.isValid() || !currentLessonEndTime.isValid()) {
          this.logger.error(`Invalid date in period: ${period.id}`)
          return
        }
      } catch (error) {
        this.logger.error(`Error parsing dates for period: ${period.id}`, error)
        return
      }

      if (currentLessonStartTime.isBefore(periodDates[0].startDate)) {
        while (currentLessonStartTime.isBefore(periodDates[0].startDate)) {
          currentLessonStartTime = currentLessonStartTime.add(lessonEvery, lessonUnit)
          currentLessonEndTime = currentLessonEndTime.add(lessonEvery, lessonUnit)
        }
      }

      periodDates.forEach((periodDate, periodRepeatIndex) => {
        while (
          (currentLessonStartTime.isSame(periodDate.startDate) ||
            currentLessonStartTime.isAfter(periodDate.startDate)) &&
          currentLessonStartTime.isBefore(periodDate.endDate)
        ) {
          firstStageDates.push({
            period: periodRepeatIndex + startingScheduleIndex,
            startTime: currentLessonStartTime.toISOString(),
            endTime: currentLessonEndTime.toISOString(),
            scheduleIndex,
          })

          switch (lessonUnit) {
            case RepeatUnit.days:
              currentLessonStartTime = currentLessonStartTime.add(lessonEvery, 'day')
              currentLessonEndTime = currentLessonEndTime.add(lessonEvery, 'day')
              break
            case RepeatUnit.weeks:
              currentLessonStartTime = currentLessonStartTime.add(lessonEvery, 'week')
              currentLessonEndTime = currentLessonEndTime.add(lessonEvery, 'week')
              break
            case RepeatUnit.month:
              currentLessonStartTime = currentLessonStartTime.add(lessonEvery, 'month')
              currentLessonEndTime = currentLessonEndTime.add(lessonEvery, 'month')
              break
            default:
              currentLessonStartTime = currentLessonStartTime.add(1, 'week')
              currentLessonEndTime = currentLessonEndTime.add(1, 'week')
          }
        }

        if (gapBetweenPeriods?.every > 0) {
          currentLessonStartTime = currentLessonStartTime.add(
            gapBetweenPeriods.every,
            gapBetweenPeriods.unit
          )
          currentLessonEndTime = currentLessonEndTime.add(
            gapBetweenPeriods.every,
            gapBetweenPeriods.unit
          )
        }
      })
    })

    // Process date overrides - handle both available and unavailable dates
    const overrideList = dateOverrides?.filter(
      (o) =>
        (dayjs(o.date).isSame(earliestPeriodStartTime, 'day') ||
          dayjs(o.date).isAfter(earliestPeriodStartTime, 'day')) &&
        (dayjs(o.date).isSame(latestPeriodEndTime, 'day') ||
          dayjs(o.date).isBefore(latestPeriodEndTime, 'day'))
    )

    let secondStageDates = [...firstStageDates]

    if (overrideList) {
      overrideList.forEach((override) => {
        if (override && override.isAvailable && override.startTime && override.endTime) {
          const { overrideStartDateTime, overrideEndDateTime } = this.parseDateOverride(override)

          // Find which period the override is in
          const periodNumber = periodDates.findIndex((period) =>
            dayjs(override.date).isBetween(period.startDate, period.endDate, null, '[]')
          )

          // Find if there's any existing lesson at the same time
          const isSameDate = firstStageDates.some((date) =>
            dayjs(date.startTime).isSame(overrideStartDateTime, 'day')
          )

          // If there is, remove it from secondStageDates
          if (isSameDate) {
            secondStageDates = firstStageDates.map((date) => {
              if (dayjs(date.startTime).isSame(overrideStartDateTime, 'day')) {
                return {
                  ...date,
                  isOverride: true,
                }
              }
              return date
            })
          }

          if (periodNumber !== -1) {
            // Add the override lesson
            secondStageDates.push({
              period: periodNumber,
              startTime: overrideStartDateTime.toISOString(),
              endTime: overrideEndDateTime.toISOString(),
              scheduleIndex: -1, // Use -1 to indicate this is an override
            })
          }
        }
      })
    }

    // Sort everything by period, date, and time
    secondStageDates.sort((a, b) => {
      if (a.period !== b.period) {
        return a.period - b.period
      }
      // If in same period, sort by date
      const dateA = dayjs(a.startTime).format('YYYY-MM-DD')
      const dateB = dayjs(b.startTime).format('YYYY-MM-DD')
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB)
      }
      // If same date, sort by time
      return dayjs(a.startTime).diff(dayjs(b.startTime))
    })

    // Check if there are more periods available beyond the current preview
    const hasNextPeriod =
      periodRepeatCount && periodRepeatCount > 0
        ? startingScheduleIndex + resolvedPeriodCount < periodRepeatCount
        : true

    // Group by period and assign lesson numbers
    const periodGroups = secondStageDates.reduce((groups, date) => {
      if (!groups[date.period]) {
        groups[date.period] = []
      }
      groups[date.period].push(date)
      return groups
    }, {} as Record<number, typeof firstStageDates>)

    const thirdStageDates = Object.entries(periodGroups).flatMap(([, dates]) => {
      return dates.map((date, index) => ({
        ...date,
        lessonNumber: index + 1,
      }))
    })

    const lessons = thirdStageDates.map((dateItem, index) => {
      const { startTime, endTime } = dateItem
      let isBlocked = false
      let isOverride = false

      // Check if the date collides with any date override
      const hasOverrideBlockList = dateOverrides?.some((override) => {
        const lessonDate = dayjs(startTime).format('YYYY-MM-DD')
        return dayjs(override.date).format('YYYY-MM-DD') === lessonDate && !override.isAvailable
      })

      if (hasOverrideBlockList) {
        isBlocked = true
      }

      if (dateItem.isOverride) {
        isOverride = true
      }

      return {
        id: index + 1,
        date: dayjs(startTime).format('YYYY-MM-DD'),
        period: dateItem.period + 1,
        lessonNumber: dateItem.lessonNumber,
        startTime,
        endTime,
        isOverride,
        isBlocked,
      }
    })

    return {
      scheduleId,
      scheduleStartTime: dayjs(scheduleStartTime).toISOString(),
      scheduleUnit,
      scheduleEvery,
      schedules: periodDates,
      lessons,
      hasNextPeriod,
    }
  }

  private validateRegularClassRepeatPeriods(obj: unknown): boolean {
    // Type guard to check if obj has the required properties
    const isRepeatFormat = (o: unknown): o is { every: number; unit: string } => {
      const objWithProps = o as { every?: number; unit?: string }
      return (
        typeof objWithProps.every === 'number' &&
        objWithProps.every > 0 &&
        typeof objWithProps.unit === 'string' &&
        Object.values(RepeatUnit).includes(objWithProps.unit as RepeatUnit)
      )
    }
    // First, test if it is a valid object

    if (typeof obj !== 'object' || obj === null) {
      return false
    }

    return isRepeatFormat(obj)
  }

  // Utility function to generate next hour time
  generateNextHour(): string {
    const now = new Date()
    const hours = now.getHours()
    const nextHour = new Date()
    nextHour.setHours(hours + 1, 0, 0, 0)
    return nextHour.toISOString()
  }

  private parseDateOverride(override: DateOverride) {
    let overrideStartDateTime
    let overrideEndDateTime

    // Check if startTime is a valid ISO string
    if (!dayjs(override.startTime).isValid() || !dayjs(override.endTime).isValid()) {
      overrideStartDateTime = dayjs(`${override.date} ${override.startTime}`)
      overrideEndDateTime = dayjs(`${override.date} ${override.endTime}`)
    } else {
      overrideStartDateTime = dayjs(override.startTime).set('date', dayjs(override.date).date())
      overrideEndDateTime = dayjs(override.endTime).set('date', dayjs(override.date).date())
    }

    return {
      overrideStartDateTime,
      overrideEndDateTime,
    }
  }
}
