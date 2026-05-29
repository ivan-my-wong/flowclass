import { Injectable, NotFoundException } from '@nestjs/common'
import * as dayjs from 'dayjs'
import { Brackets, In } from 'typeorm'

import {
  ChangeRescheduleApprovalStatusDto,
  RescheduleApprovalOptionDto,
} from '@/application/admin/reschedule-approval/dtos/reschedule-approval.dto'
import { RescheduleSettingsDto } from '@/application/admin/reschedule-approval/dtos/reschedule-settings.dto'
import { ClassLessonRepository } from '@/models/class-lesson.repository'
import { ClassLesson } from '@/models/class-lessons.entity'
import { ClassEntity } from '@/models/classes.entity'
import { AvailabilityStatus, RequestTimeChangeStatus } from '@/models/enums/status'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { NotificationType } from '@/models/notification-record.entity'
import { RequestTimeChange } from '@/models/request-time-change.entity'
import { RequestTimeChangeRepository } from '@/models/request-time-change.repository'
import { RescheduleSettingsRepository } from '@/models/reschedule-settings.repository'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { lessonDateToString } from '@/utils/string.utils'

import { EmailService } from '../external/email.service'

import { CoursesService } from './courses.service'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(customParseFormat)

@Injectable()
export class RescheduleApprovalService {
  constructor(
    private readonly requestTimeChangeRepository: RequestTimeChangeRepository,
    private readonly classLessonRepository: ClassLessonRepository,
    private readonly studentLessonRepository: StudentLessonRepository,
    private readonly coursesService: CoursesService,
    private readonly emailService: EmailService,
    private readonly institutionsRepository: InstitutionsRepository,
    private readonly rescheduleSettingsRepository: RescheduleSettingsRepository
  ) {}

  async getAll({ institutionId }: RescheduleApprovalOptionDto) {
    const requestTimeChanges = await this.requestTimeChangeRepository.find({
      where: { institutionId },
      relations: {
        user: true,
        studentLesson: {
          classLesson: true,
          course: true,
          class: true,
        },
      },
      order: { id: 'DESC' },
    })

    // This runs once every request, so it still generates a lot of database calls
    // Any way to get all relevant class lesson first? Then process in one go.
    const result = await Promise.all(
      requestTimeChanges.map(async (request) => {
        // return await this.validateRescheduleApproval(request)
        // It's loading too long, I'm disabling the conflict
        return {
          ...request,
          availabilityStatus: AvailabilityStatus.AVAILABLE,
          conflict: { classroom: [], teacher: [] },
        }
      })
    )

    return result
  }

  async validateRescheduleApproval(request: RequestTimeChange) {
    const isSameMinute = (time: Date, start: Date, end: Date) => {
      return dayjs(time).isBetween(start, end, 'minute', '[]')
    }

    const conflict = { classroom: [] as ClassEntity[], teacher: [] as ClassEntity[] }

    const { requestStartTime, requestEndTime, studentLesson } = request
    const { class: classes } = studentLesson ?? {}
    const start = dayjs(requestStartTime).startOf('day').toDate()
    const end = dayjs(requestEndTime).endOf('day').toDate()
    let availabilityStatus = AvailabilityStatus.AVAILABLE

    const classLesson = await this.classLessonRepository
      .createQueryBuilder('classLesson')
      .leftJoinAndSelect('classLesson.class', 'class')
      .where('classLesson.institutionId = :institutionId', { institutionId: request.institutionId })
      .andWhere(
        new Brackets((qb1) => {
          qb1
            .where(
              new Brackets((qb2) => {
                qb2
                  .where('classLesson.startTime >= :start', { start })
                  .andWhere('classLesson.endTime >= :start', { start })
              })
            )
            .orWhere(
              new Brackets((qb2) => {
                qb2
                  .where('classLesson.startTime >= :end', { end })
                  .andWhere('classLesson.endTime >= :end', { end })
              })
            )
        })
      )
      .getMany()

    if (classLesson.length) {
      const sameData: {
        lesson: ClassLesson
        isSameStart: boolean
        isSameEnd: boolean
        isSameClassroom: boolean
        isSameTeacher: boolean
      }[] = []

      classLesson.forEach((lesson) => {
        const { startTime, endTime, class: thisClass } = lesson

        if (!thisClass) {
          return
        }

        const { locationId, instructorId } = thisClass
        const isSameStart = isSameMinute(startTime, requestStartTime, requestEndTime)
        const isSameEnd = isSameMinute(endTime, requestStartTime, requestEndTime)
        const isSame = (isSameStart || isSameEnd) && (!!locationId || !!instructorId)

        if (isSame) {
          sameData.push({
            lesson,
            isSameStart,
            isSameEnd,
            isSameClassroom: locationId && locationId === classes?.locationId,
            isSameTeacher: instructorId && instructorId === classes?.instructorId,
          })
        }
      })

      if (!classes) {
        availabilityStatus = AvailabilityStatus.AVAILABLE
      } else {
        const appliedStudentCount = await this.coursesService.countAppliedStudentCount(
          classes.id,
          classes.type,
          classes.quota
        )
        if (appliedStudentCount.length > 0) {
          const hasRemainingQuota = appliedStudentCount.every((item) => {
            return item.remainingQuota > 0
          })
          if (!hasRemainingQuota) {
            availabilityStatus = AvailabilityStatus.FULLY_BOOKED
          }
        } else if (sameData.length) {
          availabilityStatus = AvailabilityStatus.CONFLICT
          conflict.classroom = sameData
            .filter((item) => item.isSameClassroom)
            .map((item) => item.lesson.class)

          conflict.teacher = sameData
            .filter((item) => item.isSameTeacher)
            .map((item) => item.lesson.class)
        }
      }
    }

    return { ...request, availabilityStatus, conflict }
  }

