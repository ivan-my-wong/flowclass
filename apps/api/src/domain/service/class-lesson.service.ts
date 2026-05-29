import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { randomUUID } from 'crypto'
import * as dayjs from 'dayjs'
import * as _ from 'lodash'
import {
  And,
  Brackets,
  FindOptionsWhere,
  ILike,
  In,
  IsNull,
  LessThan,
  LessThanOrEqual,
  MoreThan,
  MoreThanOrEqual,
  Not,
  Raw,
  Repository,
} from 'typeorm'

import {
  CreateClassLessonDto,
  UpdateClassLessonDto,
} from '@/application/admin/class-lesson/dto/create-class-lesson.dto'
import {
  CheckNextRecurringLessonDTO,
  LessonInvoiceTokenDTO,
  UpdateLessonInstructorDTO,
  UpdateLessonLocationRoomDTO,
} from '@/application/admin/class-lesson/dto/detail-list-class-lesson.dto'
import {
  CheckQuotaDto,
  CheckQuotaResponseDto,
  ListClassLessonDto,
  ListStudentsWithPage,
} from '@/application/admin/class-lesson/dto/list-class-lesson.dto'
import { ChangeLessonEmailDTO } from '@/application/admin/setting-notifications/setting-notifications.dto'
import { ApiError } from '@/common/api-formats/api-error'
import { EmailService } from '@/domain/external/email.service'
import { SettingSiteService } from '@/domain/service/setting-site.service'
import { ErrorCode } from '@/exceptions/error-message/errors'
import { InvoiceErrorMessage } from '@/exceptions/error-message/invoice'
import { ClassLessonRepository } from '@/models/class-lesson.repository'
import { ClassLesson } from '@/models/class-lessons.entity'
import { ClassEntity } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import { RecurringSchedulesRepository } from '@/models/course-recurring-schedules.entity'
import { CoursesRepository } from '@/models/courses.repository'
import { LessonString } from '@/models/custom-types/lesson-string'
import { StudentLessonWithUserMemo } from '@/models/custom-types/student-lessons'
import { ClassTypeEnum } from '@/models/enums'
import { PaymentStatus, SharedVideoStatus } from '@/models/enums/status'
import { Institution } from '@/models/institutions.entity'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { InvoiceRepository } from '@/models/invoice.repository'
import { LocationRoom, QuotaTimeSlots } from '@/models/location-room.entity'
import { SettingBlockTime } from '@/models/setting-block-time.entity'
import { SitesRepository } from '@/models/sites.repository'
import { StudentLesson } from '@/models/student-lesson.entity'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { User } from '@/models/user.entity'
import { UsersRepository } from '@/models/users.repository'
import { paginateArrays } from '@/utils/pagination.utils'
import { shallow } from '@/utils/shallow.utils'
import { studentLessonToUtc } from '@/utils/time.utils'

import { LocationRoomService } from './location-room.service'

@Injectable()
export class ClassLessonService {
  constructor(
    private readonly classLessonRepository: ClassLessonRepository,
    private readonly studentLessonRepository: StudentLessonRepository,
    private readonly invoiceRepository: InvoiceRepository,
    @InjectRepository(SettingBlockTime)
    private readonly settingBlockTimeRepository: Repository<SettingBlockTime>,
    private readonly userRepository: UsersRepository,
    private readonly emailService: EmailService,
    private readonly siteRepository: SitesRepository,
    private readonly settingSiteService: SettingSiteService,
    private readonly institutionRepository: InstitutionsRepository,
    private readonly recurringScheduleRepository: RecurringSchedulesRepository,
    private readonly classRepository: ClassRepository,
    private readonly courseRepository: CoursesRepository,
    private readonly locationRoomService: LocationRoomService
  ) {}

  async create(data: CreateClassLessonDto): Promise<ClassLesson> {
    if (data.startTime >= data.endTime)
      throw new ApiError(ErrorCode.START_TIME_EARLIER_THAN_END_TIME)

    const blockTimeExist = await this.settingBlockTimeRepository.findOne({
      where: {
        startTime: LessThan(data.endTime),
        endTime: MoreThan(data.startTime),
        institutionId: data.institutionId,
      },
    })

    if (blockTimeExist) throw new ApiError(ErrorCode.LESSON_DATE_TIME_BLOCKED)

    const classLesson = this.classLessonRepository.create({
      ...data,
      isMakeUp: false,
      isSub: false,
    })

    return this.classLessonRepository.save(classLesson)
  }

  async updateTimeLesson(id: number, data: UpdateClassLessonDto): Promise<void> {
    if (data.changeStartTime >= data.changeEndTime)
      throw new BadRequestException(ErrorCode.START_TIME_EARLIER_THAN_END_TIME)
    const institution = await this.institutionRepository.findOneById(data.institutionId)
    const blockTimeExist = await this.settingBlockTimeRepository.findOne({
      where: {
        startTime: LessThan(data.changeEndTime),
        endTime: MoreThan(data.changeStartTime),
        institutionId: data.institutionId,
      },
    })

    if (blockTimeExist) throw new ApiError(ErrorCode.LESSON_DATE_TIME_BLOCKED)

    const studentLessons = await this.studentLessonRepository.findByEffectiveClassLessonId([id], {
      relations: {
        classLesson: {
          classEntity: true,
        },
      },
    })

    const classLesson = await this.classLessonRepository.findOneById(id, {
      relations: {
        classEntity: true,
        instructor: true,
        locationRoom: true,
      },
    })

    // Update student lesson
    for (const studentLesson of studentLessons) {
      // Preserve original reference on first reschedule
      if (!studentLesson.changeStartTime) {
        studentLesson.changeClassLessonId = studentLesson.classLessonId
        studentLesson.changeStartTime = studentLesson.startTime
        studentLesson.changeEndTime = studentLesson.endTime
      }
      studentLesson.startTime = data.changeStartTime
      studentLesson.endTime = data.changeEndTime
      await this.studentLessonRepository.save(studentLesson)
    }
    // Update class lesson
    classLesson.changeStartTime = data.changeStartTime
    classLesson.changeEndTime = data.changeEndTime
    await this.classLessonRepository.save(classLesson)
    await this.sendChangeTimeLessonReminder(classLesson, institution)
  }

