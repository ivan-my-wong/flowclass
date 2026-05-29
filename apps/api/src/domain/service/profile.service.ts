import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { plainToInstance } from 'class-transformer'
import * as dayjs from 'dayjs'
import { parsePhoneNumber } from 'libphonenumber-js'
import * as _ from 'lodash'
import { Between, In, LessThan, MoreThan, Not, Raw } from 'typeorm'

import { SendPaymentProofReminderDTO } from '@/application/admin/payment-evidence/dto/confirm-state-payment-evidence.dto'
import { StudentNotificationSettings } from '@/application/admin/student-onboard/dtos/student-memo.dto'
import {
  FilterPaymentRecordDTO,
  RequestTimeChangeDTO,
  StudentCheckProfileDTO,
  StudentResendPaymentRecordDTO,
  StudentResponseCheckProfileDTO,
  StudentResponsePaymentRecordsDTO,
  StudentResponseUpcomingLessonDTO,
  StudentSendQuestionDTO,
} from '@/application/student/profile/dto/profile.dto'
import { StudentChangeAliasPasswordDto } from '@/application/student/profile/dto/student-change-alias-password.dto'
import { StudentLoginWithAliasPasswordDto } from '@/application/student/profile/dto/student-login-with-alias-password.dto'
import {
  MAX_TIME_REQUEST_TIME_CHANGE,
  MAX_TIME_SEND_QUESTION,
} from '@/common/constants/profile.constants'
import { ObjectStorageProvider } from '@/config/storage/object-storage.provider'
import { ClassMediaMaterialsRepository } from '@/models/class-media-materials.repository'
import { ClassRepository } from '@/models/classes.repository'
import { CoursesRepository } from '@/models/courses.repository'
import { EnrollClassMappingRepository } from '@/models/enroll-courses.repository'
import { ClassTypeEnum, PaymentMethod, StudentPrimaryIdentifier } from '@/models/enums'
import { RequestTimeChangeStatus } from '@/models/enums/status'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { InvoiceRepository } from '@/models/invoice.repository'
import { LessonQuestionRepository } from '@/models/lesson-question.repository'
import { NotificationType } from '@/models/notification-record.entity'
import { PaymentEvidenceRepository } from '@/models/payment-evidence.repository'
import { RequestTimeChangeRepository } from '@/models/request-time-change.repository'
import { SettingWebpageInstitutionRepository } from '@/models/setting-webpage-institutions.repository'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { TeacherFeedbackRepository } from '@/models/teacher-feedback.repository'
import { TransactionRepository } from '@/models/transaction.repository'
import { User } from '@/models/user.entity'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { UserRolesRepository } from '@/models/user-roles.repository'
import { UsersRepository } from '@/models/users.repository'
import { transformEmail, transformPhone } from '@/utils/string.utils'

import { EmailService } from '../external/email.service'

import { AuthService } from './auth.service'
import { PaymentEvidenceService } from './payment-evidence.service'
import { RescheduleApprovalService } from './reschedule-approval.service'
import { StudentNotifSettingService } from './student-notif-setting.service'
import { UsersService } from './users.service'

@Injectable()
export class ProfileService {
  constructor(
    private usersRepository: UsersRepository,
    private usersAliasRepository: UserAliasesRepository,
    private usersService: UsersService,
    private authService: AuthService,
    private paymentEvidenceService: PaymentEvidenceService,
    private rescheduleApprovalService: RescheduleApprovalService,
    private readonly objectStorageProvider: ObjectStorageProvider,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly mediaMaterialsRepository: ClassMediaMaterialsRepository,
    private readonly teacherFeedbackRepository: TeacherFeedbackRepository,
    private readonly enrollClassRepository: EnrollClassMappingRepository,
    private readonly courseRepository: CoursesRepository,
    private readonly classRepository: ClassRepository,
    private readonly studentLessonRepository: StudentLessonRepository,
    private readonly settingWebpageInstitutionRepository: SettingWebpageInstitutionRepository,
    private readonly paymentEvidenceRepository: PaymentEvidenceRepository,
    private readonly transactionRepository: TransactionRepository,
    private readonly emailService: EmailService,
    private readonly lessonQuestionRepository: LessonQuestionRepository,
    private readonly requestTimeChangeRepository: RequestTimeChangeRepository,
    private readonly studentNotifSettingService: StudentNotifSettingService,
    private readonly institutionRepository: InstitutionsRepository,
    private readonly userRolesRepository: UserRolesRepository
  ) {}

