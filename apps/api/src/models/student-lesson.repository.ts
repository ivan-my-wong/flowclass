import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  FindManyOptions,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
  Repository,
} from 'typeorm'

import { FEATURE_FLAG } from '@/common/constants'
import { StudentLesson } from '@/models/student-lesson.entity'
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { AttendanceStatus, PaymentStatus } from './enums/status'

@Injectable()
export class StudentLessonRepository extends BaseAbstractRepository<StudentLesson> {
  private _repository: Repository<StudentLesson>

  constructor(
    @InjectRepository(StudentLesson)
    repository: Repository<StudentLesson>
  ) {
    super(repository)
    this._repository = repository
  }

  /**
   * Counts the number of student lessons for a class within a specific date range
   * where the invoice is paid and the attendance status is either PENDING or ATTENDED.
   *
   * @param classId - The ID of the class to count lessons for
   * @param startDate - The start date of the range to count lessons in
   * @param endDate - The end date of the range to count lessons in
   * @returns The count of student lessons meeting the criteria
   */
  async getStudentLessonsCountOfLessonDeprecated(classId: number, startDate: Date, endDate: Date) {
    const invoiceCond = FEATURE_FLAG.CLASS_QUOTA_COUNT_ALL_INVOICE_STATUSES
      ? { paymentState: Not(In([PaymentStatus.REJECTED, PaymentStatus.REFUNDED])) }
      : { paymentState: PaymentStatus.PAID }

    const attendanceSet = In([
      AttendanceStatus.PENDING,
      AttendanceStatus.ATTENDED,
      AttendanceStatus.NOT_ATTENDED,
    ])

    // 1) Rescheduled lessons: use changeStart/EndTime
    const countChanged = await this.count({
      where: {
        classId,
        attendance: attendanceSet,
        studentSchedule: { invoice: invoiceCond },
        changeStartTime: MoreThanOrEqual(startDate),
        changeEndTime: LessThanOrEqual(endDate),
      },
    })

    // 2) Not rescheduled: change* IS NULL, use original start/end
    const countOriginal = await this.count({
      where: {
        classId,
        attendance: attendanceSet,
        studentSchedule: { invoice: invoiceCond },
        changeStartTime: IsNull(),
        startTime: MoreThanOrEqual(startDate),
        endTime: LessThanOrEqual(endDate),
      },
    })

    return countChanged + countOriginal
  }

  /**
   * Counts distinct users for a class lesson slot (handles rescheduled + original).
   * Uses a single query with UNION + COUNT instead of two find() calls.
   */
  async getStudentLessonsCountOfLesson(
    classId: number,
    startDate: Date,
    endDate: Date
  ): Promise<number> {
    const attendanceList = [
      AttendanceStatus.PENDING,
      AttendanceStatus.ATTENDED,
      AttendanceStatus.NOT_ATTENDED,
    ]

    const qbChanged = this._repository
      .createQueryBuilder('sl')
      .select('sl.user_id', 'user_id')
      .innerJoin('sl.studentSchedule', 'ss')
      .innerJoin('ss.invoice', 'i')
      .where('sl.class_id = :classId', { classId })
      .andWhere('sl.attendance IN (:...attendance)', { attendance: attendanceList })
      .andWhere('sl.change_start_time >= :startDate', { startDate })
      .andWhere('sl.change_end_time <= :endDate', { endDate })

    const qbOriginal = this._repository
      .createQueryBuilder('sl')
      .select('sl.user_id', 'user_id')
      .innerJoin('sl.studentSchedule', 'ss')
      .innerJoin('ss.invoice', 'i')
      .where('sl.class_id = :classId', { classId })
      .andWhere('sl.attendance IN (:...attendance)', { attendance: attendanceList })
      .andWhere('sl.change_start_time IS NULL')
      .andWhere('sl.start_time >= :startDate', { startDate })
      .andWhere('sl.end_time <= :endDate', { endDate })

    if (FEATURE_FLAG.CLASS_QUOTA_COUNT_ALL_INVOICE_STATUSES) {
      qbChanged.andWhere('i.payment_state NOT IN (:...rejected)', {
        rejected: [PaymentStatus.REJECTED, PaymentStatus.REFUNDED],
      })
      qbOriginal.andWhere('i.payment_state NOT IN (:...rejected)', {
        rejected: [PaymentStatus.REJECTED, PaymentStatus.REFUNDED],
      })
    } else {
      qbChanged.andWhere('i.payment_state = :paid', { paid: PaymentStatus.PAID })
      qbOriginal.andWhere('i.payment_state = :paid', { paid: PaymentStatus.PAID })
    }

    const [changedRows, originalRows] = await Promise.all([
      qbChanged.getRawMany<{ user_id: number }>(),
      qbOriginal.getRawMany<{ user_id: number }>(),
    ])
    const allUserIds = [
      ...changedRows.map((r) => r.user_id),
      ...originalRows.map((r) => r.user_id),
    ].filter((id) => id != null)
    const uniqueUserIds = [...new Set(allUserIds)]
    return uniqueUserIds.length
  }