  async delayFollowingLesson(classLessonId: number) {
    /**
     * This function used for delay the lesson to next recurring schedule
     * And only work for class with type RECURRING Class
     * Logic:
     *  1. checks for all the student_schedule that include this student_lesson
     *  2. add an extra student_lesson which time is one week after the last student_lesson
     *  3. If there are block_time, the student_lesson will be further delayed to maybe two, or three weeks
     *  4. After all lessons are added, it will cancel the current lesson. Which means all current
     *     student_lesson and class_lesson will be deleted.
     */
    const lesson = await this.classLessonRepository.findOneById(classLessonId, {
      relations: {
        classEntity: {
          course: true,
        },
      },
    })

    if (!lesson) {
      throw new NotFoundException(ErrorCode.CLASS_NOT_FOUND)
    }
    const studentLessons = await this.studentLessonRepository.findByEffectiveClassLessonId(
      [lesson.id],
      {
        relations: {
          studentSchedule: {
            studentLessons: {
              classLesson: true,
            },
          },
        },
        order: {
          studentSchedule: {
            studentLessons: {
              startTime: 'ASC',
              changeStartTime: 'ASC',
            },
          },
        },
      }
    )
    // Get the student schedules
    const studentSchedules = studentLessons.flatMap((d) => d.studentSchedule)
    const exceptFields = [
      'createdAt',
      'updatedAt',
      'createdBy',
      'updatedBy',
      'id',
      'changeStartTime',
      'changeEndTime',
    ]
    for (const studentSchedule of studentSchedules) {
      const lastStudentLesson =
        studentSchedule.studentLessons[studentSchedule.studentLessons.length - 1]
      const { newStartTime, newEndTime } = await this.recursiveCalculateDateLesson({
        gap: 1,
        unit: 'weeks',
        startTime: lastStudentLesson.startTime,
        endTime: lastStudentLesson.endTime,
        classId: lastStudentLesson.classId,
      })
      const studentLessonFields = Object.keys(lastStudentLesson).filter(
        (key) => !exceptFields.includes(key)
      )
      // Clone the student lesson from current student lesson data
      const newStudentLesson = this.studentLessonRepository.create(
        shallow({
          source: lastStudentLesson,
          fields: studentLessonFields,
        })
      )

      // Clone the class lesson from current class lesson data
      const classLesson = lastStudentLesson.classLesson
      const classLessonFields = Object.keys(classLesson).filter(
        (key) => !exceptFields.includes(key)
      )
      const existingClass = await this.classLessonRepository.findBy({
        courseId: classLesson.courseId,
        classId: classLesson.classId,
      })
      if (!existingClass) return
      const newClassLesson = this.classLessonRepository.create({
        ...shallow({
          source: lastStudentLesson.classLesson,
          fields: classLessonFields,
        }),
        startTime: newStartTime,
        endTime: newEndTime,
      })
      const { id } = await this.classLessonRepository.save(newClassLesson)

      if (newStudentLesson.changeClassLessonId) {
        newStudentLesson.changeClassLessonId = id
      } else {
        newStudentLesson.classLessonId = id
      }

      newStudentLesson.studentScheduleId = studentSchedule.id
      newStudentLesson.startTime = newStartTime
      newStudentLesson.endTime = newEndTime

      await this.studentLessonRepository.save(newStudentLesson)
      //   Remove all current student lesson and class lesson
      await this.studentLessonRepository.deleteByEffectiveClassLessonId(lesson.id)

      await this.classLessonRepository.delete({
        id: lesson.id,
      })
    }
  }

  async sendChangeTimeLessonReminder(classLesson: ClassLesson, institution: Institution) {
    const studentLessons = await this.studentLessonRepository.findByEffectiveClassLessonId(
      [classLesson.id],
      {
        relations: {
          user: true,
        },
      }
    )

    const userIds = Array.from(new Set(studentLessons.map((d) => d.userId)))
    if (userIds.length <= 0) {
      return
    }
    const users = await this.userRepository.find({
      where: {
        id: In(userIds),
      },
    })
    for (const user of users) {
      const payload = await this.generateChangeLessonEmail(user, institution, classLesson)
      await this.emailService.sendStudentChangeLessonEmail(payload)
    }
  }

  async generateChangeLessonEmail(
    recipient: User,
    institution: Institution,
    lesson: ClassLesson
  ): Promise<ChangeLessonEmailDTO> {
    const { classId, courseId, periodId, classEntity, startTime, endTime } = lesson
    const { changeStartTime, changeEndTime } = lesson
    const site = await this.siteRepository.findOneById(classEntity.siteId)
    const timeZone = await this.settingSiteService.getTimeZone(site.id)

    const course = await this.courseRepository.findOneById(classEntity.courseId)

    const { email, phone } = institution
    const contactEmail = email || site?.email
    const contactPhone = phone || site?.phone

    const location = classEntity?.locationRoom?.name ?? ''
    const instructor = classEntity?.instructor?.firstName ?? ''

    return {
      recipientUserId: recipient.id,
      institutionId: institution.id,
      siteId: institution.siteId,
      courseId,
      classId,
      adminEmail: contactEmail,
      adminPhone: contactPhone,
      studentFirstName: recipient.firstName,
      studentPhone: recipient.phone,
      studentEmail: recipient.email,
      periodId,
      price: 0,
      className: classEntity?.name,
      courseName: course?.name,
      classLessonDate: studentLessonToUtc(startTime, startTime, endTime),
      timeZone,
      institutionName: institution.name,
      location,
      instructor,
      newClassLessonDate: studentLessonToUtc(changeStartTime, changeStartTime, changeEndTime),
    }
  }

  async createLessonToClassLessonTable({
    siteId,
    lessonSchedules,
    classId,
    courseId,
    institutionId,
    location,
    instructor,
  }: {
    siteId: number
    lessonSchedules: LessonString[] | string[]
    classId: number
    courseId: number
    institutionId: number
    location?: LocationRoom
    instructor?: User
  }): Promise<ClassLesson[]> {
    const lessons: ClassLesson[] = []
    for (const lessonDate of lessonSchedules) {
      const lessonString = new LessonString(lessonDate as string)
      const lessonData = {
        courseId,
        classId,
        locationId: location?.id,
        instructorId: instructor?.id,
        startTime: new Date(lessonString.getStartDate()),
        endTime: new Date(lessonString.getEndDate()),
      }

      let classLesson = await this.classLessonRepository.findOneBy(lessonData)

      if (!classLesson) {
        classLesson = await this.create({
          ...lessonData,
          institutionId,
        })
      }
      lessons.push(classLesson)
    }

    return lessons
  }