  async getSettings(institutionId: number) {
    const settings = await this.settingWebpageInstitutionRepository.findOneBy({
      institutionId,
    })

    const rescheduleSettings = await this.rescheduleApprovalService.getSettings(institutionId)

    if (!settings?.id) return { studentLogin: false, rescheduleSettings }

    return { id: settings.id, studentLogin: settings.studentLogin, rescheduleSettings }
  }

  async checkProfile(payload: StudentCheckProfileDTO) {
    const { institutionId, firstName, email, phone, activeUserAliasId } = payload
    let user: (User & { userAliasId?: number }) | null = null
    const institution = await this.institutionRepository.findOneBy({ id: institutionId })
    if (!institution) {
      throw new BadRequestException('Institution not found')
    }

    if (institution?.studentPrimaryIdentifier === StudentPrimaryIdentifier.PHONE) {
      if (!phone) {
        throw new BadRequestException(
          'The student primary identifier is phone, but phone is not provided'
        )
      }
      user = await this.findStudentByPhoneAndName(institutionId, phone, firstName, email)
    } else {
      if (!email) {
        throw new BadRequestException(
          'The student primary identifier is email, but email is not provided'
        )
      }
      user = await this.findStudentByPhoneAndEmail(institutionId, phone, email)
    }

    if (!user) return {}

    const accessToken = await this.authService.createToken(
      user,
      undefined,
      activeUserAliasId ?? user.userAliasId
    )
    const refreshToken = await this.authService.createRefreshToken(
      user,
      activeUserAliasId ?? user.userAliasId
    )

    await this.usersService.saveLastLogin(user)

    // If you change any part below this, please remember to update the loginByAliasPassword method
    const userAlias = await this.usersAliasRepository.findOne({
      where: {
        ...(user.userAliasId ? { id: user.userAliasId } : { userId: user.id }),
        institutionId,
      },
    })

    let listChildren = []

    if (userAlias?.isStudentParent) {
      listChildren = await this.usersAliasRepository.find({
        where: {
          childOfUserAliasId: userAlias.id,
          institutionId,
        },
        relations: ['user'],
      })
    } else {
      listChildren = await this.getOtherUserAliasWithSamePhoneNumber(
        institutionId,
        userAlias.id,
        user.phone
      )
    }

    listChildren = listChildren.map((child) => ({
      id: child.user.id,
      firstName: child.name,
      lastName: child.user.lastName,
      email: child.email,
      phone: child.user.phone,
      userAliasId: child.id,
    }))

    return plainToInstance(StudentResponseCheckProfileDTO, {
      id: user.id,
      firstName: userAlias?.name ?? user.firstName,
      lastName: user.lastName,
      email: userAlias?.email ?? user.email,
      phone: user.phone,
      userAliasId: userAlias?.id,
      isStudentParent: !userAlias.childOfUserAliasId,
      listChildren,
      accessToken,
      refreshToken,
      activeUserAliasId: activeUserAliasId ?? user.userAliasId,
    })
  }

  private async findStudentByPhoneAndName(
    institutionId: number,
    phone: string,
    firstName: string,
    email?: string
  ): Promise<(User & { userAliasId?: number }) | null> {
    const userAlias = await this.usersAliasRepository.findOne({
      where: {
        institutionId,
        name: Raw((alias) => `LOWER(${alias}) = LOWER(:firstName)`, { firstName }),
        user: { phone: transformPhone(phone) },
      },
      relations: { user: true },
    })

    if (userAlias) {
      return Object.assign(userAlias.user, { userAliasId: userAlias.id })
    }

    let user = await this.usersRepository.findOne({
      where: {
        firstName: Raw((alias) => `LOWER(${alias}) = LOWER(:firstName)`, { firstName }),
        phone: transformPhone(phone),
      },
    })

    if (user) {
      const userRole = await this.userRolesRepository.findOne({
        where: {
          userId: user.id,
          institutionId,
          isStudent: true,
        },
      })

      if (userRole) {
        return user
      }
    }

    if (email) {
      user = await this.usersRepository.findOne({
        where: {
          firstName: Raw((alias) => `LOWER(${alias}) = LOWER(:firstName)`, { firstName }),
          email: transformEmail(email),
        },
      })

      if (user) {
        const userRole = await this.userRolesRepository.findOne({
          where: {
            userId: user.id,
            institutionId,
            isStudent: true,
          },
        })

        if (userRole) {
          return user
        }
      }
    }

    return null
  }