  async changeStatus({
    ids,
    status,
    institutionId,
  }: ChangeRescheduleApprovalStatusDto): Promise<RequestTimeChange[]> {
    const requestTimeChanges = await this.requestTimeChangeRepository.find({
      where: { id: In(ids) },
      relations: {
        studentLesson: {
          course: true,
          classLesson: true,
        },
        user: true,
      },
    })

    const institution = await this.institutionsRepository.findOne({
      where: { id: institutionId },
      relations: {
        site: true,
      },
    })

    const timeZone = institution?.site?.timeZone

    if (!requestTimeChanges.length) {
      throw new NotFoundException(`Request time change is not found`)
    }

    for (const requestTimeChange of requestTimeChanges) {
      requestTimeChange.status = status

      if (!requestTimeChange?.studentLesson) continue

      const { classLesson, course } = requestTimeChange?.studentLesson ?? {}

      const { firstName, email } = requestTimeChange.user
      const emailSubject = 'The status of your lesson change request has been updated'

      const msg = await this.emailService.requestTimeChangeEmail({
        emailSubject,
        status,
        studentEmail: email,
        studentName: firstName,
        institutionId,
        institutionName: institution.name,
        originalClassDateTime: lessonDateToString(
          `${classLesson.startTime.toISOString()} ${classLesson.endTime.toISOString()}`,
          timeZone?.id ?? 'UTC'
        ),
        newClassDateTime: lessonDateToString(
          `${requestTimeChange.requestStartTime.toISOString()} ${requestTimeChange.requestEndTime.toISOString()}`,
          timeZone?.id ?? 'UTC'
        ),
        courseName: course.name,
        adminEmail: institution.email,
      })

      await this.emailService.saveEmailResponse(
        msg,
        requestTimeChange.userId,
        email,
        emailSubject,
        NotificationType[`REQUEST_TIME_CHANGE_${status}`],
        institutionId,
        course.siteId
      )

      if (status === RequestTimeChangeStatus.APPROVED) {
        const startDate = requestTimeChange.requestStartTime.toISOString().split('T')[0]
        const startTime = classLesson.startTime.toISOString().split('T')[1]
        classLesson.changeStartTime = new Date(`${startDate}T${startTime}`)

        const endDate = requestTimeChange.requestEndTime.toISOString().split('T')[0]
        const endTime = classLesson.endTime.toISOString().split('T')[1]
        classLesson.changeEndTime = new Date(`${endDate}T${endTime}`)

        // StudentLesson: preserve original reference on first approval, then update current times
        const sl = requestTimeChange.studentLesson
        if (!sl.changeStartTime) {
          sl.changeClassLessonId = sl.classLessonId
          sl.changeStartTime = sl.startTime
          sl.changeEndTime = sl.endTime
        }
        sl.startTime = classLesson.changeStartTime
        sl.endTime = classLesson.changeEndTime
      } else if (status === RequestTimeChangeStatus.PENDING) {
        classLesson.changeStartTime = null
        classLesson.changeEndTime = null

        // Revert student lesson to its original times
        const sl = requestTimeChange.studentLesson
        if (sl.changeStartTime) {
          sl.startTime = sl.changeStartTime
          sl.endTime = sl.changeEndTime
          sl.classLessonId = sl.changeClassLessonId
          sl.changeClassLessonId = null
          sl.changeStartTime = null
          sl.changeEndTime = null
        }
      }

      await this.classLessonRepository.save(classLesson)
      await this.studentLessonRepository.save(requestTimeChange.studentLesson)
      await this.requestTimeChangeRepository.save(requestTimeChange)
    }
    return this.requestTimeChangeRepository.find({ where: { id: In(ids) } })
  }

  async getById(id: number) {
    const detail = await this.requestTimeChangeRepository.findOne({
      where: { id },
      relations: {
        user: true,
        studentLesson: {
          classLesson: true,
          course: true,
          class: true,
        },
      },
    })
    if (!detail) {
      throw new NotFoundException(`Request time change is not found`)
    }
    return await this.validateRescheduleApproval(detail)
  }

  async getSettings(institutionId: number) {
    const existing = await this.rescheduleSettingsRepository.findOne({ where: { institutionId } })
    if (existing) return existing
    return this.rescheduleSettingsRepository.save({
      institutionId,
      selectClass: true,
      selectCourse: true,
      minimumHoursBeforeRequest: 0,
    })
  }

  async updateSettings(institutionId: number, payload: RescheduleSettingsDto) {
    let settings = await this.rescheduleSettingsRepository.findOne({
      where: { institutionId },
    })

    if (!settings) {
      settings = this.rescheduleSettingsRepository.create({ institutionId, ...payload })
    }

    return this.rescheduleSettingsRepository.save({ ...settings, ...payload })
  }
}