  async connectClassLessonToStudentLesson({
    classLessons,
    studentId,
    enrollCourseId,
    studentScheduleId,
  }: {
    classLessons: ClassLesson[]
    studentId: number
    enrollCourseId: number
    studentScheduleId: number
  }) {
    const studentLessons: StudentLesson[] = []
    const promises = classLessons.map(async (classLesson) => {
      const classLessonData = {
        classLessonId: classLesson.id,
        courseId: classLesson.courseId,
        classId: classLesson.classId,
        institutionId: classLesson.institutionId,
        userId: studentId,
        // date: classLesson.date,
        startTime: classLesson.startTime,
        endTime: classLesson.endTime,
        enrollCourseId,
        studentScheduleId,
      }
      const existingStudentLesson = await this.studentLessonRepository.findOne({
        where: {
          ...classLessonData,
        },
      })
      if (existingStudentLesson) {
        throw new BadRequestException('Student already enrolled one of the recurring lesson')
      }
      const newStudentLesson = this.studentLessonRepository.create({
        ...classLessonData,
      })
      await this.studentLessonRepository.save(newStudentLesson)
      studentLessons.push(newStudentLesson)
    })

    await Promise.all(promises)
    return studentLessons
  }

  async getList({
    classIds,
    startDate,
    endDate,
    institutionId,
    student,
    onlyWithApplications,
    locationIds,
    teacherIds,
  }: ListClassLessonDto) {
    let listClassLesson = this.classLessonRepository
      .createQueryBuilder('cl')
      .innerJoin('classes', 'class', 'class.id = cl.class_id')
      .innerJoin('courses', 'co', 'co.id = cl.course_id')
      .leftJoin('location_room', 'lr', 'lr.id = cl.location_id')
      .leftJoin('users', 'tc', 'tc.id = cl.instructor_id')
      .leftJoin('student_lesson', 'sl_count', 'sl_count.class_lesson_id = cl.id')
      .leftJoin(
        'student_lesson',
        'sl_attend',
        "sl_attend.class_lesson_id = cl.id AND sl_attend.attendance IS NOT NULL AND sl_attend.attendance != 'PENDING'"
      )
      .where('cl.institution_id = :institutionId ', {
        institutionId,
      })

    if (startDate && endDate) {
      listClassLesson = listClassLesson.andWhere(
        new Brackets((qb) => {
          qb.where('cl.start_time BETWEEN :startDate AND :endDate', { startDate, endDate })
          qb.orWhere('cl.end_time BETWEEN :startDate AND :endDate', { startDate, endDate })
        })
      )
    }

    const validClassIds = (classIds || []).filter((id) => id !== null && id !== undefined)

    // If there is NO locationIds or teacherIds, we only need to check the list of lessons in the same class
    if (validClassIds && validClassIds.length > 0) {
      listClassLesson = listClassLesson.andWhere((qb) => {
        validClassIds.forEach((id, index) => {
          if (index === 0) {
            qb.where('cl.class_id = :id' + index, { [`id${index}`]: id })
          } else {
            qb.orWhere('cl.class_id = :id' + index, { [`id${index}`]: id })
          }
        })
      })
    }

    if (student || onlyWithApplications) {
      listClassLesson = listClassLesson
        .innerJoin('student_lesson', 'sl', 'sl.class_lesson_id = cl.id')
        .distinct(true)
      if (student) {
        listClassLesson = listClassLesson
          .leftJoin('users', 'u', 'u.id = sl.user_id')
          .leftJoin('user_aliases', 'ua', 'ua.user_id = u.id')
          .andWhere(
            `
            (LOWER(ua.name) LIKE :student OR LOWER(ua.email) LIKE :student OR LOWER(u.phone) LIKE :student)
            `,
            {
              student: `%${student.toLowerCase()}%`,
            }
          )
      }
    }

    if (locationIds?.length || teacherIds?.length) {
      listClassLesson = listClassLesson.andWhere(
        new Brackets((qb) => {
          if (locationIds?.length) {
            qb.orWhere('cl.location_id IN (:...locationIds)', { locationIds })
          }
          if (teacherIds?.length) {
            qb.orWhere(
              `cl.instructor_id IN (
              SELECT ur.user_id 
              FROM user_roles ur 
              WHERE ur.id IN (:...teacherIds) 
              AND ur.institution_id = :institutionId
            )`,
              { teacherIds, institutionId }
            )
          }
        })
      )
    }

    listClassLesson = listClassLesson
      .select([
        'cl.id as id',
        'cl.start_time as start',
        'cl.end_time as end',
        'class.id as "classId"',
        'cl.course_id as "courseId"',
        'co.name as "courseName"',
        'co.preview_image_url as "previewImageUrl"',
        'class.name as "class"',
        'class.type as "type"',
        'cl.change_start_time as "changeStartTime"',
        'cl.change_end_time as "changeEndTime"',
        'cl.location_id as "locationId"',
        'lr.name as "locationName"',
        'cl.instructor_id as "instructorId"',
        'tc.first_name as "instructorName"',
        'tc.email as "instructorEmail"',
        'COUNT(DISTINCT sl_count.id) as "studentCount"',
        // Add count of attended students
        'COUNT(DISTINCT sl_attend.id) as "attendedCount"',
      ])
      .groupBy('cl.id')
      .addGroupBy('class.id')
      .addGroupBy('co.id')
      .addGroupBy('lr.id')
      .addGroupBy('tc.id')

    return listClassLesson.getRawMany()
  }