  private async findStudentByPhoneAndEmail(
    institutionId: number,
    phone: string,
    email: string
  ): Promise<User | null> {
    const userAlias = await this.usersAliasRepository.findOne({
      where: {
        institutionId,
        email: transformEmail(email),
        user: { phone: transformPhone(phone) },
      },
      relations: { user: true },
    })

    if (userAlias?.user) {
      return userAlias.user
    }

    const user = await this.usersRepository.findOne({
      where: {
        phone: transformPhone(phone),
        email: transformEmail(email),
      },
    })

    if (user) {
      return user
    }

    return null
  }

  private async findStudentByEmailAndName(
    institutionId: number,
    email: string,
    firstName: string,
    phone: string
  ): Promise<(User & { userAliasId?: number }) | null> {
    let userAlias = await this.usersAliasRepository.findOne({
      where: {
        institutionId,
        name: Raw((alias) => `LOWER(${alias}) = LOWER(:firstName)`, { firstName }),
        email: transformEmail(email),
      },
      relations: { user: true },
    })

    if (userAlias?.user) {
      return Object.assign(userAlias.user, { userAliasId: userAlias.id })
    }

    userAlias = await this.usersAliasRepository.findOne({
      where: {
        institutionId,
        name: Raw((alias) => `LOWER(${alias}) = LOWER(:firstName)`, { firstName }),
        user: {
          email: transformEmail(email),
        },
      },
      relations: { user: true },
    })

    if (userAlias?.user) {
      return Object.assign(userAlias.user, { userAliasId: userAlias.id })
    }

    const user = await this.usersRepository.findOne({
      where: {
        firstName: Raw((alias) => `LOWER(${alias}) = LOWER(:firstName)`, { firstName }),
        email: transformEmail(email),
        phone: transformPhone(phone),
      },
    })

    if (user) {
      const userRole = await this.userRolesRepository.findOne({
        where: {
          userId: user.id,
          institutionId,
          isStudent: true,
        },
      })

      if (userRole) {
        return user
      }
    }

    return null
  }

  async getNotification(user: User, institutionId: number) {
    return this.studentNotifSettingService.getOrCreateNotification(user, institutionId)
  }

  async updateNotification(
    user: User,
    institutionId: number,
    payload: StudentNotificationSettings[]
  ) {
    return await this.studentNotifSettingService.updateNotificationSettings(
      user,
      institutionId,
      payload
    )
  }

