import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { SelectQueryBuilder } from 'typeorm'

import { ClassLessonRepository } from '@/models/class-lesson.repository'
import { PaymentStatus } from '@/models/enums/status'
import { InvoiceRepository } from '@/models/invoice.repository'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { StudentScheduleRepository } from '@/models/student-schedule.repository'

// ============================================================================
// DTOs & Interfaces
// ============================================================================

interface DateRangeParams {
  startDate: Date
  endDate: Date
  institutionId: number
  siteId: number
}

interface FilterParams {
  courseId?: number
  classId?: number
  instructorId?: number
  studentName?: string
}

interface DashboardParams extends DateRangeParams, FilterParams {
  type: 'revenue' | 'student'
  filter: string
}

interface LessonListParams extends DateRangeParams, FilterParams {
  page?: number
  limit?: number
  lessonId?: number
  lessonName?: string
}

// ============================================================================
// Statistics Service (Clean Architecture)
// ============================================================================

@Injectable()
export class InvoiceStatisticsService {
  constructor(
    private readonly invoiceRepository: InvoiceRepository,
    private readonly classLessonRepository: ClassLessonRepository,
    private readonly studentLessonRepository: StudentLessonRepository,
    private readonly studentScheduleRepository: StudentScheduleRepository
  ) {}

  // ==========================================================================
  // PUBLIC METHODS - Main Entry Points
  // ==========================================================================

  /**
   * Get dashboard statistics based on type and filter
   */
  async getDashboardStatistics(params: DashboardParams) {
    this.validateDateRange(params.startDate, params.endDate)

    if (params.type === 'revenue') {
      return this.getRevenueStatistics(params)
    } else if (params.type === 'student') {
      return this.getStudentStatistics(params)
    }

    throw new BadRequestException('Invalid type. Use "revenue" or "student".')
  }

