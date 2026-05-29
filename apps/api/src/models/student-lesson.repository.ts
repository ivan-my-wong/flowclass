import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import {
  FindManyOptions,
  In,
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

    return this.count({
      where: {
        classId,
        attendance: In([AttendanceStatus.PENDING, AttendanceStatus.ATTENDED, AttendanceStatus.NOT_ATTENDED]),
        studentSchedule: { invoice: invoiceCond },
        startTime: MoreThanOrEqual(startDate),
        endTime: LessThanOrEqual(endDate),
      },
    })
  }

  /**
   * Counts distinct users for a class lesson slot.
   * After the semantic flip, startTime/endTime always hold the current (effective) slot times.
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

    const qb = this._repository
      .createQueryBuilder('sl')
      .select('sl.user_id', 'user_id')
      .innerJoin('sl.studentSchedule', 'ss')
      .innerJoin('ss.invoice', 'i')
      .where('sl.class_id = :classId', { classId })
      .andWhere('sl.attendance IN (:...attendance)', { attendance: attendanceList })
      .andWhere('sl.start_time >= :startDate', { startDate })
      .andWhere('sl.end_time <= :endDate', { endDate })

    if (FEATURE_FLAG.CLASS_QUOTA_COUNT_ALL_INVOICE_STATUSES) {
      qb.andWhere('i.payment_state NOT IN (:...rejected)', {
        rejected: [PaymentStatus.REJECTED, PaymentStatus.REFUNDED],
      })
    } else {
      qb.andWhere('i.payment_state = :paid', { paid: PaymentStatus.PAID })
    }

    const rows = await qb.getRawMany<{ user_id: number }>()
    const uniqueUserIds = [...new Set(rows.map((r) => r.user_id).filter((id) => id != null))]
    return uniqueUserIds.length
  }

  /**
   * Batch version: counts distinct users per lesson slot in one call.
   * All slots must be for the same classId.
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
      orParts.push(`(sl.start_time >= :s${i} AND sl.end_time <= :e${i})`)
      params[`s${i}`] = slot.startTime
      params[`e${i}`] = slot.endTime
    })
    if (FEATURE_FLAG.CLASS_QUOTA_COUNT_ALL_INVOICE_STATUSES) {
      params.rejected = [PaymentStatus.REJECTED, PaymentStatus.REFUNDED]
    } else {
      params.paid = PaymentStatus.PAID
    }

    const qb = this._repository
      .createQueryBuilder('sl')
      .select('sl.user_id', 'user_id')
      .addSelect('sl.start_time', 'start_time')
      .addSelect('sl.end_time', 'end_time')
      .innerJoin('sl.studentSchedule', 'ss')
      .innerJoin('ss.invoice', 'i')
      .where('sl.class_id = :classId')
      .andWhere(`(${orParts.join(' OR ')})`)
      .andWhere('sl.attendance IN (:...attendance)')

    if (FEATURE_FLAG.CLASS_QUOTA_COUNT_ALL_INVOICE_STATUSES) {
      qb.andWhere('i.payment_state NOT IN (:...rejected)')
    } else {
      qb.andWhere('i.payment_state = :paid')
    }

    const rows = await qb.setParameters(params).getRawMany<{
      user_id: number
      start_time: Date
      end_time: Date
    }>()

    const slotUserSets = slots.map(() => new Set<number>())
    for (const row of rows) {
      const userId = row.user_id
      if (userId == null) continue
      for (let i = 0; i < slots.length; i++) {
        const { startTime, endTime } = slots[i]
        if (row.start_time >= startTime && row.end_time <= endTime) {
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
    let where: any = { classLessonId: In(classLessonIds) }

    if (options?.where) {
      if (Array.isArray(options.where)) {
        where = options.where.map((cond) => ({ ...cond, classLessonId: In(classLessonIds) }))
      } else {
        where = { ...options.where, classLessonId: In(classLessonIds) }
      }
    }

    return this.find({ ...options, where })
  }

  async findByEffectiveStartTimeAndEndTime(
    startTime: string,
    endTime: string,
    options?: FindManyOptions<StudentLesson>
  ) {
    const timeCond = {
      startTime: MoreThanOrEqual(startTime),
      endTime: LessThanOrEqual(endTime),
    }

    let where: any = timeCond

    if (options?.where) {
      if (Array.isArray(options.where)) {
        where = options.where.map((cond) => ({ ...cond, ...timeCond }))
      } else {
        where = { ...options.where, ...timeCond }
      }
    }

    return this.find({ ...options, where })
  }

  async deleteByEffectiveClassLessonId(classLessonId: number) {
    const deleteResult = await this.delete({ classLessonId })
    return (deleteResult.affected ?? 0) > 0
  }

  getEffectiveClassLessonId(studentLesson: StudentLesson): number {
    return studentLesson.classLessonId
  }

  filterActiveLessons(lessons: StudentLesson[]): StudentLesson[] {
    return lessons
  }
}