  async getPaymentRecords(user: User, filter: FilterPaymentRecordDTO) {
    const { institutionId, paymentState, paymentMethod, courseId, endDate, startDate, childrenId } =
      filter

    const userAlias = await this.usersAliasRepository.findOne({
      where: { ...(user.activeUserAliasId ? { id: user.activeUserAliasId } : { userId: user.id }) },
    })

    if (!userAlias) {
      return []
    }

    const aliasIds: number[] = [childrenId ? childrenId : userAlias.id]
    if (userAlias.isStudentParent && !childrenId) {
      const childrenAlias = await this.usersAliasRepository.find({
        where: { childOfUserAliasId: userAlias.id },
      })
      aliasIds.push(...childrenAlias.map((child) => child.id))
    }

    const invoice = await this.invoiceRepository.find({
      where: {
        institutionId,
        ...(paymentState && paymentState.length > 0 ? { paymentState: In(paymentState) } : {}),
        ...(paymentMethod ? { paymentMethod } : {}),
        ...(courseId ? { courseId } : {}),
        ...(startDate && endDate
          ? { updatedAt: Between(new Date(startDate), new Date(endDate)) }
          : {}),
        userAliasId: In(aliasIds),
      },
      relations: {
        enrollCourses: true,
        userAlias: true,
        studentSchedules: {
          studentLessons: {
            class: {
              instructor: true,
              locationRoom: true,
            },
          },
        },
        invoicePromotionsUsed: true,
      },
      order: { createdAt: 'DESC' },
    })

    if (!invoice) return []

    const enrollIds = invoice.flatMap((i) => i.enrollCourses.flatMap((c) => c.id))
    const courseIds = invoice.flatMap((i) => i.enrollCourses.flatMap((c) => c.courseId))
    const invoiceIds = invoice.map((i) => i.id)

    const [enrollClasses, courses, paymentEvidences, transactions] = await Promise.all([
      this.enrollClassRepository.find({
        where: { enrollCourseId: In(enrollIds) },
      }),
      this.courseRepository.find({
        where: { id: In(courseIds) },
        withDeleted: true,
      }),
      this.paymentEvidenceRepository.find({
        where: { enrollCourseId: In(enrollIds) },
        withDeleted: true,
      }),
      this.transactionRepository.find({
        where: { invoiceId: In(invoiceIds) },
        withDeleted: true,
      }),
    ])

    if (!enrollClasses) return []

    const enrollClassIds = enrollClasses.map((c) => c.classId)
    const classes = await this.classRepository.find({
      where: { id: In(enrollClassIds) },
      withDeleted: true,
    })

    const paymentProofs = await Promise.all(
      paymentEvidences.map(async (o) => {
        if (o.image) {
          o.image = await this.objectStorageProvider.getObjectAccessUrl(o.image)
        }
        return { enrollId: o.enrollCourseId, image: o.image }
      })
    )

    // return invoice with course and classes
    return invoice.map((i) => {
      const classesList: { id: number; name: string }[] = []
      enrollClasses
        .filter((c) => i.enrollCourses.map((d) => d.id).includes(c.enrollCourseId))
        .forEach((c) => {
          const classData = classes.find((cl) => cl.id === c.classId)
          if (classData) classesList.push({ id: classData.id, name: classData.name })
        })

      const course: { id: number; name: string; path: string } = {
        id: i.courseId,
        name: '',
        path: '',
      }
      const courseData = courses.find((cl) => cl.id === i.courseId)
      if (courseData) {
        course.name = courseData.name
        course.path = courseData.path
      }

      const paymentProof =
        paymentProofs.find((j) => i.enrollCourses.some((ec) => ec.id === j.enrollId))?.image || ''

      let paymentDate = undefined
      if (
        (i.paymentMethod === PaymentMethod.PAY_LATER && i.approverId) ||
        i.paymentMethod === PaymentMethod.PAY_NOW
      ) {
        paymentDate = i.updatedAt
      }

      const transaction = transactions.find((t) => t.invoiceId === i.id)

      return plainToInstance(StudentResponsePaymentRecordsDTO, {
        id: i.id,
        classes: classesList,
        course,
        createdAt: i.createdAt,
        paymentMethod: i.paymentMethod,
        payAmount: i.payAmount,
        proofToken: i.proofToken,
        paymentLinkId: i.paymentLinkId,
        currency: i.currency,
        paymentProof,
        paymentState: i.paymentState,
        lessons: i.studentSchedules.flatMap((schedule) => {
          return schedule.studentLessons.map((lesson) => ({
            ...lesson,
            class: {
              id: lesson?.class?.id,
              name: lesson?.class?.name,
              instructorName: lesson?.class?.instructor?.firstName,
              locationRoomName: lesson?.class?.locationRoom?.name,
            },
          }))
        }),
        promotion:
          i.invoicePromotionsUsed?.find((p) => p.promotionType === 'COUPON_DISCOUNT') ?? null,
        paymentDate,
        user: {
          email: i.userAlias?.email,
          phone: user.phone,
          name: i.userAlias?.name,
          id: i.userAlias?.id,
        },
        institutionId: i.institutionId,
        siteId: i.siteId,
        transaction: {
          id: transaction?.id,
          status: transaction?.status,
        },
        enrollId: i.enrollCourses.at(0)?.id,
      })
    })
  }