  /**
   * Batch version: counts distinct users per lesson slot in one call.
   * All slots must be for the same classId.
   * @param classId - same for all slots
   * @param slots - array of { startTime, endTime } (class_lesson times)
   * @returns array of counts, one per slot (same order as slots)
   */
  async getStudentLessonsCountOfLessonBatch(
    classId: number,
    slots: Array<{ startTime: Date; endTime: Date }>
  ): Promise<number[]> {
    if (!slots.length) return []

    const attendanceList = [
      AttendanceStatus.PENDING,
      AttendanceStatus.ATTENDED,
      AttendanceStatus.NOT_ATTENDED,
    ]

    const orParts: string[] = []
    const params: Record<string, unknown> = {
      classId,
      attendance: attendanceList,
    }
    slots.forEach((slot, i) => {
      orParts.push(
        `(sl.change_start_time >= :s${i} AND sl.change_end_time <= :e${i})`,
        `(sl.change_start_time IS NULL AND sl.start_time >= :s${i} AND sl.end_time <= :e${i})`
      )
      params[`s${i}`] = slot.startTime
      params[`e${i}`] = slot.endTime
    })
    if (FEATURE_FLAG.CLASS_QUOTA_COUNT_ALL_INVOICE_STATUSES) {
      params.rejected = [PaymentStatus.REJECTED, PaymentStatus.REFUNDED]
    } else {
      params.paid = PaymentStatus.PAID
    }
    const orClause = orParts.join(' OR ')

    const qb = this._repository
      .createQueryBuilder('sl')
      .select('sl.user_id', 'user_id')
      .addSelect('sl.change_start_time', 'change_start_time')
      .addSelect('sl.change_end_time', 'change_end_time')
      .addSelect('sl.start_time', 'start_time')
      .addSelect('sl.end_time', 'end_time')
      .innerJoin('sl.studentSchedule', 'ss')
      .innerJoin('ss.invoice', 'i')
      .where('sl.class_id = :classId')
      .andWhere(`(${orClause})`)
      .andWhere('sl.attendance IN (:...attendance)')

    if (FEATURE_FLAG.CLASS_QUOTA_COUNT_ALL_INVOICE_STATUSES) {
      qb.andWhere('i.payment_state NOT IN (:...rejected)')
    } else {
      qb.andWhere('i.payment_state = :paid')
    }

    const rows = await qb.setParameters(params).getRawMany<{
      user_id: number
      change_start_time: Date | null
      change_end_time: Date | null
      start_time: Date
      end_time: Date
    }>()

    const slotUserSets = slots.map(() => new Set<number>())
    for (const row of rows) {
      const userId = row.user_id
      if (userId == null) continue
      for (let i = 0; i < slots.length; i++) {
        const { startTime, endTime } = slots[i]
        const isChangedMatch =
          row.change_start_time != null &&
          row.change_start_time >= startTime &&
          row.change_end_time != null &&
          row.change_end_time <= endTime
        const isOriginalMatch =
          row.change_start_time == null && row.start_time >= startTime && row.end_time <= endTime
        if (isChangedMatch || isOriginalMatch) {
          slotUserSets[i].add(userId)
          break
        }
      }
    }
    return slotUserSets.map((set) => set.size)
  }

  async findByEffectiveClassLessonId(
    classLessonIds: Array<number>,
    options?: FindManyOptions<StudentLesson>
  ) {
    let where: any[] = [
      { classLessonId: In(classLessonIds) },
      { changeClassLessonId: In(classLessonIds) },
    ]

    if (options?.where) {
      if (Array.isArray(options.where)) {
        where = options.where.flatMap((cond) => [
          { ...cond, classLessonId: In(classLessonIds) },
          { ...cond, changeClassLessonId: In(classLessonIds) },
        ])
      } else {
        where = [
          { ...options.where, classLessonId: In(classLessonIds) },
          { ...options.where, changeClassLessonId: In(classLessonIds) },
        ]
      }
    }

    // Spread the rest of the options, but override where
    return this.find({
      ...options,
      where,
    })
  }

  async findByEffectiveStartTimeAndEndTime(
    startTime: string,
    endTime: string,
    options?: FindManyOptions<StudentLesson>
  ) {
    let where: any[] = [
      {
        startTime: MoreThanOrEqual(startTime),
        endTime: LessThanOrEqual(endTime),
      },
      {
        changeStartTime: MoreThanOrEqual(startTime),
        changeEndTime: LessThanOrEqual(endTime),
      },
    ]

    if (options?.where) {
      if (Array.isArray(options.where)) {
        where = options.where.flatMap((cond) => [
          { ...cond, startTime: MoreThanOrEqual(startTime), endTime: LessThanOrEqual(endTime) },
          {
            ...cond,
            changeStartTime: MoreThanOrEqual(startTime),
            changeEndTime: LessThanOrEqual(endTime),
          },
        ])
      } else {
        where = [
          {
            ...options.where,
            startTime: MoreThanOrEqual(startTime),
            endTime: LessThanOrEqual(endTime),
          },
          {
            ...options.where,
            changeStartTime: MoreThanOrEqual(startTime),
            changeEndTime: LessThanOrEqual(endTime),
          },
        ]
      }
    }

    // Spread the rest of the options, but override where
    return this.find({
      ...options,
      where,
    })
  }

  async deleteByEffectiveClassLessonId(classLessonId: number) {
    const deleteResult = await this.delete({ classLessonId })

    if (deleteResult.affected === 0) {
      await this.delete({ changeClassLessonId: classLessonId })
    }

    return deleteResult.affected > 0
  }

  getEffectiveClassLessonId(studentLesson: StudentLesson): number {
    return studentLesson.changeClassLessonId ?? studentLesson.classLessonId
  }
}