  async getListLessonMatrix({ classIds, startDate, endDate, institutionId }: ListClassLessonDto) {
    if (!institutionId) {
      throw new BadRequestException('InstitutionId is required')
    }
    if (!classIds || classIds.length === 0) {
      throw new BadRequestException('ClassIds is required')
    }
    if (!startDate || !endDate) {
      throw new BadRequestException('StartDate and EndDate are required')
    }

    const listClassLesson = this.classLessonRepository
      .createQueryBuilder('cl')
      .innerJoin('classes', 'class', 'class.id = cl.class_id')
      .innerJoin('courses', 'co', 'co.id = cl.course_id')
      .leftJoin('location_room', 'lr', 'lr.id = cl.location_id')
      .leftJoin('users', 'tc', 'tc.id = cl.instructor_id')
      .innerJoin('student_lesson', 'sl', 'sl.class_lesson_id = cl.id')
      .leftJoin('enroll_courses', 'ec', 'ec.id = sl.enroll_course_id')
      .where('cl.institution_id = :institutionId ', { institutionId })
      .andWhere(
        new Brackets((qb) => {
          qb.where('cl.start_time >= :startDate AND cl.start_time <= :endDate', {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          })
          qb.orWhere('cl.end_time >= :startDate AND cl.end_time <= :endDate', {
            startDate: new Date(startDate),
            endDate: new Date(endDate),
          })
        })
      )

    const validClassIds = (classIds || []).filter((id) => id !== null && id !== undefined)
    if (validClassIds && validClassIds.length > 0) {
      listClassLesson.andWhere(
        new Brackets((qb) => {
          validClassIds.forEach((id, index) => {
            if (index === 0) {
              qb.where('cl.class_id = :id' + index, { [`id${index}`]: id })
            } else {
              qb.orWhere('cl.class_id = :id' + index, { [`id${index}`]: id })
            }
          })
        })
      )
    }

    listClassLesson
      .select([
        'cl.id as id',
        'cl.start_time as start',
        'cl.end_time as end',
        'class.id as "classId"',
        'cl.course_id as "courseId"',
        'co.name as "courseName"',
        'co.preview_image_url as "previewImageUrl"',
        'class.name as "class"',
        'class.type as "type"',
        'cl.change_start_time as "changeStartTime"',
        'cl.change_end_time as "changeEndTime"',
        'cl.location_id as "locationId"',
        'lr.name as "locationName"',
        'cl.instructor_id as "instructorId"',
        'tc.first_name as "instructorName"',
        'tc.email as "instructorEmail"',
      ])
      .groupBy('cl.id')
      .addGroupBy('class.id')
      .addGroupBy('co.id')
      .addGroupBy('lr.id')
      .addGroupBy('tc.id')
      .orderBy('cl.start_time', 'ASC')

    const lessons = await listClassLesson.getRawMany()

    const lessonIds = lessons.map((d) => d.id)
    const studentLessonsByLesson = await this.studentLessonRepository.findByEffectiveClassLessonId(
      lessonIds,
      {
        where: { studentSchedule: { invoice: { paymentState: In(Object.values(PaymentStatus)) } } },
        relations: {
          enrollCourse: true,
          studentSchedule: { invoice: true },
          user: { aliases: true },
          changeClassLesson: { locationRoom: true },
        },
        order: { userId: 'ASC' },
      }
    )

    const listStudents = []
    const studentLessons = studentLessonsByLesson
      .filter((student: StudentLesson) => !!student?.user?.aliases)
      .map((student: StudentLesson) => {
        // Match by the enrollCourse's canonical userAliasId — name matching
        // collapses multiple aliases of the same user onto one bucket when
        // their preferredName resolves to the same alias.
        const aliases =
          student.user.aliases.find((d) => d.id === student.enrollCourse?.userAliasId) ??
          student.user.aliases.find((d) => d.name === student.enrollCourse?.preferredName)

        const payments = student.studentSchedule?.invoice
        const result = {
          aliases,
          id: student.id,
          classLessonId: student.classLessonId,
          changeClassLessonId: student.changeClassLessonId,
          changeStartTime: student.changeStartTime,
          changeEndTime: student.changeEndTime,
          attendance: student.attendance,
          enrollCourse: {
            preferredName: student.enrollCourse?.preferredName,
            preferredEmail: student.enrollCourse?.preferredEmail,
            preferredPhone: student.enrollCourse?.preferredPhone,
            enrollInto: student.enrollCourse?.enrollInto,
          },
          payments: {
            createdAt: payments?.createdAt,
            paymentState: payments?.paymentState,
          },
          hasSharedVideo: student.hasSharedVideo,
          changeLocationName: student.changeClassLesson?.locationRoom?.name ?? null,
          changeLocationColorCode: null,
          changeLessonType: null,
        }

        const check = listStudents.some((o) => {
          return o.aliases?.id === aliases?.id
        })

        if (!check && aliases?.id) listStudents.push(result)

        return result
      })

    return {
      lessons: lessons.map((o) => {
        const students = studentLessons.filter((d) => d.classLessonId === o.id)
        return { ...o, studentLessons: students }
      }),
      studentLessons: (listStudents ?? []).sort((a: StudentLesson, b: StudentLesson) => {
        return (a.enrollCourse.preferredName || '').localeCompare(
          b.enrollCourse.preferredName || ''
        )
      }),
    }
  }

  async remove(id: number): Promise<boolean> {
    const classLesson = await this.classLessonRepository.findOneBy({ id })
    if (!classLesson) {
      throw new ApiError(ErrorCode.COUPON_NOT_FOUND)
    }

    await this.classLessonRepository.softRemove(classLesson)

    return true
  }

  async getClassLessonDetail(id: number) {
    const lessonExist = await this.classLessonRepository.findOne({
      where: { id },
    })
    if (!lessonExist) throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND)

    const classLesson = await this.classLessonRepository.findOne({
      where: { id },
      relations: {
        course: true,
        class: true,
        locationRoom: true,
        instructor: true,
      },
    })

    const studentLessons = []

    // const studentLessons = await this.groupStudentLessonsByUserId(id, {
    //   withUnpaid: true,
    //   institutionId: classLesson.institutionId,
    //   siteId: classLesson.class.siteId,
    // })

    const filteredStudentLessons = studentLessons
      .filter((student) => !!student.user)
      .map((student) => {
        const aliases = student.user.aliases.find(
          (d) => d.institutionId === classLesson.institutionId
        )
        return {
          ...student,
          aliases,
        }
      }) as StudentLessonWithUserMemo[]

    classLesson.studentLessons = filteredStudentLessons