  async getUpcomingLessons(user: User, filter: FilterPaymentRecordDTO, isPastLesson?: boolean) {
    const { institutionId, paymentState, attendanceStatus, courseId, endDate, startDate } = filter

    const lessons = await this.studentLessonRepository.find({
      where: {
        userId: user.id,
        institutionId,
        ...(courseId ? { courseId } : {}),
        ...(attendanceStatus ? { attendance: attendanceStatus } : {}),
        ...(startDate && endDate
          ? { startTime: Between(new Date(startDate), new Date(endDate)) }
          : { endTime: isPastLesson ? LessThan(new Date()) : MoreThan(new Date()) }),
      },
      relations: {
        studentSchedule: true,
        studentSubmissions: {
          mediaMaterials: true,
        },
      },
      order: { startTime: 'DESC' },
    })

    if (!lessons) return []

    const classIds = lessons.map((l) => l.classId)
    const courseIds = lessons.map((l) => l.courseId)
    const enrollIds = lessons.map((l) => l.enrollCourseId)
    const classLessonIds = lessons.map((l) => l.classLessonId)

    const [classes, courses, invoices, mediaMaterials] = await Promise.all([
      this.classRepository.find({
        where: { id: In(classIds) },
        withDeleted: true,
        relations: ['instructor', 'locationRoom'],
      }),
      this.courseRepository.find({ where: { id: In(courseIds) }, withDeleted: true }),
      this.invoiceRepository.find({
        where: {
          enrollCourses: {
            id: In(enrollIds),
          },
          ...(paymentState && paymentState.length > 0 ? { paymentState: In(paymentState) } : {}),
        },
        relations: {
          enrollCourses: true,
        },
        withDeleted: true,
      }),
      this.mediaMaterialsRepository.find({
        where: { classMaterial: { classLessonId: In(classLessonIds) } },
        relations: { classMaterial: true },
        withDeleted: true,
      }),
    ])

    const lessonsData = lessons
      .filter((l) => {
        const invoice = invoices.find((i) =>
          i.enrollCourses.some((ec) => ec.id === l.enrollCourseId)
        )
        if (user.activeUserAliasId) {
          return invoice && invoice.userAliasId === user.activeUserAliasId
        }
        return !!invoice
      })
      .map((l) => {
        const course = courses.find((c) => c.id === l.courseId)
        const classData = classes.find((c) => c.id === l.classId)
        const invoice = invoices.find((i) =>
          i.enrollCourses.some((ec) => ec.id === l.enrollCourseId)
        )
        const materials = mediaMaterials.filter(
          (m) => m.classMaterial.classLessonId === l.classLessonId
        )
        const studentSubmissions = l.studentSubmissions.flatMap((s) => s.mediaMaterials)
        return plainToInstance(StudentResponseUpcomingLessonDTO, {
          id: l.id,
          courseId: l.courseId,
          course: {
            id: course.id,
            name: course.name,
            previewImageUrl: course.previewImageUrl,
            path: course.path,
          },
          class: {
            id: classData.id,
            name: classData.name,
            instructorName: classData?.instructor?.firstName,
            locationRoomName: classData?.locationRoom?.name,
          },
          startTime: l.startTime,
          endTime: l.endTime,
          originalStartTime: l.changeStartTime,
          originalEndTime: l.changeEndTime,
          hasTimeChange: !!l.changeStartTime,
          invoice: {
            id: invoice.id,
            payAmount: invoice.payAmount,
            paymentState: invoice.paymentState,
            enrollId: invoice.enrollCourses.at(0)?.id,
            proofToken: invoice.proofToken,
          },
          isDone: dayjs(l.startTime).isBefore(new Date()),
          institutionId,
          siteId: invoice.siteId,
          user: {
            email: user.email,
            phone: user.phone,
            name: user.fullName,
            id: user.id,
          },
          periodId: l.studentSchedule?.periodId,
          attendanceStatus: l.attendance,
          materials,
          studentSubmissions,
        })
      })

    return _.groupBy(lessonsData, 'courseId')
  }

