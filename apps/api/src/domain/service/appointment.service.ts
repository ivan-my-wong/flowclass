import { BadRequestException, Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'
import { FindOptionsWhere } from 'typeorm'

import {
  CreateWithClassAppointmentDTO,
  UpdateAppointmentDTO,
} from '@/application/admin/courses/dto/appointment.dto'
import { ErrorCode } from '@/exceptions/error-message/errors'
import { Appointment } from '@/models/appointment.entity'
import { AppointmentRepository } from '@/models/appointment.entity'
import { AvailableSchedules, DateOverride } from '@/models/availability.entity'
import { ClassEntity } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import { SingleRecurringSchedule } from '@/models/course-recurring-schedules.entity'
import { LessonString } from '@/models/custom-types/lesson-string'
import { WeeklyHour } from '@/models/custom-types/time-format'
import { User } from '@/models/user.entity'
import { BaseService } from '@/modules/base/base.service'
import {
  dateOverrideToLessonString,
  dateOverrideToTimeRange,
  filterTimeslotStringsWithinPeriod,
  offsetToISO,
  sortASC,
} from '@/utils/time.utils'

import { AvailabilityService } from './availability.service'

@Injectable()
export class AppointmentService extends BaseService<Appointment> {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private classRepository: ClassRepository,
    private availabilityService: AvailabilityService
  ) {
    super(appointmentRepository)
  }

  async getById(appointmentId: number) {
    return await this.appointmentRepository.findOne({
      where: { id: appointmentId } as FindOptionsWhere<Appointment>,
      relations: ['class', 'availability', 'institution'],
    })
  }

  async getByClass(classId: number) {
    return await this.appointmentRepository.findOne({
      where: { classId } as FindOptionsWhere<Appointment>,
      relations: ['class', 'availability', 'institution'],
    })
  }

  async getByInstitution(institutionId: number) {
    return await this.appointmentRepository.find({
      where: { institutionId } as FindOptionsWhere<Appointment>,
      relations: ['class', 'availability', 'institution'],
    })
  }

  /**
   * Create an appointment template for a class
   * @param classEntity The class to create an appointment for
   * @param dto Appointment data
   * @param user Current user
   * @returns The created appointment
   */
  async createAppointmentTemplate(
    classEntity: ClassEntity,
    dto: CreateWithClassAppointmentDTO,
    user: User
  ) {
    // Check if class already has an appointment
    if (classEntity.appointmentId) {
      const existingAppointment = await this.getByClass(classEntity.id)
      if (existingAppointment) {
        return await this.update(existingAppointment.id, dto as UpdateAppointmentDTO, user)
      }
    }

    // Create a new appointment
    const newAppointment = this.appointmentRepository.create({
      institutionId: classEntity.institutionId,
      classId: classEntity.id,
      needConfirm: dto.needConfirm,
      bookingCondition: dto.bookingCondition,
      bufferBeforeMinutes: dto.bufferBeforeMinutes,
      bufferAfterMinutes: dto.bufferAfterMinutes,
      expireCondition: dto.expireCondition,
      createdBy: user.id,
      updatedBy: user.id,
    })

    const savedAppointment = await this.appointmentRepository.save(newAppointment)

    // Update the class with the appointment ID
    await this.classRepository.update(classEntity.id, { appointmentId: savedAppointment.id })

    return savedAppointment
  }

  /**
   * Update an existing appointment
   * @param id Appointment ID
   * @param dto Update data
   * @param user Current user
   * @returns Updated appointment
   */
  async update(id: number, dto: UpdateAppointmentDTO, user: User) {
    const appointment = await this.appointmentRepository.findOne({ where: { id } })
    if (!appointment) {
      throw new BadRequestException(`Appointment with ID ${id} not found`)
    }

    const updatedAppointment = {
      ...appointment,
      availabilityId: dto.availabilityId,
      durationMinutes: dto.durationMinutes,
      bufferBeforeMinutes: dto.bufferBeforeMinutes,
      bufferAfterMinutes: dto.bufferAfterMinutes,
      gapBetweenAppointmentsMinutes: dto.gapBetweenAppointmentsMinutes,
      minimumNoticeMinutes: dto.minimumNoticeMinutes,
      expireCondition: dto.expireCondition,
      needConfirm: dto.needConfirm,
      bookingCondition: dto.bookingCondition,
      updatedBy: user.id,
    }

    return await this.appointmentRepository.save(updatedAppointment)
  }

  /**
   * Delete an appointment
   * @param id Appointment ID
   * @returns The deleted appointment
   */
  async delete(id: number) {
    const found = await this.appointmentRepository.findOneBy({ id })
    if (!found) {
      throw new BadRequestException('Cannot find any appointment with id: ' + id)
    }

    // Remove the appointment ID from the class
    const classEntity = await this.classRepository.findOne({ where: { appointmentId: id } })
    if (classEntity) {
      await this.classRepository.update(classEntity.id, { appointmentId: null })
    }

    await this.appointmentRepository.delete(id)
    return found
  }

  /**
   * Assign an availability to an appointment
   * @param appointmentId Appointment ID
   * @param availabilityId Availability ID
   * @returns Updated appointment
   */
  async assignAvailability(appointmentId: number, availabilityId: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({ where: { id: appointmentId } })
    if (!appointment) {
      throw new BadRequestException(`Appointment with ID ${appointmentId} not found`)
    }

    const availability = await this.availabilityService.findOne(availabilityId)
    if (!availability) {
      throw new BadRequestException(`Availability with ID ${availabilityId} not found`)
    }

    appointment.availabilityId = availabilityId
    return await this.appointmentRepository.save(appointment)
  }

  /**
   * Remove an availability from an appointment
   * @param appointmentId Appointment ID
   * @returns Updated appointment
   */
  async removeAvailability(appointmentId: number): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({ where: { id: appointmentId } })
    if (!appointment) {
      throw new BadRequestException(`Appointment with ID ${appointmentId} not found`)
    }

    appointment.availabilityId = null
    return await this.appointmentRepository.save(appointment)
  }

  /**
   * Get available time slot for appointment booking page
   * @param appointment
   * @param timeZoneOffset in minute
   * @returns set of LessonString describe all available time slot in a certain period (in local timezone)
   */
  async getAppointmentSchedule(
    appointmentId: number,
    timeZoneOffset = 0,
    addTimezone = false
  ): Promise<string[]> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['availability'],
    })

    if (!appointment || !appointment.availability) {
      throw new BadRequestException(
        `Appointment with ID ${appointmentId} not found or has no availability assigned`
      )
    }

    const weeklyHours = appointment.availability.availableSchedules
    if (!weeklyHours || weeklyHours.length === 0) {
      return []
    }

    const bookingPeriod = appointment.getBookingPeriod()
    if (!bookingPeriod) {
      return []
    }

    const weeklyLessons = new Array<LessonString>()
    for (let i = 0, len = weeklyHours.length; i < len; i++) {
      const wHour = plainToInstance(WeeklyHour, weeklyHours[i])
      weeklyLessons.push(
        ...wHour.toLessonStrings(bookingPeriod.from, bookingPeriod.to, timeZoneOffset)
      )
    }

    const overrideLessons = new Array<LessonString>()
    const dayOffs = new Set<string>()
    const periodOffs = new Array<string>()

    const dateOverrides = appointment.availability.dateOverrides || []

    for (let i = 0, len = dateOverrides.length; i < len; i++) {
      const dateOvr = dateOverrides[i]
      if (dateOvr.isAvailable === false) {
        periodOffs.push(dateOverrideToTimeRange(dateOvr, timeZoneOffset))
      } else {
        const strData = dateOverrideToLessonString(dateOvr, timeZoneOffset)
        if (strData instanceof LessonString) {
          overrideLessons.push(strData)
          dayOffs.add(strData.getStartDateString())
        } else {
          dayOffs.add(strData)
        }
      }
    }

    // exclude lessons from off periods
    const filteredWithPeriod = weeklyLessons.filter((w) => {
      for (let i = 0; i < periodOffs.length; i++) {
        const periodOff = periodOffs[i]
        const parts = periodOff.split(' ')
        const periodStart = new Date(parts[0])
        const periodEnd = new Date(parts[1])
        const lessonDate = w.getStartDate()
        if (lessonDate >= periodStart && lessonDate <= periodEnd) {
          return false
        }
      }
      return true
    })

    // exclude off day from weeklyLessons
    const filteredWithDayOffs = filteredWithPeriod.filter((s) => {
      for (const item of dayOffs) {
        const isNotIncluded = !s.includes(item)
        if (isNotIncluded === false) {
          return isNotIncluded
        }
      }
      return true
    })

    const ap = appointment.class?.applicationPeriod
    const apStart = ap?.startDatetime ? new Date(ap.startDatetime) : null
    const apEnd = ap?.endDatetime ? new Date(ap.endDatetime) : null

    // existing: weeklyLessons → filteredWithPeriod → filteredWithDayOffs
    // Convert to strings for uniform filtering
    const weeklyStrings = filteredWithDayOffs.map((o) => o.toString())
    // filter weekly part by applicationPeriod
    const filteredWeeklyByAp =
      apStart || apEnd
        ? filterTimeslotStringsWithinPeriod(weeklyStrings, apStart, apEnd)
        : weeklyStrings

    // overrideLessons remain as hard-allow (bypass applicationPeriod)
    const overrideStrings = overrideLessons.map((o) => o.toString())

    // merge weekly hour lesson with date override lesson
    const allLessons = filteredWeeklyByAp.concat(overrideStrings)
    sortASC(allLessons)

    if (addTimezone) {
      const zoneSuffix = timeZoneOffset === 0 ? 'Z' : offsetToISO(timeZoneOffset)
      return allLessons.map((o) => o.replace(/Z/g, zoneSuffix))
    }

    return allLessons
  }

  /**
   * Create an availability for an appointment
   * @param appointmentId Appointment ID
   * @param availableSchedules Weekly schedules
   * @param dateOverrides Date overrides
   * @returns The created availability
   */
  async createAvailabilityForAppointment(
    appointmentId: number,
    availableSchedules: SingleRecurringSchedule[],
    dateOverrides: DateOverride[] = []
  ): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findOne({
      where: { id: appointmentId },
      relations: ['class'],
    })

    if (!appointment) {
      throw new BadRequestException(`Appointment with ID ${appointmentId} not found`)
    }

    // Create a new availability
    const availability = await this.availabilityService.create({
      siteId: appointment.class.siteId,
      institutionId: appointment.institutionId,
      name: 'Availability for appointment',
    })

    // Assign the availability to the appointment
    return await this.assignAvailability(appointmentId, availability.id)
  }

  async createWithClass(user: User, payload: CreateWithClassAppointmentDTO) {
    const { classId, ...dto } = payload
    const classEntity = await this.classRepository.findOneBy({ id: classId })
    if (!classEntity) {
      throw new BadRequestException(ErrorCode.CLASS_NOT_FOUND)
    }

    // Check if class already has an appointment
    if (classEntity.appointmentId) {
      const existingAppointment = await this.getByClass(classEntity.id)
      if (existingAppointment) {
        return await this.appointmentRepository.updateWith(existingAppointment, payload, user.id)
      }
    }

    // Create a new appointment
    const newAppointment = this.appointmentRepository.create({
      ...dto,
      institutionId: classEntity.institutionId,
      classId: classEntity.id,
      createdBy: user.id,
      updatedBy: user.id,
    })

    const savedAppointment = await this.appointmentRepository.save(newAppointment)

    // Update the class with the appointment ID
    await this.classRepository.update(classEntity.id, { appointmentId: savedAppointment.id })

    return savedAppointment
  }

  async getByClassId(classId: number) {
    return await this.appointmentRepository.findOne({
      where: { classId } as FindOptionsWhere<Appointment>,
      relations: ['class', 'availability', 'institution'],
    })
  }

  /**
   * Utility: Get available weekdays for an appointment, after deducting blocked dates from dateOverrides.
   * Returns an array of weekday numbers (0-6, where 0 is Sunday).
   */
  async getAvailableAppointmentWeekdaysByClassId(classId: number): Promise<number[]> {
    const appointment = await this.appointmentRepository.findOne({
      where: { classId },
      relations: ['availability'],
    })
    if (!appointment || !appointment.availability) return []
    const weeklyHours = appointment.availability.availableSchedules || []
    // Get all weekdays from availableSchedules
    const allWeekdays = weeklyHours.map((w) => w.dayOfWeek).filter((d) => typeof d === 'number')
    // Get blocked days from dateOverrides
    const dateOverrides = appointment.availability.dateOverrides || []
    const blockedDays = dateOverrides.filter((o) => o.isAvailable === false).map((o) => o.date)
    // Deduct blocked days
    const availableWeekdays = allWeekdays.filter((d) => !blockedDays.includes(d.toString()))
    // Remove duplicates
    return Array.from(new Set(availableWeekdays))
  }

  /**
   * Generate available timeslots for a given date and appointmentId, similar to flowclass-web's generateTimeslots.
   * Returns an array of { start: string, end: string } ISO strings.
   */
  generateAppointmentTimeslots(
    date: Date,
    appointment: Appointment,
    timeZoneId: string
  ): { start: string; end: string }[] {
    if (!date) return []
    if (!appointment || !appointment.availability) return []
    const {
      durationMinutes = 60,
      gapBetweenAppointmentsMinutes = 15,
      minimumNoticeMinutes = 0,
    } = appointment
    const { availableSchedules = [], dateOverrides = [] } = appointment.availability
    let safeGapBetweenAppointmentsMinutes = gapBetweenAppointmentsMinutes
    if (gapBetweenAppointmentsMinutes < 5) {
      safeGapBetweenAppointmentsMinutes = 15
    }
    const dayOfWeek = date.getDay()
    const now = utcToZonedTime(new Date(), timeZoneId)
    const noticeTime = new Date(now.getTime() + minimumNoticeMinutes * 60000)
    const totalSlotLength = durationMinutes
    if (totalSlotLength <= 0) return []
    const matchedSchedules = availableSchedules.filter(
      (s) => s.dayOfWeek === dayOfWeek && s.isEnabled
    )
    const formattedDate = (date) =>
      `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date
        .getDate()
        .toString()
        .padStart(2, '0')}`
    const dateStr = formattedDate(date)
    const dateOverride = dateOverrides.find(
      (o) => formattedDate(new Date(o.date)) === dateStr && o.isAvailable
    )
    const parseTimeToDate = (time: string, baseDate: Date, timeZoneId: string) => {
      const [h, m] = time.split(':').map(Number)
      const local = new Date(baseDate)
      local.setHours(h, m, 0, 0)
      return zonedTimeToUtc(local, timeZoneId)
    }
    const slots: { start: string; end: string }[] = []
    const generateSlotsForWindow = (windowStart: Date, windowEnd: Date) => {
      let current = new Date(windowStart)
      while (current.getTime() + durationMinutes * 60000 <= windowEnd.getTime()) {
        const slotStart = new Date(current)
        const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000)
        // Convert slotStart to the correct time zone for comparison
        const slotStartZoned = utcToZonedTime(slotStart, timeZoneId)
        if (slotStartZoned > noticeTime) {
          slots.push({
            start: slotStart.toISOString(),
            end: slotEnd.toISOString(),
          })
        }
        current = new Date(current.getTime() + safeGapBetweenAppointmentsMinutes * 60000)
      }
    }
    if (dateOverride) {
      if (!dateOverride.startTime || !dateOverride.endTime) {
        return []
      }
      const windowStart = parseTimeToDate(dateOverride.startTime, date, timeZoneId)
      const windowEnd = parseTimeToDate(dateOverride.endTime, date, timeZoneId)
      generateSlotsForWindow(windowStart, windowEnd)
    } else {
      for (const schedule of matchedSchedules) {
        const windowStart = parseTimeToDate(schedule.startTime, date, timeZoneId)
        const windowEnd = parseTimeToDate(schedule.endTime, date, timeZoneId)
        generateSlotsForWindow(windowStart, windowEnd)
      }
    }
    return slots
  }

  /**
   * Generate all available timeslots for a specific weekday and schedule,
   * within a range of weeks before and after today.
   * This function only generates timeslots for the given weekday (from the schedule),
   * not for all availability schedules.
   * @param appointment Appointment object (with availability and config)
   * @param schedule The availability schedule object (with dayOfWeek, startTime, endTime, etc.)
   * @param before Number of weeks before today to include
   * @param after Number of weeks after today to include
   * @param timeZoneId The IANA time zone id to use for all calculations
   * @returns Array of { start: string, end: string } timeslots for the given weekday
   */
  async generateTimeslotsForSchedule(
    appointment: Appointment,
    availabilitySchedule: AvailableSchedules,
    before: number,
    after: number,
    timeZoneId: string
  ): Promise<string[]> {
    if (before < 0 || after < 0) {
      throw new BadRequestException('before and after must be greater than 0')
    }
    const listOfTimeslots: string[] = []

    // Find the next date from today that matches the schedule's weekday
    const today = utcToZonedTime(new Date(), timeZoneId)
    const targetDay = availabilitySchedule.dayOfWeek
    const baseDate = new Date(today)
    const currentDay = today.getDay()
    // Move forward to the next occurrence of the target weekday
    const daysUntilTarget = (targetDay - currentDay + 7) % 7
    baseDate.setDate(today.getDate() + daysUntilTarget)
    // Now baseDate is the next occurrence of the target weekday (could be today)
    for (let week = -before; week <= after; week++) {
      const date = new Date(baseDate)
      date.setDate(baseDate.getDate() + week * 7)
      const timeslots = this.generateAppointmentTimeslots(date, appointment, timeZoneId)
      listOfTimeslots.push(...timeslots.map((t) => `${t.start} ${t.end}`))
    }
    return listOfTimeslots
  }
}