    return {
      ...classLesson,
      courseId: classLesson.courseId,
      previewImageUrl: classLesson.course?.previewImageUrl,
      previewVideoUrl: classLesson.course?.previewVideoUrl,
      courseName: classLesson.course?.name,
      classId: classLesson.classId,
      className: classLesson.class?.name,
      quota: classLesson?.class?.quota,
      quotaUsed: filteredStudentLessons.length,
    }
  }

  async groupStudentLessonsByUserId(
    classLessonId: number,
    pageParams: ListStudentsWithPage
  ): Promise<StudentLesson[]> {
    const studentScheduleFilter = {
      invoice: {
        paymentState: pageParams.withUnpaid ? In(Object.values(PaymentStatus)) : PaymentStatus.PAID,
      },
    }
    // Filter out student lessons where isCheckin = true
    // When a course or class is changed, the original student_lesson is marked with isCheckin = true
    // so it won't be retrieved in the original class-lesson list
    const baseFilter = {
      isCheckin: false,
    }
    const studentLessons = await this.studentLessonRepository.findByEffectiveClassLessonId(
      [classLessonId],
      {
        where: pageParams.search
          ? [
              {
                ...baseFilter,
                enrollCourse: {
                  userAlias: { name: ILike(`%${pageParams.search}%`) },
                },
                studentSchedule: studentScheduleFilter,
              },
              {
                ...baseFilter,
                enrollCourse: {
                  userAlias: { email: ILike(`%${pageParams.search}%`) },
                },
                studentSchedule: studentScheduleFilter,
              },
              {
                ...baseFilter,
                enrollCourse: {
                  userAlias: { user: { phone: ILike(`%${pageParams.search}%`) } },
                },
                studentSchedule: studentScheduleFilter,
              },
            ]
          : {
              ...baseFilter,
              studentSchedule: studentScheduleFilter,
            },

        relations: {
          enrollCourse: true,
          studentSchedule: {
            invoice: true,
          },
          user: {
            aliases: true,
          },
        },

        order: {
          userId: 'ASC',
        },
      }
    )

    const groupedStudentLessons = studentLessons.sort((a, b) => {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    })
    return groupedStudentLessons
  }

  async getListStudent(lessonId: number, pageParams: ListStudentsWithPage) {
    const lesson = await this.classLessonRepository.findOne({
      where: { id: lessonId },
    })
    if (!lesson) throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND)

    let studentLessons = await this.groupStudentLessonsByUserId(lessonId, pageParams)

    studentLessons = studentLessons
      .filter((student) => !!student.user)
      .map((student) => {
        const aliases = student.user.aliases.find(
          (d) => d.name === student.enrollCourse?.preferredName
        )
        return {
          ...student,
          aliases,
        }
      }) as StudentLessonWithUserMemo[]

    const { content, meta } = paginateArrays(studentLessons, pageParams)

    const userIds = content.map((d) => d.userId)
    const mappedQuota = await this.mapLessonsByUser(lessonId, userIds)
    return {
      content: content.map((d: StudentLessonWithUserMemo) => {
        const lessons = d.userId in mappedQuota ? mappedQuota[d.userId] : []
        return {
          ...d,
          name: d?.aliases?.name || d.user?.fullName,
          email: d.user?.email,
          phone: d?.aliases?.user?.phone || d.user?.phone,
          lessons: lessons.length,
          completedLessons: lessons.filter((d) => d.isDone).length,
          payments: d.studentSchedule?.invoice,
        }
      }),
      meta,
    }
  }

  async mapLessonsByUser(
    classLessonId: number,
    userIds: number[]
  ): Promise<
    Record<
      number,
      ClassLesson &
        {
          isDone: boolean
        }[]
    >
  > {
    // Filter out student lessons where isCheckin = true
    // When a course or class is changed, the original student_lesson is marked with isCheckin = true
    // so it won't be retrieved in the original class-lesson list
    const studentLessons = await this.studentLessonRepository.findByEffectiveClassLessonId(
      [classLessonId],
      {
        where: {
          userId: In(userIds),
          isCheckin: false,
        },
        relations: {
          classLesson: true,
        },
      }
    )
    const classLessons = studentLessons.flatMap((d) => ({
      ...d.classLesson,
      isDone: dayjs(d.changeStartTime || d.startTime).isBefore(new Date()),
      userId: d.userId,
    }))
    return _.groupBy(classLessons, 'userId')
  }

  async handleUpdateTeacherLesson(data) {
    const classLesson = await this.classLessonRepository.findOne({
      where: {
        classId: data.classId,
        periodId: data.periodId,
      },
      order: {
        startTime: 'DESC',
        changeStartTime: 'DESC',
      },
    })

    if (!classLesson) throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND)

    const dataCheckAvaiable = {
      ..._.pick(data, ['unit', 'classId']),
      gap: data.every,
      startTime: classLesson.changeStartTime ? classLesson.changeStartTime : classLesson.startTime,
      endTime: classLesson.changeEndTime ? classLesson.changeEndTime : classLesson.endTime,
    }
    const { newStartTime, newEndTime } = await this.recursiveCalculateDateLesson(dataCheckAvaiable)
    await this.classLessonRepository.update(
      { id: data.id },
      {
        changeStartTime: newStartTime,
        changeEndTime: newEndTime,
      }
    )

    return {
      newStartTime,
      newEndTime,
    }
  }

  async recursiveCalculateDateLesson(data) {
    const newStartTime = dayjs(data.startTime).add(data.gap, data.unit)
    const newEndTime = dayjs(data.endTime).add(data.gap, data.unit)
    const existTeacherLesson = await this.classLessonRepository.findOneBy({
      classId: data.classId,
      startTime: LessThanOrEqual(newStartTime.toDate()),
      endTime: MoreThanOrEqual(newEndTime.toDate()),
    })

    if (!existTeacherLesson) {
      return {
        newStartTime,
        newEndTime,
      }
    }

    return this.recursiveCalculateDateLesson({
      ...data,
      startTime: newStartTime,
      endTime: newEndTime,
    })
  }

  async handleUpdateStuLesson(data) {
    const whereCondition: FindOptionsWhere<StudentLesson> = {
      classId: data.classId,
      // periodId: data.periodId,
    }

    const resultSet = {
      changeStartTime: data.newStartTime,
      changeEndTime: data.newEndTime,
    }

    if (data.changeStartTime) {
      return this.studentLessonRepository.update(
        {
          ...whereCondition,
          changeStartTime: data.changeStartTime,
          changeEndTime: data.changeEndTime,
          changeClassLessonId: data.id,
        },
        resultSet
      )
    }

    return this.studentLessonRepository
      .createQueryBuilder('st')
      .update(StudentLesson)
      .set(resultSet)
      .where(whereCondition)
      .orWhere(
        new Brackets((qb) => {
          qb.where({ changeClassLessonId: data.id }).orWhere({
            classLessonId: data.id,
            changeClassLessonId: null,
          })
        })
      )
      .execute()
  }

  async checkClassLessonNotAuto(
    institutionId: number,
    startTime: Date,
    endTime: Date
  ): Promise<boolean> {
    const classLesson = await this.classLessonRepository
      .createQueryBuilder('cl')
      .where(`cl.institution_id = ${institutionId}`)
      .andWhere(
        new Brackets((qb) => {
          qb.where({
            changeStartTime: IsNull(),
            startTime: LessThanOrEqual(endTime),
            endTime: MoreThanOrEqual(startTime),
          }).orWhere({
            changeStartTime: LessThanOrEqual(endTime),
            changeEndTime: MoreThanOrEqual(startTime),
          })
        })
      )
      .getRawOne()

    if (classLesson) return true
    return false
  }

  async getNextRecurringLesson(payload: CheckNextRecurringLessonDTO) {
    const { startTime, endTime, classId } = payload
    const { newStartTime, newEndTime } = await this.recursiveCalculateDateLesson({
      gap: 1,
      unit: 'weeks',
      startTime,
      endTime,
      classId,
    })
    return {
      newStartTime: dayjs(newStartTime).format('YYYY-MM-DDTHH:mm:ss.SSS'),
      newEndTime: dayjs(newEndTime).format('YYYY-MM-DDTHH:mm:ss.SSS'),
    }
  }

  async getProofTokenOfInvoiceLesson(studentLessonId: number): Promise<LessonInvoiceTokenDTO> {
    const studentLesson = await this.studentLessonRepository.findOne({
      where: {
        id: studentLessonId,
      },
      relations: {
        enrollCourse: {
          invoice: true,
        },
        classLesson: {
          course: true,
          class: true,
        },
      },
    })
    const invoice = await this.invoiceRepository.findOne({
      where: {
        enrollCourses: {
          id: studentLesson.enrollCourseId,
        },
        courseId: studentLesson.courseId,
        userId: studentLesson.userId,
      },
      relations: {
        enrollCourses: true,
      },
      order: { createdAt: 'DESC' },
    })
    if (!invoice) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }

    const enrollmentData = studentLesson.enrollCourse

    const studentData = {
      name: enrollmentData.name,
      email: enrollmentData.email,
      phone: enrollmentData.phone,
    }

    const applicationData = {
      courseName: studentLesson.classLesson.course.name,
      className: studentLesson.classLesson.class.name,
      startTime: studentLesson.startTime,
      endTime: studentLesson.endTime,
    }

    return {
      // invoiceToken: invoice.proofToken,
      invoiceId: invoice.id,
      enrollCourseId: studentLesson.enrollCourseId,
      studentLessonIds: [studentLessonId],
      studentData,
      applicationData,
      applicantId: studentLesson.userId,
    }
  }

  async checkAttendanceChanges(institutionId: number): Promise<boolean> {
    const changedAttendances = await this.studentLessonRepository.count({
      where: {
        institutionId,
        attendance: And(Not(IsNull()), Not('PENDING')),
        createdAt: Not(Raw((alias) => `${alias} = updated_at`)),
      },
    })
    return changedAttendances > 0
  }

  async updateLessonLocationRoom(lessonId: number, payload: UpdateLessonLocationRoomDTO) {
    const classLesson = await this.classLessonRepository.findOne({
      where: { id: lessonId },
    })
    if (!classLesson) throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND)
    await this.classLessonRepository.update(lessonId, {
      locationId: payload.locationId,
    })
    return this.getClassLessonDetail(lessonId)
  }

  async updateLessonInstructor(lessonId: number, payload: UpdateLessonInstructorDTO) {
    const classLesson = await this.classLessonRepository.findOne({
      where: { id: lessonId },
    })
    if (!classLesson) throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND)

    await this.classLessonRepository.update(lessonId, {
      instructorId: payload.instructorId,
    })
    return this.getClassLessonDetail(lessonId)
  }

  async checkConflict(payload: ListClassLessonDto) {
    const data = await this.getList(payload)

    function parseTime(t: string | null): Date | null {
      if (!t) return null
      const d = dayjs(t)
      if (!d.isValid()) {
        throw new Error(`Invalid date string received in checkConflict: "${t}"`)
      }
      return d.toDate()
    }

    // Conflict graph untuk location & instructor
    const classroomGraph: Record<number, Set<number>> = {}
    const teacherGraph: Record<number, Set<number>> = {}
    for (const { id } of data) {
      classroomGraph[id] = classroomGraph[id] ?? new Set()
      teacherGraph[id] = teacherGraph[id] ?? new Set()
    }

    const addEdge = (graph: Record<number, Set<number>>, aId: number, bId: number) => {
      if (!graph[aId]) graph[aId] = new Set()
      if (!graph[bId]) graph[bId] = new Set()
      graph[aId].add(bId)
      graph[bId].add(aId)
    }

    for (let i = 0; i < data.length; i++) {
      const a = data[i]
      const aStart = parseTime(a.changeStartTime) || new Date(a.start)
      const aEnd = parseTime(a.changeEndTime) || new Date(a.end)

      for (let j = i + 1; j < data.length; j++) {
        const b = data[j]
        const bStart = parseTime(b.changeStartTime) || new Date(b.start)
        const bEnd = parseTime(b.changeEndTime) || new Date(b.end)

        const isOverlap = aStart <= bEnd && aEnd >= bStart

        if (isOverlap) {
          if (a.locationId && a.locationId === b.locationId) {
            addEdge(classroomGraph, a.id, b.id)
          }
          if (a.instructorId && a.instructorId === b.instructorId) {
            addEdge(teacherGraph, a.id, b.id)
          }
        }
      }
    }

    const extractConflictGroups = (
      graph: Record<number, Set<number>>,
      allData: ListClassLessonDto[]
    ) => {
      const visited = new Set<number>()
      const result: ListClassLessonDto[] = []

      for (const idStr in graph) {
        const id = Number(idStr)
        if (!visited.has(id)) {
          const queue = [id]
          const group: any[] = []
          const conflictId = randomUUID()

          visited.add(id)

          while (queue.length) {
            const current = queue.shift()!
            const item = allData.find((d: any) => d.id === current)
            if (item) {
              group.push({ ...item, conflictGroupId: conflictId })
            }

            for (const neighbor of graph[current] || []) {
              if (!visited.has(neighbor)) {
                visited.add(neighbor)
                queue.push(neighbor)
              }
            }
          }

          if (group.length > 1) {
            result.push(...group)
          }
        }
      }

      return result
    }

    const classroom = extractConflictGroups(classroomGraph, data)
    const teacher = extractConflictGroups(teacherGraph, data)

    return { classroom, teacher }
  }

  async checkQuotaDeprecated(payload: CheckQuotaDto): Promise<CheckQuotaResponseDto[]> {
    const result: CheckQuotaResponseDto[] = []

    if (payload.classId) {
      const classEntity = await this.classRepository.findOne({
        where: { id: payload.classId },
        relations: ['appointment'],
      })

      if (classEntity?.type === ClassTypeEnum.APPOINTMENT) {
        const classQuota = classEntity.quota || 0

        const timeBeforeLesson = classEntity.appointment?.bufferBeforeMinutes || 0
        const timeAfterLesson = classEntity.appointment?.bufferAfterMinutes || 0

        for (const [index, timeslot] of payload.timeslots.entries()) {
          const [startTime, endTime] = timeslot.split(' ')
          const startDate = dayjs(startTime).toDate()
          const endDate = dayjs(endTime).toDate()

          const studentLessonsCount =
            await this.studentLessonRepository.getStudentLessonsCountOfLesson(
              classEntity.id,
              startDate,
              endDate
            )

          const conflictStartDate = dayjs(startDate).subtract(timeBeforeLesson, 'minute').toDate()
          const conflictEndDate = dayjs(endDate).add(timeAfterLesson, 'minute').toDate()

          let conflict = []

          const listToBeChecked = {
            institutionId: classEntity.institutionId,
            ...(classEntity.locationId ? { locationIds: [classEntity.locationId] } : {}),
            ...(classEntity.instructorId ? { teacherIds: [classEntity.instructorId] } : {}),
            startDate: conflictStartDate,
            endDate: conflictEndDate,
          } as ListClassLessonDto

          if (!classEntity.locationId && !classEntity.instructorId) {
            listToBeChecked.classIds = [classEntity.id]
          }

          conflict = await this.getList(listToBeChecked)

          result.push({
            lessonId: payload.lessonIds[index],
            remainingQuota: Math.max(0, classQuota - studentLessonsCount),
            quota: classQuota,
            conflict: conflict.filter((o) => o.classId !== classEntity.id),
          })
        }
        return result
      }
    }

    const recurringSchedules = await this.recurringScheduleRepository.find({
      where: { id: In(payload.lessonIds) },
      relations: { classEntity: true },
    })

    if (recurringSchedules.length !== payload.lessonIds.length) {
      throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND)
    }

    for (const schedule of recurringSchedules.filter((s) => s.classEntity)) {
      const classEntity = schedule.classEntity
      const classQuota = classEntity.quota || 0
      const date = dayjs(payload.date).format('YYYY-MM-DD')
      const startDate = dayjs(`${date} ${schedule.startTime}`).toDate()
      const endDate = dayjs(`${date} ${schedule.endTime}`).toDate()

      const studentLessonsCount = await this.studentLessonRepository.getStudentLessonsCountOfLesson(
        classEntity.id,
        startDate,
        endDate
      )

      const listToBeChecked = {
        institutionId: classEntity.institutionId,
        ...(classEntity.locationId ? { locationIds: [classEntity.locationId] } : {}),
        ...(classEntity.instructorId ? { teacherIds: [classEntity.instructorId] } : {}),
        startDate,
        endDate,
      } as ListClassLessonDto

      if (!classEntity.locationId && !classEntity.instructorId) {
        listToBeChecked.classIds = [classEntity.id]
      }

      const conflict = await this.getList(listToBeChecked)

      result.push({
        lessonId: schedule.id,
        remainingQuota: Math.max(0, classQuota - studentLessonsCount),
        quota: classQuota,
        conflict: conflict.filter((o) => o.classId !== classEntity.id),
      })
    }
    return result
  }

  async checkQuota(payload: CheckQuotaDto): Promise<CheckQuotaResponseDto[]> {
    const result: CheckQuotaResponseDto[] = []

    if (payload.classId) {
      const classEntity = await this.classRepository.findOne({
        where: { id: payload.classId },
        relations: ['appointment', 'locationRoom'],
      })

      if (classEntity?.type === ClassTypeEnum.APPOINTMENT) {
        const classQuota = classEntity.quota || 0
        const timeBeforeLesson = classEntity.appointment?.bufferBeforeMinutes || 0
        const timeAfterLesson = classEntity.appointment?.bufferAfterMinutes || 0

        for (const [index, timeslot] of payload.timeslots.entries()) {
          const [startTime, endTime] = timeslot.split(' ')
          const startDate = dayjs(startTime).toDate()
          const endDate = dayjs(endTime).toDate()

          const studentLessonsCount =
            await this.studentLessonRepository.getStudentLessonsCountOfLesson(
              classEntity.id,
              startDate,
              endDate
            )

          const conflictStartDate = dayjs(startDate).subtract(timeBeforeLesson, 'minute').toDate()
          const conflictEndDate = dayjs(endDate).add(timeAfterLesson, 'minute').toDate()

          let conflict = []
          const listToBeChecked = {
            institutionId: classEntity.institutionId,
            ...(classEntity.locationId ? { locationIds: [classEntity.locationId] } : {}),
            ...(classEntity.instructorId ? { teacherIds: [classEntity.instructorId] } : {}),
            startDate: conflictStartDate,
            endDate: conflictEndDate,
          } as ListClassLessonDto

          if (!classEntity.locationId && !classEntity.instructorId) {
            listToBeChecked.classIds = [classEntity.id]
          }

          conflict = await this.getList(listToBeChecked)

          let locationUsage = 0
          let locationCapacity = Infinity

          if (classEntity.locationId && classEntity.locationRoom) {
            locationCapacity = classEntity.locationRoom.capacity
            locationUsage = await this.locationRoomService.getLocationRoomUsageInRange(
              classEntity.locationId,
              startDate,
              endDate
            )
          }

          const remainingClassQuota = Math.max(0, classQuota - studentLessonsCount)
          const remainingLocationQuota = Math.max(0, locationCapacity - locationUsage)
          const effectiveRemainingQuota = Math.min(remainingClassQuota, remainingLocationQuota)

          result.push({
            lessonId: payload.lessonIds[index],
            remainingQuota: effectiveRemainingQuota,
            quota: classQuota,
            conflict: conflict.filter((o) => o.classId !== classEntity.id),
          })
        }
        return result
      }
    }

    const recurringSchedules = await this.recurringScheduleRepository.find({
      where: { id: In(payload.lessonIds) },
      relations: { classEntity: true },
    })

    if (recurringSchedules.length !== payload.lessonIds.length) {
      throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND)
    }

    for (const [index, schedule] of recurringSchedules.entries()) {
      if (!schedule.classEntity) continue

      const classEntity = schedule.classEntity
      const classQuota = classEntity.quota || 0
      const date = dayjs(payload.date).format('YYYY-MM-DD')
      const startDate = dayjs(`${date} ${schedule.startTime}`).toDate()
      const endDate = dayjs(`${date} ${schedule.endTime}`).toDate()

      const studentLessonsCount = await this.studentLessonRepository.getStudentLessonsCountOfLesson(
        classEntity.id,
        startDate,
        endDate
      )

      const listToBeChecked = {
        institutionId: classEntity.institutionId,
        ...(classEntity.locationId ? { locationIds: [classEntity.locationId] } : {}),
        ...(classEntity.instructorId ? { teacherIds: [classEntity.instructorId] } : {}),
        startDate,
        endDate,
      } as ListClassLessonDto

      if (!classEntity.locationId && !classEntity.instructorId) {
        listToBeChecked.classIds = [classEntity.id]
      }

      const conflict = await this.getList(listToBeChecked)

      let locationUsage = 0
      let locationCapacity = Infinity

      if (classEntity.locationId && classEntity.locationRoom) {
        locationCapacity = classEntity.locationRoom.capacity
        locationUsage = await this.locationRoomService.getLocationRoomUsageInRange(
          classEntity.locationId,
          startDate,
          endDate
        )
      }

      const remainingClassQuota = Math.max(0, classQuota - studentLessonsCount)
      const remainingLocationQuota = Math.max(0, locationCapacity - locationUsage)
      const effectiveRemainingQuota = Math.min(remainingClassQuota, remainingLocationQuota)

      result.push({
        lessonId: payload.lessonIds[index],
        remainingQuota: effectiveRemainingQuota,
        quota: classQuota,
        conflict: conflict.filter((o) => o.classId !== classEntity.id),
      })
    }

    return result
  }

  async classQuotaByTimeSlot(classEntity: ClassEntity) {
    const now = dayjs().toDate()
    const studentLessons = await this.studentLessonRepository.find({
      where: [
        { classId: classEntity.id, classLesson: { startTime: MoreThan(now) } },
        { classId: classEntity.id, classLesson: { changeStartTime: MoreThan(now) } },
      ],
      relations: {
        classLesson: true,
      },
    })
    const groupedByTime = studentLessons.reduce((acc, studentLesson) => {
      const timeKey = studentLesson.changeStartTime
        ? [
            studentLesson.changeStartTime.toISOString(),
            studentLesson.changeEndTime.toISOString(),
          ].join(' ')
        : [studentLesson.startTime.toISOString(), studentLesson.endTime.toISOString()].join(' ')

      if (!acc[timeKey]) {
        acc[timeKey] = {
          studentIds: [studentLesson.userId],
          quota: classEntity.quota ?? 0,
          quotaUsage: 1,
        }
      }
      const isUserIdExist = acc[timeKey].studentIds.includes(studentLesson.userId)
      if (!isUserIdExist) {
        acc[timeKey].studentIds.push(studentLesson.userId)
        acc[timeKey].quotaUsage += 1
      }
      return acc
    }, {} as Record<string, QuotaTimeSlots>)
    return {
      timeSlotQuota: groupedByTime,
    }
  }

  async classQuotaByTimeSlotStudent(classEntity: ClassEntity) {
    const now = dayjs().toDate()
    const studentLessons = await this.studentLessonRepository.find({
      where: [
        { classId: classEntity.id, classLesson: { startTime: MoreThan(now) } },
        { classId: classEntity.id, classLesson: { changeStartTime: MoreThan(now) } },
      ],
      relations: {
        classLesson: true,
      },
    })
    const groupedByTime = studentLessons.reduce((acc, studentLesson) => {
      const timeKey = studentLesson.changeStartTime
        ? [
            studentLesson.changeStartTime.toISOString(),
            studentLesson.changeEndTime.toISOString(),
          ].join(' ')
        : [studentLesson.startTime.toISOString(), studentLesson.endTime.toISOString()].join(' ')

      if (!acc[timeKey]) {
        acc[timeKey] = {
          studentIds: [studentLesson.userId],
          quota: classEntity.quota ?? 0,
          quotaUsage: 1,
        }
      }
      const isUserIdExist = acc[timeKey].studentIds.includes(studentLesson.userId)
      if (!isUserIdExist) {
        acc[timeKey].studentIds.push(studentLesson.userId)
        acc[timeKey].quotaUsage += 1
      }
      return acc
    }, {} as Record<string, QuotaTimeSlots>)
    return {
      timeSlotQuota: groupedByTime,
    }
  }

  async bulkUpdateSharedVideo(
    classLessonIds: number[],
    hasSharedVideo: SharedVideoStatus,
    studentLessonIds?: number[]
  ): Promise<void> {
    if (studentLessonIds?.length) {
      await this.studentLessonRepository.update(
        { id: In(studentLessonIds) },
        { hasSharedVideo }
      )
      return
    }
    if (!classLessonIds.length) return
    await this.studentLessonRepository.update(
      { classLessonId: In(classLessonIds) },
      { hasSharedVideo }
    )
  }
}