  async getDetailStudentLessons(user: User, studentLessonId: number) {
    const lesson = await this.studentLessonRepository.findOne({
      where: {
        id: studentLessonId,
        userId: user.id,
      },
      relations: {
        class: true,
        course: true,
        studentSchedule: true,
        classLesson: true,
        studentSubmissions: {
          mediaMaterials: true,
        },
        enrollCourse: true,
      },
      withDeleted: true,
    })

    if (!lesson) return null
    const invoice = await this.invoiceRepository.findOne({
      where: {
        // paymentState: PaymentStatus.PAID,
        userAliasId: user.activeUserAliasId,
        enrollCourses: {
          id: lesson.enrollCourseId,
        },
      },
      relations: {
        enrollCourses: true,
      },
      withDeleted: true,
    })
    const materials = await this.mediaMaterialsRepository.find({
      where: { classMaterial: { classLessonId: lesson.classLessonId } },
      relations: { classMaterial: true },
      withDeleted: true,
    })
    const teacherFeedbacks = await this.teacherFeedbackRepository.find({
      where: { studentLessonId: lesson.id, classLessonId: lesson.classLessonId },
      relations: { mediaMaterials: true },
      withDeleted: true,
    })
    const teacherResponses = teacherFeedbacks.flatMap((feedback) => feedback.mediaMaterials)
    const course = lesson.course
    const classData = lesson.class
    const firstEnrollCourse = invoice?.enrollCourses?.at(0)
    return plainToInstance(StudentResponseUpcomingLessonDTO, {
      id: lesson.id,
      courseId: lesson.courseId,
      course: {
        id: course.id,
        name: course.name,
        previewImageUrl: course.previewImageUrl,
        path: course.path,
      },
      class: {
        id: classData.id,
        name: classData.name,
        instructorName: classData?.instructor?.firstName,
        locationRoomName: classData?.locationRoom?.name,
      },
      startTime: lesson.changeStartTime ?? lesson.startTime,
      endTime: lesson.changeEndTime ?? lesson.endTime,
      originalStartTime: lesson.startTime,
      originalEndTime: lesson.endTime,
      hasTimeChange: !!(lesson.changeStartTime || lesson.changeEndTime),
      invoice: {
        id: invoice?.id,
        payAmount: invoice?.payAmount,
        paymentState: invoice?.paymentState,
        enrollId: firstEnrollCourse?.id,
        proofToken: invoice?.proofToken,
      },
      isDone: dayjs(lesson.changeStartTime || lesson.startTime).isBefore(new Date()),
      siteId: lesson.enrollCourse.siteId,
      user: {
        email: user.email,
        phone: user.phone,
        name: user.fullName,
        id: user.id,
      },
      periodId: lesson.studentSchedule?.periodId,
      attendanceStatus: lesson.attendance,
      materials,
      teacherResponses,
      studentSubmissions: lesson.studentSubmissions.flatMap((s) => s.mediaMaterials),
    })
  }

  async resendPaymentRecord(data: StudentResendPaymentRecordDTO) {
    const payload = { ...data } as SendPaymentProofReminderDTO

    const successfulResults = []
    const failedResults = []

    try {
      await this.paymentEvidenceService.sendMailPaymentReminder(payload)
      successfulResults.push('Mail sent')
    } catch (error) {
      failedResults.push(error)
    }

    try {
      await this.paymentEvidenceService.sendWaPaymentReminder(payload)
      successfulResults.push('WA sent')
    } catch (error) {
      failedResults.push(error)
    }

    return { success: successfulResults, failed: failedResults }
  }

  async sendQuestion(payload: StudentSendQuestionDTO) {
    const { institutionId, question, lessonId } = payload
    const lessons = await this.studentLessonRepository.findOneById(lessonId, {
      relations: { user: true, course: true, class: true },
    })

    if (!lessons) throw new BadRequestException('Lesson not found')

    const lastQuestion = await this.lessonQuestionRepository.findOne({
      where: { studentLessonId: lessonId, institutionId },
      order: { createdAt: 'DESC' },
    })

    if (
      lastQuestion &&
      dayjs().diff(dayjs(lastQuestion.createdAt), 'minute') < MAX_TIME_SEND_QUESTION
    ) {
      throw new BadRequestException(
        `You can only ask a question every ${MAX_TIME_SEND_QUESTION} minutes on the same lesson`
      )
    }

    const lessonQuestion = await this.lessonQuestionRepository.save(
      this.lessonQuestionRepository.create({
        studentLessonId: lessonId,
        question,
        institutionId,
      })
    )

    const emailSubject = `Question from ${lessons.user.fullName}`
    const msg = await this.emailService.sendQuestionEmail({
      emailSubject,
      question,
      studentEmail: lessons.user.email,
      studentName: lessons.user.fullName,
      courseName: lessons.course?.name ?? 'Course',
      className: lessons.class?.name ?? 'Class',
      studentPhone: parsePhoneNumber(`+${lessons.user.phone}`)?.formatInternational() ?? '',
      institutionId,
    })

    await this.emailService.saveEmailResponse(
      msg,
      lessons.userId,
      lessons.user.email,
      emailSubject,
      NotificationType.STUDENT_QUESTION,
      institutionId,
      lessons?.course?.siteId
    )

    return lessonQuestion
  }