  /**
   * Get paginated lesson list with revenue
   */
  async getLessonList(params: LessonListParams) {
    this.validateDateRange(params.startDate, params.endDate)

    const { page = 1, limit = 20 } = params

    const qb = this.createLessonListQuery(params)

    // Get total count
    const total = await qb.getCount()

    // Get paginated results
    const lessons = await qb
      .offset((page - 1) * limit)
      .limit(limit)
      .getRawMany()

    return {
      data: lessons.map(this.mapLessonListRow),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }

  /**
   * Get detailed breakdown of a single lesson
   */
  async getLessonDetail(params: { lessonId: number; institutionId: number; siteId: number }) {
    const { lessonId, institutionId } = params

    // Get lesson metadata
    const lessonInfo = await this.classLessonRepository
      .createQueryBuilder('cl')
      .leftJoin('cl.course', 'c')
      .leftJoin('cl.class', 'ce')
      .leftJoin('cl.instructor', 'teacher')
      .select([
        'cl.id AS id',
        'cl.start_time AS date',
        'cl.end_time AS time',
        'c.name AS course',
        'ce.name AS class',
        "COALESCE(teacher.first_name || ' ' || teacher.last_name, '-') AS teachers",
      ])
      .where('cl.id = :lessonId', { lessonId })
      .andWhere('cl.institution_id = :institutionId', { institutionId })
      .getRawOne()

    if (!lessonInfo) {
      throw new NotFoundException('Lesson not found')
    }

    // Get student payments
    const studentPayments = await this.getLessonStudentPayments(lessonId, institutionId)

    // Calculate totals
    const totalStudents = studentPayments.length
    const totalRevenue = studentPayments
      .filter((p) => p.paymentStatus === PaymentStatus.PAID)
      .reduce((sum, p) => sum + p.totalLessonValue, 0)

    return {
      lesson: {
        ...lessonInfo,
        students: totalStudents,
        totalRevenue: this.round(totalRevenue),
      },
      studentPayments,
    }
  }

  /**
   * Get student statistics overview
   */
  async getStudentStatisticsByStudent(params: DateRangeParams & FilterParams) {
    this.validateDateRange(params.startDate, params.endDate)

    const summary = await this.getStudentOverviewSummary(params)
    const students = await this.getStudentDetailList(params)

    return { summary, students }
  }

  /**
   * Get course details for a specific student
   */
  async getStudentCourseDetails(studentId: number, params: DateRangeParams) {
    this.validateDateRange(params.startDate, params.endDate)

    const [currentCourses, droppedCourses] = await Promise.all([
      this.getStudentActiveCourses(studentId, params),
      this.getStudentDroppedCourses(studentId, params),
    ])

    return { currentCourses, droppedCourses }
  }

  /**
   * Get list of students who dropped out from a specific class
   */
  async getDropoutStudents(params: {
    classId: number
    startDate: Date
    endDate: Date
    institutionId: number
    siteId: number
  }) {
    this.validateDateRange(params.startDate, params.endDate)

    const students = await this.studentScheduleRepository
      .createQueryBuilder('ss')
      .innerJoin('ss.enrollCourses', 'ec')
      .innerJoin('ec.student', 'stu')
      .select([
        "COALESCE(stu.first_name, '') || ' ' || COALESCE(stu.last_name, '') AS name",
        'stu.phone AS phone',
        'stu.email AS email',
      ])
      .addSelect(
        `(SELECT MAX(cl.start_time)
          FROM student_lesson sl
          INNER JOIN class_lessons cl ON sl.class_lesson_id = cl.id
          WHERE sl.student_schedule_id = ss.id
            AND sl.attendance = 'ATTENDED'
            AND cl.start_time < :endDate)`,
        'last_attendance'
      )
      .where('ss.class_id = :classId', { classId: params.classId })
      .andWhere('ec.institution_id = :institutionId', {
        institutionId: params.institutionId,
      })
      .andWhere(
        `NOT EXISTS (
          SELECT 1
          FROM student_lesson sl
          INNER JOIN class_lessons cl ON sl.class_lesson_id = cl.id
          WHERE sl.student_schedule_id = ss.id
            AND sl.attendance = 'ATTENDED'
            AND cl.start_time >= :startDate
            AND cl.start_time < :endDate
        )`
      )
      .setParameters({
        classId: params.classId,
        startDate: params.startDate,
        endDate: params.endDate,
        institutionId: params.institutionId,
      })
      .getRawMany()

    return {
      students: students.map((s) => ({
        name: s.name,
        phone: s.phone,
        email: s.email,
        lastAttendance: s.last_attendance || null,
      })),
    }
  }

  // ==========================================================================
  // REVENUE STATISTICS - Private Methods
  // ==========================================================================

  private async getRevenueStatistics(params: DashboardParams) {
    switch (params.filter) {
      case 'overview':
        return this.getRevenueOverview(params)
      case 'by-course':
        return this.getRevenueGrouped(params, 'course')
      case 'by-class':
        return this.getRevenueGrouped(params, 'class')
      case 'by-instructor':
        return this.getRevenueGrouped(params, 'instructor')
      default:
        throw new BadRequestException(
          'Invalid filter. Use: overview, by-course, by-class, by-instructor'
        )
    }
  }

  /**
   * Revenue Overview: Total Revenue, Completed Lessons, Active Students
   *
   * Formula (from requirement):
   * Total Revenue = Σ (pay_amount / num_of_lesson)
   *                 for all ATTENDED students in PAID invoices
   */
  private async getRevenueOverview(params: DateRangeParams & FilterParams) {
    const qb = this.createRevenueBaseQuery(params)
      .select([
        // Total Revenue: sum of (pay_amount / num_of_lesson) per attended lesson
        `COALESCE(
          ROUND(
            SUM(
              CASE 
                WHEN sl.attendance = 'ATTENDED' AND i.payment_state = :paid
                THEN i.pay_amount / NULLIF(i.num_of_lesson, 0)
                ELSE 0
              END
            )::numeric, 
            2
          ), 
          0
        ) AS total_revenue`,

        // Completed Lessons: distinct lesson count
        'COUNT(DISTINCT cl.id) AS completed_lessons',

        // Active Students: distinct students who attended
        'COUNT(DISTINCT CASE WHEN sl.attendance = :attended THEN sl.user_id END) AS active_students',
      ])
      .setParameter('paid', PaymentStatus.PAID)
      .setParameter('attended', 'ATTENDED')

    const result = await qb.getRawOne()

    return {
      totalRevenue: parseFloat(result.total_revenue) || 0,
      completedLessons: parseInt(result.completed_lessons, 10) || 0,
      activeStudents: parseInt(result.active_students, 10) || 0,
    }
  }

  /**
   * Revenue Grouped by Course/Class/Instructor
   */
  private async getRevenueGrouped(
    params: DateRangeParams & FilterParams,
    groupBy: 'course' | 'class' | 'instructor'
  ) {
    const qb = this.createRevenueBaseQuery(params)

    // Add appropriate joins and selects based on groupBy
    if (groupBy === 'course') {
      qb.innerJoin('cl.course', 'c')
        .select(['c.id AS id', 'c.name AS name'])
        .groupBy('c.id, c.name')
    } else if (groupBy === 'class') {
      qb.innerJoin('cl.class', 'ce')
        .select(['ce.id AS id', 'ce.name AS name'])
        .groupBy('ce.id, ce.name')
    } else if (groupBy === 'instructor') {
      qb.leftJoin('cl.instructor', 'ins')
        .select(['ins.id AS id', "ins.first_name || ' ' || ins.last_name AS name"])
        .andWhere('ins.id IS NOT NULL')
        .groupBy('ins.id, ins.first_name, ins.last_name')
    }

    // Add common aggregates
    qb.addSelect([
      `ROUND(
        SUM(
          CASE 
            WHEN sl.attendance = 'ATTENDED' AND i.payment_state = :paid
            THEN i.pay_amount / NULLIF(i.num_of_lesson, 0)
            ELSE 0
          END
        )::numeric, 
        2
      ) AS total_revenue`,
      'COUNT(DISTINCT cl.id) AS lessons',
      'COUNT(DISTINCT CASE WHEN sl.attendance = :attended THEN sl.user_id END) AS students',
    ])
      .setParameter('paid', PaymentStatus.PAID)
      .setParameter('attended', 'ATTENDED')
      .orderBy('total_revenue', 'DESC')

    const results = await qb.getRawMany()

    return results.map((r) => ({
      id: parseInt(r.id, 10),
      name: r.name,
      totalRevenue: parseFloat(r.total_revenue) || 0,
      lessons: parseInt(r.lessons, 10) || 0,
      students: parseInt(r.students, 10) || 0,
    }))
  }

  // ==========================================================================
  // STUDENT STATISTICS - Private Methods
  // ==========================================================================

  private async getStudentStatistics(params: DashboardParams) {
    switch (params.filter) {
      case 'overview':
        return this.getStudentOverview(params)
      case 'by-student':
        return this.getStudentByStudent(params)
      case 'by-instructor':
        return this.getStudentByInstructor(params)
      default:
        throw new BadRequestException('Invalid filter. Use: overview, by-student, by-instructor')
    }
  }

  /**
   * Student Overview with class-level dropout stats
   */
  private async getStudentOverview(params: DateRangeParams & FilterParams) {
    const summary = await this.getStudentOverviewSummary(params)
    const classes = await this.getClassDropoutStats(params)

    return { summary, classes }
  }

  /**
   * Calculate student overview summary
   */
  private async getStudentOverviewSummary(params: DateRangeParams & FilterParams) {
    const baseQb = () =>
      this.studentScheduleRepository
        .createQueryBuilder('ss')
        .innerJoin('ss.enrollCourses', 'ec')
        .innerJoin('ec.student', 'stu')
        .where('ec.institution_id = :institutionId', {
          institutionId: params.institutionId,
        })

    // Apply filters helper
    const applyFilters = (qb: any) => {
      if (params.courseId) {
        qb.innerJoin('ss.class', 'ce_filter')
          .innerJoin('ce_filter.course', 'c_filter')
          .andWhere('c_filter.id = :courseId', { courseId: params.courseId })
      }
      if (params.classId) {
        qb.innerJoin('ss.class', 'ce_filter2').andWhere('ce_filter2.id = :classId', {
          classId: params.classId,
        })
      }
      if (params.instructorId) {
        qb.innerJoin('ss.class', 'ce_filter3')
          .innerJoin('ce_filter3.instructor', 'ins_filter')
          .andWhere('ins_filter.id = :instructorId', {
            instructorId: params.instructorId,
          })
      }
      return qb
    }

    // Active Students: attended at least one lesson in period
    let activeQb = baseQb()
      .innerJoin('ss.studentLessons', 'sl')
      .innerJoin('sl.classLesson', 'cl')
      .select('COUNT(DISTINCT stu.id)', 'count')
      .andWhere('cl.start_time >= :startDate', { startDate: params.startDate })
      .andWhere('cl.start_time < :endDate', { endDate: params.endDate })
      .andWhere('sl.attendance = :attended', { attended: 'ATTENDED' })

    activeQb = applyFilters(activeQb)

    // New Students: first attended lesson in period
    let newQb = baseQb()
      .innerJoin('ss.studentLessons', 'sl')
      .innerJoin('sl.classLesson', 'cl')
      .select('COUNT(DISTINCT stu.id)', 'count')
      .andWhere('cl.start_time >= :startDate', { startDate: params.startDate })
      .andWhere('cl.start_time < :endDate', { endDate: params.endDate })
      .andWhere('sl.attendance = :attended', { attended: 'ATTENDED' })
      .andWhere(
        `(SELECT MIN(cl2.start_time)
         FROM student_lesson sl2
         JOIN class_lessons cl2 ON sl2.class_lesson_id = cl2.id
         WHERE sl2.student_schedule_id = ss.id
           AND sl2.attendance = :attended) 
         BETWEEN :startDate AND :endDate`
      )

    newQb = applyFilters(newQb)

    // Dropouts: enrolled but no attendance in period
    let dropoutQb = baseQb()
      .select('COUNT(DISTINCT stu.id)', 'count')
      .andWhere(
        `NOT EXISTS (
         SELECT 1
         FROM student_lesson sl
         JOIN class_lessons cl ON sl.class_lesson_id = cl.id
         WHERE sl.student_schedule_id = ss.id
           AND sl.attendance = :attended
           AND cl.start_time >= :startDate
           AND cl.start_time < :endDate
       )`
      )

    dropoutQb = applyFilters(dropoutQb)

    const [activeResult, newResult, dropoutResult] = await Promise.all([
      activeQb
        .setParameters({
          startDate: params.startDate,
          endDate: params.endDate,
          attended: 'ATTENDED',
          institutionId: params.institutionId,
        })
        .getRawOne(),
      newQb
        .setParameters({
          startDate: params.startDate,
          endDate: params.endDate,
          attended: 'ATTENDED',
          institutionId: params.institutionId,
        })
        .getRawOne(),
      dropoutQb
        .setParameters({
          startDate: params.startDate,
          endDate: params.endDate,
          attended: 'ATTENDED',
          institutionId: params.institutionId,
        })
        .getRawOne(),
    ])

    const activeStudents = parseInt(activeResult.count, 10) || 0
    const newStudentsThisMonth = parseInt(newResult.count, 10) || 0
    const totalDropouts = parseInt(dropoutResult.count, 10) || 0
    const dropoutRate = activeStudents > 0 ? this.round((totalDropouts / activeStudents) * 100) : 0

    return {
      activeStudents,
      newStudentsThisMonth,
      totalDropouts,
      dropoutRate,
    }
  }

  /**
   * Get class-level dropout statistics
   */
  private async getClassDropoutStats(params: DateRangeParams & FilterParams) {
    const qb = this.studentScheduleRepository
      .createQueryBuilder('ss')
      .innerJoin('ss.class', 'ce')
      .innerJoin('ce.course', 'c')
      .leftJoin('ce.instructor', 'ins')
      .innerJoin('ss.enrollCourses', 'ec')
      .innerJoin('ec.student', 'stu')
      .select([
        'ce.id AS class_id',
        'c.name AS course_name',
        'ce.name AS class_name',
        "COALESCE(ins.first_name || ' ' || ins.last_name, '-') AS teacher_name",
        'COUNT(DISTINCT stu.id) AS total_students',
      ])
      .where('ec.institution_id = :institutionId', {
        institutionId: params.institutionId,
      })

    // Apply filters
    if (params.courseId) {
      qb.andWhere('c.id = :courseId', { courseId: params.courseId })
    }
    if (params.classId) {
      qb.andWhere('ce.id = :classId', { classId: params.classId })
    }
    if (params.instructorId) {
      qb.andWhere('ins.id = :instructorId', { instructorId: params.instructorId })
    }

    // New students subquery
    qb.addSelect(
      `(SELECT COUNT(DISTINCT stu_new.id)
        FROM student_schedule ss_new
        INNER JOIN enroll_courses ec_new ON ec_new.id = ANY(ss_new.enroll_course_ids)
        INNER JOIN users stu_new ON stu_new.id = ec_new.student_id
        INNER JOIN student_lesson sl_new ON sl_new.student_schedule_id = ss_new.id
        INNER JOIN class_lessons cl_new ON cl_new.id = sl_new.class_lesson_id
        WHERE ss_new.class_id = ce.id
          AND sl_new.attendance = 'ATTENDED'
          AND cl_new.start_time >= :startDate
          AND cl_new.start_time < :endDate
          AND (SELECT MIN(cl_first.start_time)
               FROM student_lesson sl_first
               INNER JOIN class_lessons cl_first ON cl_first.id = sl_first.class_lesson_id
               WHERE sl_first.student_schedule_id = ss_new.id
                 AND sl_first.attendance = 'ATTENDED')
              BETWEEN :startDate AND :endDate
      )`,
      'new_students'
    )

    // Dropouts subquery
    qb.addSelect(
      `(SELECT COUNT(DISTINCT stu_drop.id)
        FROM student_schedule ss_drop
        INNER JOIN enroll_courses ec_drop ON ec_drop.id = ANY(ss_drop.enroll_course_ids)
        INNER JOIN users stu_drop ON stu_drop.id = ec_drop.student_id
        WHERE ss_drop.class_id = ce.id
          AND NOT EXISTS (
            SELECT 1
            FROM student_lesson sl_check
            INNER JOIN class_lessons cl_check ON cl_check.id = sl_check.class_lesson_id
            WHERE sl_check.student_schedule_id = ss_drop.id
              AND sl_check.attendance = 'ATTENDED'
              AND cl_check.start_time >= :startDate
              AND cl_check.start_time < :endDate
          )
      )`,
      'dropouts'
    )

    qb.groupBy('ce.id, c.name, ce.name, ins.first_name, ins.last_name').setParameters({
      startDate: params.startDate,
      endDate: params.endDate,
      attended: 'ATTENDED',
      institutionId: params.institutionId,
    })

    const results = await qb.getRawMany()

    return results.map((r) => {
      const total = parseInt(r.total_students, 10) || 0
      const dropouts = parseInt(r.dropouts, 10) || 0
      return {
        classId: parseInt(r.class_id, 10),
        courseName: r.course_name,
        className: r.class_name,
        teacherName: r.teacher_name,
        totalStudents: total,
        newStudents: parseInt(r.new_students, 10) || 0,
        dropouts,
        dropoutRate: total > 0 ? this.round((dropouts / total) * 100) : 0,
      }
    })
  }

  /**
   * Student stats grouped by individual student
   */
  private async getStudentByStudent(params: DateRangeParams & FilterParams) {
    const qb = this.createRevenueBaseQuery(params)
      .innerJoin('sl.user', 'stu')
      .innerJoin('cl.course', 'c')
      .select([
        'stu.id AS id',
        "stu.first_name || ' ' || stu.last_name AS name",
        `ROUND(
          SUM(
            CASE 
              WHEN sl.attendance = 'ATTENDED' AND i.payment_state = :paid
              THEN i.pay_amount / NULLIF(i.num_of_lesson, 0)
              ELSE 0
            END
          )::numeric, 
          2
        ) AS total_revenue`,
        'COUNT(DISTINCT cl.id) AS lessons',
        'COUNT(DISTINCT c.id) AS courses',
      ])
      .groupBy('stu.id, stu.first_name, stu.last_name')
      .orderBy('total_revenue', 'DESC')
      .setParameter('paid', PaymentStatus.PAID)

    const results = await qb.getRawMany()

    return results.map((r) => ({
      id: parseInt(r.id, 10),
      name: r.name,
      totalRevenue: parseFloat(r.total_revenue) || 0,
      lessons: parseInt(r.lessons, 10) || 0,
      courses: parseInt(r.courses, 10) || 0,
    }))
  }

  /**
   * Student stats grouped by instructor
   */
  private async getStudentByInstructor(params: DateRangeParams & FilterParams) {
    const qb = this.createRevenueBaseQuery(params)
      .innerJoin('cl.instructor', 'ins')
      .select([
        'ins.id AS id',
        "ins.first_name || ' ' || ins.last_name AS name",
        `ROUND(
          SUM(
            CASE 
              WHEN sl.attendance = 'ATTENDED' AND i.payment_state = :paid
              THEN i.pay_amount / NULLIF(i.num_of_lesson, 0)
              ELSE 0
            END
          )::numeric, 
          2
        ) AS total_revenue`,
        'COUNT(DISTINCT cl.id) AS lessons',
        'COUNT(DISTINCT sl.user_id) AS students',
      ])
      .andWhere('ins.id IS NOT NULL')
      .groupBy('ins.id, ins.first_name, ins.last_name')
      .orderBy('total_revenue', 'DESC')
      .setParameter('paid', PaymentStatus.PAID)

    const results = await qb.getRawMany()

    return results.map((r) => ({
      id: parseInt(r.id, 10),
      name: r.name,
      totalRevenue: parseFloat(r.total_revenue) || 0,
      lessons: parseInt(r.lessons, 10) || 0,
      students: parseInt(r.students, 10) || 0,
    }))
  }

  /**
   * Get detailed student list with course counts
   */
  private async getStudentDetailList(params: DateRangeParams & FilterParams) {
    const qb = this.studentScheduleRepository
      .createQueryBuilder('ss')
      .innerJoin('ss.enrollCourses', 'ec')
      .innerJoin('ec.student', 'stu')
      .select([
        'stu.id AS student_id',
        "stu.first_name || ' ' || stu.last_name AS student_name",
        'stu.phone AS phone',
        'stu.email AS email',
      ])
      .where('ec.institution_id = :institutionId', {
        institutionId: params.institutionId,
      })

    // Apply filters
    if (params.studentName) {
      qb.andWhere("LOWER(stu.first_name || ' ' || stu.last_name) LIKE LOWER(:studentName)", {
        studentName: `%${params.studentName}%`,
      })
    }
    if (params.classId) {
      qb.andWhere('ss.class_id = :classId', { classId: params.classId })
    }

    // Current courses count
    qb.addSelect(
      `(SELECT COUNT(DISTINCT ss2.id)
        FROM student_schedule ss2
        WHERE ss2.user_id = stu.id
          AND EXISTS (
            SELECT 1
            FROM student_lesson sl2
            INNER JOIN class_lessons cl2 ON cl2.id = sl2.class_lesson_id
            WHERE sl2.student_schedule_id = ss2.id
              AND sl2.attendance = 'ATTENDED'
              AND cl2.start_time >= :startDate
              AND cl2.start_time < :endDate
          )
      )`,
      'current_courses'
    )

    // New courses count
    qb.addSelect(
      `(SELECT COUNT(DISTINCT ss3.id)
        FROM student_schedule ss3
        INNER JOIN student_lesson sl3 ON sl3.student_schedule_id = ss3.id
        INNER JOIN class_lessons cl3 ON cl3.id = sl3.class_lesson_id
        WHERE ss3.user_id = stu.id
          AND (SELECT MIN(cl_first.start_time)
               FROM student_lesson sl_first
               INNER JOIN class_lessons cl_first ON cl_first.id = sl_first.class_lesson_id
               WHERE sl_first.student_schedule_id = ss3.id
                 AND sl_first.attendance = 'ATTENDED')
              BETWEEN :startDate AND :endDate
      )`,
      'new_courses'
    )

    // Dropped courses count
    qb.addSelect(
      `(SELECT COUNT(DISTINCT ss4.id)
        FROM student_schedule ss4
        WHERE ss4.user_id = stu.id
          AND NOT EXISTS (
            SELECT 1
            FROM student_lesson sl4
            INNER JOIN class_lessons cl4 ON cl4.id = sl4.class_lesson_id
            WHERE sl4.student_schedule_id = ss4.id
              AND sl4.attendance = 'ATTENDED'
              AND cl4.start_time >= :startDate
              AND cl4.start_time < :endDate
          )
      )`,
      'dropped_courses'
    )

    qb.groupBy('stu.id, stu.first_name, stu.last_name, stu.phone, stu.email').setParameters({
      startDate: params.startDate,
      endDate: params.endDate,
      institutionId: params.institutionId,
    })

    const results = await qb.getRawMany()

    return results.map((r) => {
      const current = parseInt(r.current_courses, 10) || 0
      const dropped = parseInt(r.dropped_courses, 10) || 0
      return {
        studentId: parseInt(r.student_id, 10),
        studentName: r.student_name,
        phone: r.phone,
        email: r.email,
        numberOfCourses: current,
        newCourses: parseInt(r.new_courses, 10) || 0,
        coursesDroppedOut: dropped,
        totallyDroppedOut: current === 0 && dropped > 0 ? 'Yes' : 'No',
      }
    })
  }

  /**
   * Get active courses for a student
   */
  private async getStudentActiveCourses(studentId: number, params: DateRangeParams) {
    const courses = await this.studentScheduleRepository
      .createQueryBuilder('ss')
      .innerJoin('ss.class', 'ce')
      .innerJoin('ce.course', 'c')
      .leftJoin('ce.instructor', 'ins')
      .innerJoin('ss.studentLessons', 'sl')
      .innerJoin('sl.classLesson', 'cl')
      .select([
        'c.name AS course_name',
        'ce.name AS class_name',
        "COALESCE(ins.first_name || ' ' || ins.last_name, '-') AS instructor",
        'MAX(cl.start_time) AS last_attendance',
      ])
      .where('ss.user_id = :studentId', { studentId })
      .andWhere('cl.start_time >= :startDate', { startDate: params.startDate })
      .andWhere('cl.start_time < :endDate', { endDate: params.endDate })
      .andWhere('sl.attendance = :attended', { attended: 'ATTENDED' })
      .groupBy('c.name, ce.name, ins.first_name, ins.last_name')
      .getRawMany()

    return courses.map((c) => ({
      courseName: c.course_name,
      class: c.class_name,
      instructor: c.instructor,
      lastAttendance: c.last_attendance,
    }))
  }

  /**
   * Get dropped courses for a student
   */
  private async getStudentDroppedCourses(studentId: number, params: DateRangeParams) {
    const courses = await this.studentScheduleRepository
      .createQueryBuilder('ss')
      .innerJoin('ss.class', 'ce')
      .innerJoin('ce.course', 'c')
      .leftJoin('ce.instructor', 'ins')
      .select([
        'c.name AS course_name',
        'ce.name AS class_name',
        "COALESCE(ins.first_name || ' ' || ins.last_name, '-') AS instructor",
      ])
      .addSelect(
        `(SELECT MAX(cl_prev.start_time)
          FROM student_lesson sl_prev
          INNER JOIN class_lessons cl_prev ON cl_prev.id = sl_prev.class_lesson_id
          WHERE sl_prev.student_schedule_id = ss.id
            AND sl_prev.attendance = 'ATTENDED'
            AND cl_prev.start_time < :startDate
        )`,
        'last_attendance'
      )
      .where('ss.user_id = :studentId', { studentId })
      .andWhere(
        `NOT EXISTS (
          SELECT 1
          FROM student_lesson sl
          INNER JOIN class_lessons cl ON cl.id = sl.class_lesson_id
          WHERE sl.student_schedule_id = ss.id
            AND sl.attendance = 'ATTENDED'
            AND cl.start_time >= :startDate
            AND cl.start_time < :endDate
        )`
      )
      .groupBy('c.name, ce.name, ins.first_name, ins.last_name, ss.id')
      .setParameters({
        studentId,
        startDate: params.startDate,
        endDate: params.endDate,
      })
      .getRawMany()

    return courses.map((c) => ({
      courseName: c.course_name,
      class: c.class_name,
      instructor: c.instructor,
      lastAttendance: c.last_attendance || null,
    }))
  }

  // ==========================================================================
  // LESSON DETAILS - Private Methods
  // ==========================================================================

  /**
   * Create lesson list query with filters
   */
  private createLessonListQuery(params: LessonListParams) {
    const qb = this.classLessonRepository
      .createQueryBuilder('cl')
      .leftJoin('cl.course', 'c')
      .leftJoin('cl.class', 'ce')
      .leftJoin('cl.instructor', 'teacher')
      .leftJoin('cl.studentLessons', 'sl')
      .select([
        'cl.id AS id',
        'cl.start_time AS date',
        'cl.start_time AS time',
        'c.name AS course',
        'ce.name AS class',
        "'Lesson ' || cl.id AS lesson",
        "COALESCE(teacher.first_name || ' ' || teacher.last_name, '-') AS teachers",
        'COUNT(DISTINCT sl.user_id) AS students',
        "'COMPLETED' AS status",
      ])
      .where('cl.institution_id = :institutionId', {
        institutionId: params.institutionId,
      })
      .andWhere('cl.start_time >= :startDate', { startDate: params.startDate })
      .andWhere('cl.start_time < :endDate', { endDate: params.endDate })

    // Apply filters
    if (params.courseId) {
      qb.andWhere('c.id = :courseId', { courseId: params.courseId })
    }
    if (params.classId) {
      qb.andWhere('ce.id = :classId', { classId: params.classId })
    }
    if (params.instructorId) {
      qb.andWhere('teacher.id = :instructorId', { instructorId: params.instructorId })
    }
    if (params.studentName) {
      qb.innerJoin('sl.user', 'stu').andWhere(
        "LOWER(stu.first_name || ' ' || stu.last_name) LIKE LOWER(:studentName)",
        { studentName: `%${params.studentName}%` }
      )
    }
    if (params.lessonId) {
      qb.andWhere('cl.id = :lessonId', { lessonId: params.lessonId })
    }
    if (params.lessonName) {
      qb.andWhere(
        "LOWER(c.name || ' ' || TO_CHAR(cl.start_time, 'DD Mon YYYY')) LIKE LOWER(:lessonName)",
        { lessonName: `%${params.lessonName}%` }
      )
    }

    // Add revenue calculation
    // Formula: SUM of (pay_amount / num_of_lesson) for ATTENDED + PAID students
    qb.addSelect(
      `COALESCE(
        ROUND(
          (SELECT SUM(i_sub.pay_amount / NULLIF(i_sub.num_of_lesson, 0))
           FROM student_lesson sl_sub
           INNER JOIN student_schedule ss_sub ON ss_sub.id = sl_sub.student_schedule_id
           INNER JOIN invoices i_sub ON i_sub.id = ss_sub.invoice_id
           WHERE sl_sub.class_lesson_id = cl.id
             AND sl_sub.attendance = 'ATTENDED'
             AND i_sub.payment_state = :paid
             AND i_sub.institution_id = :institutionId
          )::numeric,
          2
        ),
        0
      )`,
      'total_revenue'
    ).setParameter('paid', PaymentStatus.PAID)

    qb.groupBy(
      'cl.id, cl.start_time, c.name, ce.name, teacher.first_name, teacher.last_name'
    ).orderBy('cl.start_time', 'DESC')

    return qb
  }

  /**
   * Map lesson list row to response format
   */
  private mapLessonListRow(row: any) {
    return {
      id: parseInt(row.id, 10),
      date: row.date,
      time: row.time,
      course: row.course,
      class: row.class,
      lesson: row.lesson,
      teachers: row.teachers,
      students: parseInt(row.students, 10) || 0,
      status: row.status || 'COMPLETED',
      totalRevenue: parseFloat(row.total_revenue) || 0,
    }
  }

  /**
   * Get student payments for a specific lesson
   *
   * Returns per-student breakdown:
   * - Total Lesson Value = pay_amount / num_of_lesson
   * - Credit Applied = used_balance / num_of_lesson
   * - Net Payment = Total - Credit
   */
  private async getLessonStudentPayments(lessonId: number, institutionId: number) {
    const payments = await this.studentLessonRepository
      .createQueryBuilder('sl')
      .innerJoin('sl.user', 'stu')
      .innerJoin('sl.studentSchedule', 'ss')
      .innerJoin('ss.invoice', 'i')
      .select([
        'stu.id AS student_id',
        "COALESCE(stu.first_name, '') || ' ' || COALESCE(stu.last_name, '') AS name",
        'stu.phone AS phone',

        // Total Lesson Value (from requirement)
        'ROUND((i.pay_amount / NULLIF(i.num_of_lesson, 0))::numeric, 2) AS total_lesson_value',

        // Credit Applied (used_balance divided by number of lessons)
        'ROUND((COALESCE(i.used_balance, 0) / NULLIF(i.num_of_lesson, 0))::numeric, 2) AS credit_applied',

        // Net Payment = Total - Credit
        'ROUND(((i.pay_amount - COALESCE(i.used_balance, 0)) / NULLIF(i.num_of_lesson, 0))::numeric, 2) AS net_payment',

        'i.payment_state AS payment_status',
        'sl.attendance AS attendance_status',
      ])
      .where('sl.class_lesson_id = :lessonId', { lessonId })
      .andWhere('i.institution_id = :institutionId', { institutionId })
      .orderBy('stu.last_name', 'ASC')
      .addOrderBy('stu.first_name', 'ASC')
      .getRawMany()

    return payments.map((p) => ({
      studentId: parseInt(p.student_id, 10),
      name: p.name,
      phone: p.phone,
      totalLessonValue: parseFloat(p.total_lesson_value) || 0,
      creditApplied: parseFloat(p.credit_applied) || 0,
      netPayment: parseFloat(p.net_payment) || 0,
      paymentStatus: p.payment_status,
      attendanceStatus: p.attendance_status,
    }))
  }

  // ==========================================================================
  // QUERY BUILDERS - Base Queries
  // ==========================================================================

  /**
   * Create base revenue query with common joins and filters
   */
  private createRevenueBaseQuery(params: DateRangeParams & FilterParams): SelectQueryBuilder<any> {
    let qb = this.classLessonRepository
      .createQueryBuilder('cl')
      .innerJoin('cl.studentLessons', 'sl')
      .innerJoin('sl.studentSchedule', 'ss')
      .innerJoin('ss.invoice', 'i')
      .where('cl.start_time >= :startDate', { startDate: params.startDate })
      .andWhere('cl.start_time < :endDate', { endDate: params.endDate })
      .andWhere('cl.institution_id = :institutionId', {
        institutionId: params.institutionId,
      })
      .andWhere('i.num_of_lesson > 0')

    // Apply optional filters
    if (params.courseId) {
      qb = qb
        .innerJoin('cl.course', 'c_filter')
        .andWhere('c_filter.id = :courseId', { courseId: params.courseId })
    }
    if (params.classId) {
      qb = qb
        .innerJoin('cl.class', 'ce_filter')
        .andWhere('ce_filter.id = :classId', { classId: params.classId })
    }
    if (params.instructorId) {
      qb = qb.innerJoin('cl.instructor', 'ins_filter').andWhere('ins_filter.id = :instructorId', {
        instructorId: params.instructorId,
      })
    }

    return qb
  }

  // ==========================================================================
  // UTILITY METHODS
  // ==========================================================================

  /**
   * Validate date range
   */
  private validateDateRange(startDate: Date, endDate: Date) {
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Invalid date format')
    }
    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before end date')
    }
  }

  /**
   * Round to 2 decimal places
   */
  private round(value: number): number {
    return Math.round(value * 100) / 100
  }
}