  async requestTimeChange(user: User, payload: RequestTimeChangeDTO) {
    const { institutionId, lessonId, reason, requestEndTime, requestStartTime, classId } = payload

    const requestTimeChange = await this.requestTimeChangeRepository.findOne({
      where: { studentLessonId: lessonId, institutionId },
      order: { createdAt: 'DESC' },
    })

    if (
      requestTimeChange &&
      dayjs().diff(dayjs(requestTimeChange.createdAt), 'minute') < MAX_TIME_REQUEST_TIME_CHANGE
    ) {
      throw new BadRequestException(
        `You can only request a time change every ${MAX_TIME_REQUEST_TIME_CHANGE} minutes on the same lesson`
      )
    }

    const studentLesson = await this.studentLessonRepository.findOneById(lessonId, {
      relations: { classLesson: true },
    })

    const classLesson = studentLesson.classLesson
    const startDate = dayjs(requestStartTime).toISOString().split('T')[0]
    const startTime = classLesson.startTime.toISOString().split('T')[1]

    const currentDiff = dayjs(classLesson.endTime).diff(dayjs(classLesson.startTime), 'days')
    const endDate = dayjs(startDate).add(currentDiff, 'days').format('YYYY-MM-DD')

    const endTime = classLesson.endTime.toISOString().split('T')[1]

    const newRequest = this.requestTimeChangeRepository.create({
      institutionId,
      reason,
      requestStartTime: new Date(`${startDate}T${startTime}`),
      requestEndTime: new Date(`${endDate}T${endTime}`),
      status: RequestTimeChangeStatus.PENDING,
      userId: user.id,
      studentLessonId: lessonId,
    })

    if (classId) {
      const classData = await this.classRepository.findOneBy({ id: classId })
      if (classData) {
        if (classData.type === ClassTypeEnum.APPOINTMENT) {
          newRequest.requestStartTime = new Date(requestStartTime)
          newRequest.requestEndTime = new Date(requestEndTime)
        }
      }
    }

    return await this.requestTimeChangeRepository.save(newRequest)
  }

  async loginWithAliasPassword(payload: StudentLoginWithAliasPasswordDto) {
    const { phone, aliasPassword, institutionId, name } = payload

    // Find the user alias by phone number and institution
    const allUserAliasesWithSamePhoneNumber = await this.usersAliasRepository.findAll({
      where: {
        institutionId,
        user: { phone: transformPhone(phone) },
        ...(name ? { name: Raw((alias) => `LOWER(${alias}) = LOWER(:name)`, { name }) } : {}),
      },
      relations: ['user'],
      select: [
        'id',
        'aliasPassword',
        'isStudentParent',
        'name',
        'email',
        'user',
        'childOfUserAliasId',
      ],
      order: { aliasPassword: 'ASC' },
    })

    if (!allUserAliasesWithSamePhoneNumber || allUserAliasesWithSamePhoneNumber.length === 0) {
      throw new BadRequestException(
        'User alias not found for the given phone number and institution'
      )
    }

    let isStudentParentEnabled = false

    let findUserAliasByParentFirst = allUserAliasesWithSamePhoneNumber.find(
      (alias) => alias.isStudentParent && alias.aliasPassword
    )

    if (!findUserAliasByParentFirst) {
      findUserAliasByParentFirst = allUserAliasesWithSamePhoneNumber.at(0)
    } else {
      isStudentParentEnabled = true
    }

    if (!findUserAliasByParentFirst) {
      throw new NotFoundException('User alias not found for the given phone number and institution')
    }

    // Check if the alias password is set
    if (!findUserAliasByParentFirst.aliasPassword) {
      throw new UnauthorizedException('Alias password not set for this user')
    }

    // Verify the alias password using bcrypt
    let isPasswordValid = await bcrypt.compare(
      aliasPassword,
      findUserAliasByParentFirst.aliasPassword
    )

    // This search for the remaining user to see if the password match
    if (
      allUserAliasesWithSamePhoneNumber.length > 1 &&
      !isPasswordValid &&
      !isStudentParentEnabled
    ) {
      for (const alias of allUserAliasesWithSamePhoneNumber.slice(1)) {
        isPasswordValid = await bcrypt.compare(aliasPassword, alias.aliasPassword)

        if (isPasswordValid) {
          break
        }
      }
    }

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid alias password')
    }

    // Get user details
    const user = findUserAliasByParentFirst.user

    // Check if user has student role in this institution
    const userRole = await this.userRolesRepository.findOne({
      where: {
        userId: user.id,
        institutionId,
        isStudent: true,
      },
    })

    if (!userRole) {
      throw new UnauthorizedException('User does not have student access to this institution')
    }

    // Generate access and refresh tokens
    const accessToken = await this.authService.createToken(
      user,
      undefined,
      findUserAliasByParentFirst.id
    )
    const refreshToken = await this.authService.createRefreshToken(
      user,
      findUserAliasByParentFirst.id
    )

    // Update last login time
    await this.usersService.saveLastLogin(user)

    // Get children if this is a parent account
    let listChildren = []

    if (findUserAliasByParentFirst.isStudentParent) {
      listChildren = await this.usersAliasRepository.find({
        where: {
          childOfUserAliasId: findUserAliasByParentFirst.id,
          institutionId,
        },
        relations: ['user'],
      })
    } else {
      listChildren = await this.getOtherUserAliasWithSamePhoneNumber(
        institutionId,
        findUserAliasByParentFirst.id,
        user.phone
      )
    }

    listChildren = listChildren.map((child) => ({
      id: child.user.id,
      firstName: child.name,
      lastName: child.user.lastName,
      email: child.email,
      phone: child.user.phone,
      userAliasId: child.id,
    }))
    // Return the response similar to checkProfile
    return {
      id: user.id,
      firstName: findUserAliasByParentFirst.name ?? user.firstName,
      lastName: user.lastName,
      email: findUserAliasByParentFirst.email ?? user.email,
      phone: user.phone,
      userAliasId: findUserAliasByParentFirst.id,
      isStudentParent: !findUserAliasByParentFirst.childOfUserAliasId,
      listChildren,
      accessToken,
      refreshToken,
      activeUserAliasId: findUserAliasByParentFirst.id,
    }
  }

  async changeAliasPassword(user: User, payload: StudentChangeAliasPasswordDto) {
    const { userAliasId, currentAliasPassword, newAliasPassword } = payload

    // Find the specific user alias by ID, explicitly selecting aliasPassword
    const userAlias = await this.usersAliasRepository.findOne({
      where: { id: userAliasId },
    })

    if (!userAlias) {
      throw new BadRequestException('User alias not found')
    }

    // Verify that the user alias belongs to the authenticated user OR is a child of the authenticated user
    if (userAlias.userId !== user.id) {
      // Check if this is a child alias and the authenticated user is the parent
      if (userAlias.childOfUserAliasId) {
        const parentAlias = await this.usersAliasRepository.findOne({
          where: {
            userId: user.id,
            institutionId: userAlias.institutionId,
            isStudentParent: true,
          },
        })

        if (!parentAlias || userAlias.childOfUserAliasId !== parentAlias.id) {
          throw new BadRequestException(
            "You can only change passwords for your own user aliases or your children's aliases"
          )
        }
      } else {
        throw new BadRequestException(
          "You can only change passwords for your own user aliases or your children's aliases"
        )
      }
    }

    const userAliasWithPassword = await this.usersAliasRepository.findOne({
      where: { id: userAliasId },
      select: ['id', 'aliasPassword'],
    })

    if (!userAliasWithPassword.aliasPassword) {
      throw new BadRequestException('Alias password not set for this user')
    }

    // Verify the current alias password
    const isCurrentPasswordValid = await bcrypt.compare(
      currentAliasPassword,
      userAliasWithPassword.aliasPassword
    )
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current alias password is incorrect')
    }

    // Validate new password strength (same as regular password change)
    const strongPasswordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).{8,20}$/
    if (!newAliasPassword.match(strongPasswordRegex)) {
      throw new BadRequestException(
        'Please enter between 8 - 20 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 special character and 1 number'
      )
    }

    // Hash the new alias password using bcrypt
    const hashedNewAliasPassword = await bcrypt.hash(newAliasPassword, 12)

    // Update the user alias with the new hashed password
    userAlias.aliasPassword = hashedNewAliasPassword

    await this.usersAliasRepository.save(userAlias)

    return { message: 'Alias password changed successfully' }
  }

  private async getOtherUserAliasWithSamePhoneNumber(
    institutionId: number,
    userAliasId: number,
    phone: string
  ) {
    const allUserAliasesWithSamePhoneNumber = await this.usersAliasRepository.findAll({
      where: {
        institutionId,
        id: Not(userAliasId),
        user: { phone: transformPhone(phone) },
      },
      relations: ['user'],
    })

    return allUserAliasesWithSamePhoneNumber
  }
}
