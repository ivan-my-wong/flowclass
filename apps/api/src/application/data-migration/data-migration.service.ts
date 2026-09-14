import { Injectable, Logger } from '@nestjs/common'
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm'
import axios from 'axios'
import { plainToInstance } from 'class-transformer'
import Redis from 'ioredis'
import {
  DeepPartial,
  EntityManager,
  EntityTarget,
  IsNull,
  Not,
  ObjectLiteral,
  Repository,
} from 'typeorm'
import * as xlsx from 'xlsx'

import { EmailService } from '@/domain/external/email.service'
import { StripeConnectService } from '@/domain/external/stripe-connect.service'
import { ClassLessonRepository } from '@/models/class-lesson.repository'
import { ClassLesson } from '@/models/class-lessons.entity'
/* eslint-disable simple-import-sort/imports */
import { ClassEntity, RepeatUnit } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import { CommonField } from '@/models/common-field.entity'
import { CommonForm } from '@/models/common-form.entity'
import { CouponsRepository } from '@/models/coupons.repository'
import { CoursePromotionUsed } from '@/models/course-promotion-used.entity'
import { RegularPeriods, RegularPeriodsRepository } from '@/models/course-regular-periods.entity'
import { EnrollCourse } from '@/models/enroll-courses.entity'
import { EnrollCourseRepository } from '@/models/enroll-courses.repository'
import { ClassTypeEnum } from '@/models/enums/'
import { AttendanceStatus, EnrollConfirmStatus } from '@/models/enums/status'
import { Invoice } from '@/models/invoice.entity'
import { InvoiceRepository } from '@/models/invoice.repository'
import { NotificationRecord } from '@/models/notification-record.entity'
import { NotificationRecordRepository } from '@/models/notification-record.repository'
import { PeriodLessons, PeriodLessonsRepository } from '@/models/period-lessons.entity'
import { RecordLog } from '@/models/record-log.entity'
import { RequestTimeChange } from '@/models/request-time-change.entity'
import { RequestTimeChangeRepository } from '@/models/request-time-change.repository'
import { StudentForm } from '@/models/student-form.entity'
import { StudentLesson } from '@/models/student-lesson.entity'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { StudentMemo } from '@/models/student-memo.entity'
import { StudentMemoRepository } from '@/models/student-memo.repository'
import { User } from '@/models/user.entity'
import { UserAlias } from '@/models/user-aliases.entity'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { UserRole } from '@/models/user-role.entity'
import { UsersRepository } from '@/models/users.repository'
import { WKSession } from '@/models/workshop-sessions.entity'
import { BaseEntity } from '@/modules/base/base.entity'
import { createSuccessPaymentLink } from '@/utils/payment.utils'
import { addressObjectToString } from '@/utils/string.utils'

@Injectable()
export class DataMigrationService {
  private readonly logger = new Logger(DataMigrationService.name)

  constructor(
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly periodLessonsRepository: PeriodLessonsRepository,
    private readonly usersRepository: UsersRepository,
    private readonly couponsRepository: CouponsRepository,
    private readonly regularPeriodsRepository: RegularPeriodsRepository,
    private readonly classesRepository: ClassRepository,
    private readonly enrollCourseRepository: EnrollCourseRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly emailService: EmailService,
    @InjectRepository(RecordLog)
    private readonly recordLogRepository: Repository<RecordLog>,
    @InjectRepository(StudentForm)
    private readonly studentFormRepository: Repository<StudentForm>,
    @InjectRepository(CommonField)
    private readonly commonFieldsRepository: Repository<CommonField>,
    private readonly studentLessonRepository: StudentLessonRepository,
    private readonly stripeConnectService: StripeConnectService,
    private readonly userAliasesRepository: UserAliasesRepository,
    private readonly studentMemoRepository: StudentMemoRepository,
    private readonly classLessonRepository: ClassLessonRepository,
    private readonly requestTimeChangeRepository: RequestTimeChangeRepository,
    private readonly notificationRecordRepository: NotificationRecordRepository
  ) {}

  async migrate<CustomEntity extends ObjectLiteral>(
    entityClass: EntityTarget<CustomEntity>,
    mapFunc: (x: CustomEntity) => Promise<DeepPartial<CustomEntity>> | Promise<void>,
    fields?: string[],
    withDeleted?: boolean
  ): Promise<boolean> {
    const repo = this.entityManager.getRepository(entityClass)

    const oldData = await repo.find({
      ...(fields?.length
        ? {
            select: fields.reduce((acc, item) => ({ ...acc, [item]: true }), {}),
          }
        : {}),
      loadEagerRelations: false,
      withDeleted: !!withDeleted,
    })

    for (let i = 0; i < oldData.length; i++) {
      const current = oldData[i]
      try {
        const result = await mapFunc(current)
        if (result) {
          const saved = await repo.save(result, {
            reload: false,
            transaction: false,
          })
          console.log(saved)
        }
      } catch (e) {
        console.log(current)
        throw e
      }
    }

    // const maxId = Math.max(...oldData.map((x) => x.id as number));
    // if (maxId > 1 && entityClass !== targetClass) {
    //   const tableName = repo.metadata.tableName;
    //   const updateIdSequenceQuery = `ALTER SEQUENCE ${tableName}_id_seq RESTART WITH ${
    //     maxId + 500
    //   };`;
    //   await this.entityManager.query(updateIdSequenceQuery);
    // }
    return true
  }

  getBaseFields(current: BaseEntity) {
    return {
      id: current.id,
      createdAt: current.createdAt,
      updatedAt: current.updatedAt,
      deletedAt: current.deletedAt,
      createdBy: current.createdBy,
      updatedBy: current.updatedBy,
    }
  }

  async migratePeriodsToRepeatFormats() {
    // return await this.migrate(RegularPeriods, async (x) => {
    //   if (!!x.period) {
    //     // Create a new RepeatFormat entity from the period
    //     let savedRepeatFormat;
    //     if (!!x.period.repeatType) {
    //       if (!x.repeatFormat) {
    //         const repeatFormat: Partial<RepeatFormats> = {
    //           institutionId: x.institutionId,
    //           repeat: x.period.repeatType.repeat,
    //           every: x.period.repeatType.every,
    //           unit: x.period.repeatType.unit,
    //           times: x.period.repeatType.times,
    //         };
    //         const repeatFormatInstance = plainToInstance(RepeatFormats, repeatFormat);
    //         // Save the new RepeatFormat entity to the database
    //         savedRepeatFormat = await this.repeatFormatsRepository.save(repeatFormatInstance);
    //       }
    //     }
    //     await this.periodLessonsRepository.delete({ periodId: x.id });
    //     const { lessons, duration, ...useless } = x.period;
    //     if (!!lessons) {
    //       await lessons.forEach(async (lesson) => {
    //         const lessonInstanceRaw = {
    //           startTime: lesson.split(' ')[0],
    //           endTime: lesson.split(' ')[1],
    //           periodId: x.id,
    //           classId: x.classId,
    //         };
    //         const lessonInstance = plainToInstance(PeriodLessons, lessonInstanceRaw);
    //         await this.periodLessonsRepository.save(lessonInstance);
    //       });
    //     }
    //     // Save the updated RegularPeriods entity to the database
    //     return {
    //       ...x,
    //       duration,
    //       repeatFormat: savedRepeatFormat?.id ?? x.repeatFormat,
    //     };
    //   } else {
    //     return x;
    //   }
    // });
  }

  async migrateEnrollCoursesPayLaterMethodToInvoice() {
    // return await this.migrate(EnrollCourse, async (x) => {
    //   if (x.payLaterMethod !== undefined) {
    //     const invoices = await this.invoiceRepository.find({ where: { enrollId: x.id } });
    //     invoices.map((invoice) => {
    //       if (!invoice.payLaterMethod && x.payLaterMethod !== null) {
    //         invoice.payLaterMethod = x.payLaterMethod;
    //       }
    //       return invoice;
    //     });
    //     await this.invoiceRepository.save(invoices);
    //   } else {
    //     return x;
    //   }
    // });
  }

  // [TO BE ENABLED WHEN NEEDED]

  async migrateEnrollCoursesSessionIdToClassId() {
    // return await this.migrate(EnrollCourse, async (x) => {
    //   if (x.sessionId !== null && x.classId === null) {
    //     return {
    //       ...x,
    //       classId: x.sessionId,
    //     };
    //   } else {
    //     return x;
    //   }
    // });
  }

  async copyCourseTypeToClassesType() {
    // return await this.migrate(Course, async (x) => {
    //   if (x.type) {
    //     await this.classesRepository.update({ courseId: x.id }, { type: x.type as CourseTypeEnum });
    //     return x;
    //   } else {
    //     return x;
    //   }
    // });
  }

  async copyEventSessionToClassesAndAddPeriod() {
    return await this.migrate(WKSession, async (x) => {
      const findClass = await this.classesRepository.findOne({
        where: { courseId: x.courseId },
      })

      if (!findClass) {
        const originalSessionDates = await this.periodLessonsRepository.findBy({
          periodId: x.id,
        })

        const classToBeSaved = {
          courseId: x.courseId,
          siteId: x.siteId,
          institutionId: x.institutionId,
          type: ClassTypeEnum.WORKSHOP,
          name: x.name,
          quota: x.quota,
          tuition: x.totalFee,
          createdBy: x.createdBy,
          updatedBy: x.updatedBy,
          createdAt: x.createdAt,
          updatedAt: x.updatedAt,
        }

        const classInstance = plainToInstance(ClassEntity, classToBeSaved)

        const classSaved = await this.classesRepository.save(classInstance)

        const regularPeriod = {
          courseId: x.courseId,
          siteId: x.siteId,
          institutionId: x.institutionId,
          duration: 60,
          classId: classSaved.id,
          name: x.name,
          repeatFormat: {
            institutionId: x.institutionId,
            repeat: true,
            every: 1,
            unit: RepeatUnit.weeks,
            times: 1,
          },
        }

        const regularPeriodInstance = plainToInstance(RegularPeriods, regularPeriod)

        const regularPeriodSaved = await this.regularPeriodsRepository.save(regularPeriodInstance)

        originalSessionDates.forEach(async (lesson) => {
          const lessonInstanceRaw = {
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            periodId: regularPeriodSaved.id,
            classId: classSaved.id,
          }
          const lessonInstance = plainToInstance(PeriodLessons, lessonInstanceRaw)
          await this.periodLessonsRepository.save(lessonInstance)
        })
      }
    })
  }

  async saveCouponUsedRecordLog(): Promise<boolean> {
    return await this.migrate(CoursePromotionUsed, async (c) => {
      const coupon = await this.couponsRepository.findOneBy({
        id: c.couponId,
      })
      const student = await this.usersRepository.findOneBy({
        id: c.studentId,
      })

      if (coupon && student) {
        const recordDetail = {
          userId: c.studentId,
          institutionId: c.institutionId,
          courseId: c.courseId,
          couponCode: coupon.code,
          createdAt: c.createdAt,
        }

        const recordLog = await this.recordLogRepository.find({
          where: {
            userId: c.studentId,
            institutionId: c.institutionId,
          },
        })

        if (!recordLog) {
          await this.recordLogRepository.save(recordDetail)
        }
      }
    })
  }

  async convertRecurringToRepeatFormat() {
    // return await this.migrate(ClassEntity, async (x) => {
    //   if (x.recurringPeriod !== null && !x.recurringFormat) {
    //     const repeatFormat: Partial<RepeatFormats> = {
    //       institutionId: x.institutionId,
    //       repeat: true,
    //       every: x.recurringPeriod.every,
    //       unit: x.recurringPeriod.unit,
    //       times: x.recurringPeriod.times,
    //     };
    //     const repeatFormatInstance = plainToInstance(RepeatFormats, repeatFormat);
    //     const savedRepeatFormat = await this.repeatFormatsRepository.save(repeatFormatInstance);
    //     return {
    //       ...x,
    //       recurringFormat: savedRepeatFormat,
    //     };
    //   } else {
    //     return x;
    //   }
    // });
  }

  async convertSessionIdToPeriodIdStudentSchedule() {
    // return await this.migrate(StudentSchedule, async (x) => {
    //   if (x.sessionId !== null && x.classId === null) {
    //     return {
    //       ...x,
    //       classId: x.sessionId,
    //     };
    //   } else {
    //     return x;
    //   }
    // });
  }

  // [TO BE ENABLED WHEN NEEDED]
  async convertStudentScheduleFirstScheduleToStudentLesson() {
    // return await this.migrate(StudentSchedule, async (x) => {
    //   const studentLessons = await this.studentLessonRepository.find({
    //     where: { studentScheduleId: x.id },
    //   });
    //   x.studentLessons = studentLessons;
    //   if (
    //     x.firstSchedule !== null &&
    //     Array.isArray(x.firstSchedule) &&
    //     typeof x.firstLesson === 'string' &&
    //     x.studentLessons?.length === 0
    //   ) {
    //     const enrollCourse = await this.enrollCourseRepository.findOneBy({ id: x.enrollCourseId });
    //     if (!x.classId || !enrollCourse?.siteId) return;
    //     let studentLessonResult;
    //     try {
    //       const enrolledClassLessonDates =
    //         await this.classLessonService.createLessonToClassLessonTable({
    //           siteId: enrollCourse.siteId,
    //           recurringSchedules: x.firstSchedule,
    //           classId: x.classId,
    //           courseId: x.id,
    //           institutionId: enrollCourse.institutionId,
    //         });
    //       studentLessonResult = await this.classLessonService.connectClassLessonToStudentLesson({
    //         classLessons: enrolledClassLessonDates,
    //         studentId: enrollCourse.userId,
    //         enrollCourseId: enrollCourse.id,
    //         studentScheduleId: x.id,
    //       });
    //     } catch (e) {
    //       if (x.studentLessons && x.studentLessons?.length > 0) {
    //         return {
    //           ...x,
    //           firstStudentLessonId: x.studentLessons[0].id,
    //         };
    //       }
    //     }
    //     if (Array.isArray(studentLessonResult) && studentLessonResult.length > 0) {
    //       console.log('Student Lesson Result', studentLessonResult);
    //       return {
    //         ...x,
    //         firstStudentLessonId: studentLessonResult[0].id,
    //       };
    //     }
    //   } else {
    //     console.log('Student Lesson Result', x.studentLessons[0].id);
    //     return {
    //       ...x,
    //       firstStudentLessonId: x.studentLessons[0].id,
    //     };
    //   }
    // });
  }

  async checkRedisConnection() {
    const redis = new Redis({
      host: process.env.REDIS_URL,
      port: +process.env.REDIS_PORT,
    })

    try {
      await redis.ping()
      console.log('Successfully connected to Redis')
    } catch (error) {
      console.error('Failed to connect to Redis:', error)
    } finally {
      await redis.quit()
    }
  }

  async importCompanyData() {
    // read a csv file from a designated URL
    // parse the csv file
    // save the data to the database
    // Get the file from "https://ffclassroom.com/wp-content/uploads/2024/10/all_attendences.csv"
    const response = await axios.get(
      'https://ffclassroom.com/wp-content/uploads/2024/10/all_attendences.xlsx',
      {
        responseType: 'arraybuffer', // Ensure the response is in the correct format
      }
    )

    // Read the XLSX file from the response data
    const workbook = xlsx.read(response.data, { type: 'buffer' })

    // Get the first sheet name
    const sheetName = workbook.SheetNames[0]

    // Get the worksheet
    const worksheet = workbook.Sheets[sheetName]

    // Convert the worksheet to JSON
    const csvData = xlsx.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      raw: false,
    })

    // These are the columns in the csv file:
    // Name     Position    Company      Email

    const allUsers = await this.usersRepository.find()

    const companyField = await this.commonFieldsRepository.findOneBy({
      id: 2,
    })

    const positionField = await this.commonFieldsRepository.findOneBy({
      id: 3,
    })

    // Skip the first row as it contains headers
    const dataRows = csvData.slice(1)

    return await dataRows.map(async (row) => {
      const user = allUsers.find((user) => user.email === row[3])

      if (!user) return null

      // Field ID 2 is company, and field ID 3 is job title

      const isUserHasCompanyField = await this.studentFormRepository.exist({
        where: {
          userId: user.id,
          fieldId: '2',
        },
      })

      const isUserHasPositionField = await this.studentFormRepository.exist({
        where: {
          userId: user.id,
          fieldId: '3',
        },
      })

      if (isUserHasCompanyField && isUserHasPositionField) return null

      const studentForm: Partial<StudentForm> = {
        userId: user.id,
        formId: 1,
        fieldId: '2',
        institutionId: 1,
        // metadata: {
        //   id: '2',
        //   type: companyField.type,
        //   value: row[2],
        //   question: companyField.question,
        // },
        formFieldId: '2',
        formFieldQuestion: companyField.question,
        formFieldType: companyField.type,
        formFieldValue: row[2],
        formFieldIsDefault: true,
        formFieldOrder: 1,
        // formFieldColumnMapping: 'company',
      }

      await this.studentFormRepository.save(studentForm)

      // const studentForm2: Partial<StudentForm> = {
      //   ...studentForm,
      //   fieldId: 3,
      //   metadata: {
      //     id: 3,
      //     type: positionField.type,
      //     value: row[1],
      //     question: positionField.question,
      //   },
      // }

      // await this.studentFormRepository.save(studentForm2)
    })

    // Do the same for position field
  }

  async runFormFields() {
    await this.migrate(EnrollCourse, async (x) => {
      if (Array.isArray(x.registrationForm)) {
        x.registrationForm = x.registrationForm.map((o) => {
          if (!isNaN(+o.id)) {
            o.id = `applicant.0.${o.id}`
          }
          return o
        })
      }
      return x
    })

    await this.migrate(StudentForm, async (x) => {
      // if (!isNaN(+x.metadata.id)) {
      //   x.metadata.id = `applicant.0.${x.metadata.id}`
      // }
      // if (!isNaN(+x.fieldId)) {
      //   x.fieldId = `applicant.0.${x.fieldId}`
      // }

      if (!isNaN(+x.formFieldId)) {
        x.formFieldId = `applicant.0.${x.formFieldId}`
      }
      if (!isNaN(+x.fieldId)) {
        x.fieldId = `applicant.0.${x.fieldId}`
      }

      return x
    })

    await this.migrate(CommonForm, async (x) => {
      x.fields = x.fields.map((o) => {
        if (!isNaN(+o)) return `applicant.${o}`
        return o
      })
      return x
    })
  }

  async sendReminderEmail() {
    // const oneDayAgo = moment().subtract(1, 'days').toDate()

    const emailToSend = 'albertyeung@hkma.org.hk'

    const invoices = await this.invoiceRepository.find({
      where: {
        // createdAt: LessThan(oneDayAgo),
        institutionId: 2,
        enrollCourses: {
          // email: emailToSend,
          confirmState: EnrollConfirmStatus.ACCEPTED,
        },
      },
      relations: {
        enrollCourses: true,
        institution: true,
        course: true,
        studentSchedules: {
          class: true,
          studentLessons: true,
        },
        site: true,
      },
    })

    // Write a function to make sure the email is unique in enrollCourse
    // const uniqueInvoices = invoices.filter((invoice) => invoice.enrollCourse?.email === emailToSend)
    const uniqueInvoices = invoices

    const emailsSent: string[] = []
    let invoiceIndex = 0

    for (const invoice of uniqueInvoices) {
      const enrollCourse = invoice.enrollCourses.at(0)
      const institution = invoice.institution
      const site = invoice.site

      if (!institution || !site || !enrollCourse) {
        console.log(`Skipping invoice ${invoice.id}: missing institution, site, or enrollCourse`)
        continue
      }

      if (emailsSent.includes(enrollCourse.email)) continue

      const firstStudentSchedule = invoice.studentSchedules[0]

      const emails = invoice.applicants.map(async (applicant, index) => {
        const user = await this.usersRepository.findOneBy({
          id: applicant,
        })

        const lesson = firstStudentSchedule.studentLessons[index]

        if (!lesson) return null

        const emailData = {
          recipientUserId: invoice.userId,
          institutionId: institution.id,
          siteId: site.id,
          enrollId: enrollCourse.id,
          courseName: invoice.course.name,
          className: firstStudentSchedule.class.name,
          studentSchedule: firstStudentSchedule,
          timeZone: site.timeZone?.id,
          institutionName: institution.name,
          location: addressObjectToString(institution.address),
          adminPhone: institution.phone,
          adminEmail: institution.email,
          studentName: user.firstName || user.lastName,
          firstLesson: `${lesson.startTime.toISOString()} ${lesson.endTime.toISOString()}`,
          studentEmail: user.email || enrollCourse.preferredEmail,
          enrollCourseId: enrollCourse.id,
          // timeslot: '12:30 - 13:30',
          studentPhone: user.phone || enrollCourse.preferredPhone,
          successPaymentLink: createSuccessPaymentLink({
            invoice,
            institution,
            enrollCourse,
            site,
          }),
        }

        emailsSent.push(enrollCourse.email)

        console.log(
          `Sending email to ${enrollCourse.email}, invoiceId: ${invoice.id}, enrollId: ${enrollCourse.id}`
        )
        console.log(`Email ${invoiceIndex + 1} of ${uniqueInvoices.length}`)
        return await this.emailService.sendStudentLessonReminderEmail({
          data: emailData,
          // customTemplateId: 'x2p0347kwd7lzdrn',
        })
      })

      await Promise.all(emails)
      invoiceIndex += 1
    }
  }

  async exportAttendanceData() {
    // Get all the attendance data from the attendance table with name, email, phone of both first and second applicant
    const attendanceData = await this.studentLessonRepository.find({
      where: {
        attendance: AttendanceStatus.ATTENDED,
      },
      relations: {
        enrollCourse: true,
      },
    })

    const dataToExport = attendanceData.map((o) => {
      const secondApplicant = o.enrollCourse?.registrationForm

      if (!secondApplicant) return null
      // [{"id": "applicant.0.1", "order": 2, "value": "Cheuk Man Wu", "question": "參加者姓名 / Name of Applicant", "isDefault": true, "columnMapping": "name"}, {"id": "applicant.0.2", "order": 3, "value": "Chapman.wu@pico.com", "question": "參加者電郵 / Email of Applicant", "isDefault": true, "columnMapping": "email"}, {"id": "applicant.0.3", "order": 4, "value": "85291300629", "question": "參加者聯絡電話 / Phone of Applicant", "isDefault": true, "columnMapping": "phone"}, {"id": "applicant.0.7", "order": 8, "value": "28", "question": "年齡（選填）/ Age (Optional)", "isDefault": false, "columnMapping": null}, {"id": "applicant.1.createAnAccount", "order": 10, "value": true, "question": "createAnAccount", "isDefault": false}, {"id": "applicant.1.1", "order": 12, "value": "Cheuk Man Wu", "question": "參加者姓名 / Name of Applicant", "isDefault": true, "columnMapping": "name"}, {"id": "applicant.1.2", "order": 13, "value": "Chapman.wu@pico.com", "question": "參加者電郵 / Email of Applicant", "isDefault": true, "columnMapping": "email"}, {"id": "applicant.1.3", "order": 14, "value": "85291300629", "question": "參加者聯絡電話 / Phone of Applicant", "isDefault": true, "columnMapping": "phone"}, {"id": "applicant.1.7", "order": 18, "value": "28", "question": "年齡（選填）/ Age (Optional)", "isDefault": false, "columnMapping": null}]
      const secondApplicantName = secondApplicant.find((o) => o.id === 'applicant.1.1')
      const secondApplicantEmail = secondApplicant.find((o) => o.id === 'applicant.1.2')
      const secondApplicantPhone = secondApplicant.find((o) => o.id === 'applicant.1.3')

      return {
        name: o.enrollCourse.preferredName,
        email: o.enrollCourse.preferredEmail,
        phone: o.enrollCourse.preferredPhone,
        secondApplicantName: secondApplicantName?.value,
        secondApplicantEmail: secondApplicantEmail?.value,
        secondApplicantPhone: secondApplicantPhone?.value,
        attendance: o.attendance,
      }
    })

    // export to a CSV for download
    const worksheet = xlsx.utils.json_to_sheet(dataToExport)
    const workbook = xlsx.utils.book_new()
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Attendance Data')

    const filePath = `./attendance-data-${Date.now()}.csv`

    xlsx.writeFile(workbook, filePath)

    return filePath
  }

  async testStripeWebhookCompletePayment(connectAccountId: string, body: any) {
    await this.stripeConnectService.handleCompletedCheckoutSession(body)
  }

  /**
   * Separate shared users - separate a user with multiple UserAlias into independent users
   * @param institutionId institution ID, if not provided, all institutions will be processed
   * @param userId specific user ID to process, if not provided, all users will be processed
   * @param dryRun whether to run in test mode, do not actually execute updates
   * @returns processing result statistics
   */
  async separateSharedUsers(
    institutionId?: number,
    userId?: number,
    dryRun = false
  ): Promise<{
    processed: number
    created: number
    errors: Array<{ userAliasId: number; error: string }>
  }> {
    const result = {
      processed: 0,
      created: 0,
      errors: [],
    }

    try {
      console.log('separateSharedUsers called with:', {
        institutionId,
        userId,
        userIdType: typeof userId,
        dryRun,
      })

      // 1. find users with multiple UserAlias
      const queryBuilder = this.userAliasesRepository
        .createQueryBuilder('ua')
        .select(['ua.userId', 'COUNT(*) as aliasCount'])
        .groupBy('ua.userId')
        .having('COUNT(*) > 1')

      if (institutionId) {
        queryBuilder.andWhere('ua.institutionId = :institutionId', { institutionId })
      }
      if (userId) {
        queryBuilder.andWhere('ua.userId = :userId', { userId })
      }

      console.log('Query SQL:', queryBuilder.getSql())
      console.log('Query parameters:', queryBuilder.getParameters())

      const sharedUsers = await queryBuilder.getRawMany()

      console.log('Found shared users from first query:', sharedUsers)

      if (userId && sharedUsers.length === 0) {
        console.log(`User ${userId} not found or doesn't have multiple aliases`)
        return result
      }
      console.log(`Found ${sharedUsers.length} users with multiple aliases`)

      for (const sharedUser of sharedUsers) {
        const actualUserId = sharedUser.ua_user_id
        if (!actualUserId) {
          console.error('❌ Failed to extract userId from GROUP BY result:', sharedUser)
          continue
        }
        const whereCondition: any = { userId: actualUserId }

        if (institutionId) {
          whereCondition.institutionId = institutionId
        }

        console.log('Second query whereCondition:', whereCondition)

        const userAliases = await this.userAliasesRepository.find({
          where: whereCondition,
          relations: { user: true },
          order: { id: 'ASC' }, // keep the first UserAlias unchanged
        })

        console.log(`User ${actualUserId} has ${userAliases.length} aliases in current scope`)
        console.log(
          'User aliases details:',
          userAliases.map((alias) => ({
            id: alias.id,
            name: alias.name,
            institutionId: alias.institutionId,
          }))
        )

        if (userAliases.length <= 1) {
          console.log(`Skipping user ${actualUserId} - not enough aliases after filtering`)
          continue
        }

        const originalUser = userAliases[0].user
        console.log(
          `Processing user ${originalUser.id} (${originalUser.email}) with ${userAliases.length} aliases`
        )

        // 2. create new user for each additional UserAlias (keep the first one unchanged)
        console.log(
          `Will process ${userAliases.length - 1} aliases (keeping first one: ${userAliases[0].id})`
        )

        for (let i = 1; i < userAliases.length; i++) {
          const alias = userAliases[i]
          console.log(
            `Processing alias ${i}/${userAliases.length - 1}: ${alias.id} (${alias.name})`
          )
          result.processed++

          try {
            if (!dryRun) {
              await this.entityManager.transaction(async (transactionalEntityManager) => {
                // create new user
                const newUser = await this.createNewUserForAlias(
                  transactionalEntityManager,
                  originalUser,
                  alias
                )

                // update UserAlias to point to the new User
                await transactionalEntityManager.update(
                  UserAlias,
                  { id: alias.id },
                  { userId: newUser.id }
                )

                // update related records
                await this.updateRelatedRecords(transactionalEntityManager, alias.id, newUser.id)

                // create UserRole
                await this.createUserRoleForNewUser(
                  transactionalEntityManager,
                  newUser.id,
                  alias.institutionId,
                  originalUser,
                  alias
                )

                console.log(
                  `✅ Created new user ${newUser.id} (${newUser.email}) for alias ${alias.id}`
                )
              })
            } else {
              console.log(
                `[DRY RUN] Would create new user for alias ${alias.id}: ${alias.name} (institution: ${alias.institutionId})`
              )
            }

            result.created++
          } catch (error) {
            console.error(`❌ Error processing alias ${alias.id}:`, error.message)
            result.errors.push({
              userAliasId: alias.id,
              error: error.message,
            })
          }
        }

        console.log(
          `Finished processing user ${actualUserId}. Total processed so far: ${result.processed}`
        )
      }

      console.log(`\n=== Separation Summary ===`)
      console.log(
        `Target: ${userId ? `User ${userId}` : 'All users'}${
          institutionId ? ` in institution ${institutionId}` : ''
        }`
      )
      console.log(`Processed aliases: ${result.processed}`)
      console.log(`New users created: ${result.created}`)
      console.log(`Errors: ${result.errors.length}`)

      if (result.errors.length > 0) {
        console.log(`\nErrors:`)
        result.errors.forEach((err) => {
          console.log(`- UserAlias ${err.userAliasId}: ${err.error}`)
        })
      }

      return result
    } catch (error) {
      console.error('Failed to separate shared users:', error)
      throw error
    }
  }

  /**
   * create new user for UserAlias
   */
  private async createNewUserForAlias(
    transactionalEntityManager: EntityManager,
    originalUser: User,
    alias: UserAlias
  ): Promise<User> {
    // family members share the same email, unless there is a conflict
    let newEmail = originalUser.email
    // check if the email is already used by another user with the same first name
    const emailConflict = await transactionalEntityManager.findOne(User, {
      where: {
        email: originalUser.email,
        firstName: alias.name,
      },
    })

    // if there is a conflict, generate a new email
    if (emailConflict && emailConflict.id !== originalUser.id) {
      newEmail = this.generateUniqueEmail(originalUser.email, alias.name)

      let counter = 1
      while (await transactionalEntityManager.findOne(User, { where: { email: newEmail } })) {
        newEmail = this.generateUniqueEmail(originalUser.email, alias.name, counter)
        counter++
      }
    }

    // create new user
    const newUser = transactionalEntityManager.create(User, {
      firstName: alias.name,
      lastName: '',
      email: newEmail,
      phone: alias.user.phone || originalUser.phone,
      password: originalUser.password, // use the same password
      isEmailVerified: originalUser.isEmailVerified,
      status: originalUser.status,
      company: originalUser.company,
      position: originalUser.position,
      country: originalUser.country,
    })

    return await transactionalEntityManager.save(User, newUser)
  }

  /**
   * generate unique email address
   */
  private generateUniqueEmail(originalEmail: string, aliasName: string, counter?: number): string {
    const [localPart, domain] = originalEmail.split('@')
    const cleanName = aliasName.replace(/\s+/g, '').toLowerCase()
    const suffix = counter ? `${counter}` : ''

    return `${localPart}+${cleanName}${suffix}@${domain}`
  }

  /**
   * update related records to point to the new user
   */
  private async updateRelatedRecords(
    transactionalEntityManager: EntityManager,
    userAliasId: number,
    newUserId: number
  ): Promise<void> {
    const invoicesWithUserAlias = await transactionalEntityManager.find(Invoice, {
      where: { userAliasId },
      select: ['id', 'applicants', 'userId'],
    })
    const originalUserId = invoicesWithUserAlias.length > 0 ? invoicesWithUserAlias[0].userId : null

    // update EnrollCourse
    await transactionalEntityManager.update(EnrollCourse, { userAliasId }, { userId: newUserId })

    // update Invoice
    await transactionalEntityManager.update(Invoice, { userAliasId }, { userId: newUserId })

    if (originalUserId) {
      for (const invoice of invoicesWithUserAlias) {
        if (Array.isArray(invoice.applicants)) {
          // use the original userId to find and replace
          const updatedApplicants = invoice.applicants.map((applicantId: number) =>
            applicantId === originalUserId ? newUserId : applicantId
          )

          // only update if applicants really changed
          if (JSON.stringify(invoice.applicants) !== JSON.stringify(updatedApplicants)) {
            await transactionalEntityManager.update(
              Invoice,
              { id: invoice.id },
              { applicants: updatedApplicants }
            )

            console.log(
              `✅ Updated Invoice ${invoice.id} applicants: [${invoice.applicants}] → [${updatedApplicants}]`
            )
          }
        }
      }
    }

    // update StudentMemo
    await transactionalEntityManager.update(StudentMemo, { userAliasId }, { userId: newUserId })

    // update StudentForm
    await transactionalEntityManager.update(StudentForm, { userAliasId }, { userId: newUserId })

    // update StudentLesson (through enrollCourse association)
    const enrollCourses = await transactionalEntityManager.find(EnrollCourse, {
      where: { userAliasId },
      select: ['id'],
    })

    if (enrollCourses.length > 0) {
      const enrollCourseIds = enrollCourses.map((ec) => ec.id)

      // batch update StudentLesson
      await transactionalEntityManager
        .createQueryBuilder()
        .update(StudentLesson)
        .set({ userId: newUserId })
        .where('enrollCourseId IN (:...enrollCourseIds)', { enrollCourseIds })
        .execute()
    }
  }

  /**
   * create UserRole for the new user
   */
  private async createUserRoleForNewUser(
    transactionalEntityManager: EntityManager,
    newUserId: number,
    institutionId: number,
    originalUser: User,
    userAlias: UserAlias
  ): Promise<void> {
    // get siteId from UserAlias's EnrollCourse
    const enrollCourse = await transactionalEntityManager.findOne(EnrollCourse, {
      where: { userAliasId: userAlias.id },
      select: ['siteId'],
    })

    const siteId = enrollCourse?.siteId || null

    // find original user's UserRole as template
    const originalUserRoles = await transactionalEntityManager.find(UserRole, {
      where: {
        userId: originalUser.id,
        institutionId,
      },
    })

    if (originalUserRoles.length === 0) {
      // if no original user role found, create default student role
      const defaultUserRole = transactionalEntityManager.create(UserRole, {
        userId: newUserId,
        institutionId,
        siteId,
        isStudent: true,
        isMasterAdmin: false,
        isInstitutionManager: false,
        isSiteManager: false,
        isInstructor: false,
        isOperator: false,
      })

      await transactionalEntityManager.save(UserRole, defaultUserRole)
    } else {
      // copy original user's roles
      for (const originalRole of originalUserRoles) {
        const newUserRole = transactionalEntityManager.create(UserRole, {
          userId: newUserId,
          institutionId: originalRole.institutionId,
          siteId: originalRole.siteId || siteId,
          isStudent: originalRole.isStudent,
          isMasterAdmin: false, // new user should not be admin
          isInstitutionManager: false,
          isSiteManager: false,
          isInstructor: originalRole.isInstructor,
          isOperator: originalRole.isOperator,
        })

        await transactionalEntityManager.save(UserRole, newUserRole)
      }
    }
  }

  /**
   * Debug method to analyze user aliases data
   */
  async debugUserAliases(
    userId: number,
    institutionId?: number
  ): Promise<{
    userId: number
    totalAliases: number
    aliasesByInstitution: Array<{
      institutionId: number
      aliasCount: number
      aliases: Array<{
        id: number
        name: string
        phone: string | null
        institutionId: number
      }>
    }>
    queryUsed: string
  }> {
    console.log(`\n=== Debugging User Aliases for User ${userId} ===`)

    // Build query condition
    const whereCondition: any = { userId }
    if (institutionId) {
      whereCondition.institutionId = institutionId
    }

    const queryUsed = `UserAlias.find({ where: ${JSON.stringify(whereCondition)} })`
    console.log('Query condition:', whereCondition)

    // Get all aliases for this user
    const userAliases = await this.userAliasesRepository.find({
      where: whereCondition,
      order: { institutionId: 'ASC', id: 'ASC' },
    })

    console.log(`Total aliases found: ${userAliases.length}`)

    // Group by institution
    const groupedByInstitution = userAliases.reduce((acc, alias) => {
      const institutionId = alias.institutionId
      if (!acc[institutionId]) {
        acc[institutionId] = []
      }
      acc[institutionId].push(alias)
      return acc
    }, {} as Record<number, UserAlias[]>)

    const aliasesByInstitution = Object.entries(groupedByInstitution).map(([instId, aliases]) => ({
      institutionId: parseInt(instId, 10),
      aliasCount: aliases.length,
      aliases: aliases.map((alias) => ({
        id: alias.id,
        name: alias.name,
        phone: alias.user.phone,
        institutionId: alias.institutionId,
      })),
    }))

    // Print summary
    console.log('\n=== Summary by Institution ===')
    aliasesByInstitution.forEach((inst) => {
      console.log(`Institution ${inst.institutionId}: ${inst.aliasCount} aliases`)
      inst.aliases.forEach((alias) => {
        console.log(`  - Alias ${alias.id}: ${alias.name} (phone: ${alias.phone || 'null'})`)
      })
    })

    return {
      userId,
      totalAliases: userAliases.length,
      aliasesByInstitution,
      queryUsed,
    }
  }

  /**
   * merge multiple ClassLesson records - merge multiple classLessonId into one
   * @param classLessonIds the array of classLessonId to merge, the first one will be kept as the primary record
   * @param dryRun whether to run in dry run mode, not actually execute the update
   * @returns merge operation result
   */
  async mergeClassLessons(
    classLessonIds: number[],
    dryRun = false
  ): Promise<{
    success: boolean
    primaryClassLessonId: number
    mergedClassLessonIds: number[]
    updatedStudentLessonsCount: number
    deletedClassLessonsCount: number
    errors: Array<{ classLessonId: number; error: string }>
  }> {
    const result = {
      success: false,
      primaryClassLessonId: 0,
      mergedClassLessonIds: [],
      updatedStudentLessonsCount: 0,
      deletedClassLessonsCount: 0,
      errors: [],
    }

    if (!classLessonIds || classLessonIds.length < 2) {
      throw new Error('At least 2 class lesson IDs are required for merging')
    }

    try {
      console.log(`Starting merge operation for ClassLessons: [${classLessonIds.join(', ')}]`)
      console.log(`Mode: ${dryRun ? 'DRY RUN' : 'ACTUAL EXECUTION'}`)

      // 1. verify if all classLessonIds exist
      const classLessons = await this.classLessonRepository.find({
        where: classLessonIds.map((id) => ({ id })),
        relations: ['course', 'class', 'instructor', 'locationRoom'],
        order: { id: 'ASC' },
      })

      if (classLessons.length !== classLessonIds.length) {
        const foundIds = classLessons.map((cl) => cl.id)
        const missingIds = classLessonIds.filter((id) => !foundIds.includes(id))
        throw new Error(`ClassLesson not found for IDs: [${missingIds.join(', ')}]`)
      }

      const primaryClassLesson = classLessons[0] // use the first one as the primary record
      const classLessonsToMerge = classLessons.slice(1) // the rest to be merged

      result.primaryClassLessonId = primaryClassLesson.id
      result.mergedClassLessonIds = classLessonsToMerge.map((cl) => cl.id)

      console.log(
        `Primary ClassLesson: ${primaryClassLesson.id} (${
          primaryClassLesson.course?.name || 'N/A'
        })`
      )
      console.log(`ClassLessons to merge: [${result.mergedClassLessonIds.join(', ')}]`)

      // 2. display the ClassLesson information that will be merged
      console.log('\n=== ClassLesson Details ===')
      classLessons.forEach((cl, index) => {
        console.log(`${index === 0 ? '[PRIMARY]' : '[TO MERGE]'} ClassLesson ${cl.id}:`)
        console.log(`  - Course: ${cl.course?.name || 'N/A'}`)
        console.log(`  - Class: ${cl.class?.name || 'N/A'}`)
        console.log(`  - Time: ${cl.startTime} - ${cl.endTime}`)
        console.log(`  - Instructor: ${cl.instructor?.firstName || 'N/A'}`)
        console.log(`  - Location: ${cl.locationRoom?.name || 'N/A'}`)
      })

      if (!dryRun) {
        await this.entityManager.transaction(async (transactionalEntityManager) => {
          // 3. update classLessonId reference in StudentLesson table
          for (const classLessonToMerge of classLessonsToMerge) {
            // update direct classLessonId reference
            const updateResult1 = await transactionalEntityManager.update(
              StudentLesson,
              { classLessonId: classLessonToMerge.id },
              { classLessonId: primaryClassLesson.id }
            )

            // update changeClassLessonId reference
            const updateResult2 = await transactionalEntityManager.update(
              StudentLesson,
              { changeClassLessonId: classLessonToMerge.id },
              { changeClassLessonId: primaryClassLesson.id }
            )

            const updatedCount = (updateResult1.affected || 0) + (updateResult2.affected || 0)
            result.updatedStudentLessonsCount += updatedCount

            console.log(
              `✅ Updated ${updatedCount} StudentLesson records for ClassLesson ${classLessonToMerge.id}`
            )
          }

          // 4. delete the extra ClassLesson records
          const deleteResult = await transactionalEntityManager.delete(
            ClassLesson,
            result.mergedClassLessonIds
          )

          result.deletedClassLessonsCount = deleteResult.affected || 0
          console.log(`✅ Deleted ${result.deletedClassLessonsCount} ClassLesson records`)
        })
      } else {
        // dry run mode: calculate the number of records that will be affected
        let totalStudentLessonsToUpdate = 0
        for (const classLessonId of result.mergedClassLessonIds) {
          const count1 = await this.studentLessonRepository.count({
            where: { classLessonId },
          })
          const count2 = await this.studentLessonRepository.count({
            where: { changeClassLessonId: classLessonId },
          })
          totalStudentLessonsToUpdate += count1 + count2
        }
        result.updatedStudentLessonsCount = totalStudentLessonsToUpdate
        result.deletedClassLessonsCount = result.mergedClassLessonIds.length

        console.log(
          `[DRY RUN] Would update ${result.updatedStudentLessonsCount} StudentLesson records`
        )
        console.log(`[DRY RUN] Would delete ${result.deletedClassLessonsCount} ClassLesson records`)
      }

      result.success = true

      console.log(`\n=== Merge Summary ===`)
      console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTION'}`)
      console.log(`Primary ClassLesson ID: ${result.primaryClassLessonId}`)
      console.log(`Merged ClassLesson IDs: [${result.mergedClassLessonIds.join(', ')}]`)
      console.log(`Updated StudentLesson records: ${result.updatedStudentLessonsCount}`)
      console.log(`Deleted ClassLesson records: ${result.deletedClassLessonsCount}`)

      return result
    } catch (error) {
      console.error('Failed to merge ClassLessons:', error)
      result.errors.push({
        classLessonId: 0,
        error: error.message,
      })
      throw error
    }
  }

  /**
   * Helper function to update all user IDs across related tables
   */
  private async updateUserIdsAcrossTables(
    transactionalEntityManager: EntityManager,
    placeholderUserId: number,
    targetUserId: number
  ): Promise<{
    userAliasesUpdated: number
    enrollCoursesUpdated: number
    invoicesUpdated: number
    studentLessonsUpdated: number
    studentMemosUpdated: number
    requestTimeChangesUpdated: number
    notificationRecordsUpdated: number
    applicantsArrayUpdated: number
  }> {
    // 1. Find user_aliases for this placeholder user
    const userAliases = await transactionalEntityManager
      .createQueryBuilder(UserAlias, 'alias')
      .where('alias.userId = :userId', { userId: placeholderUserId })
      .withDeleted()
      .getMany()

    let userAliasesUpdated = 0
    if (userAliases.length > 0) {
      console.log(`📋 Found ${userAliases.length} user_aliases for user ${placeholderUserId}`)

      for (const alias of userAliases) {
        try {
          await transactionalEntityManager.update(UserAlias, alias.id, {
            userId: targetUserId,
          })
          console.log(
            `✅ Updated user_alias ${alias.id} from user ${placeholderUserId} to user ${targetUserId}`
          )
          userAliasesUpdated++
        } catch (error) {
          console.log(`❌ Failed to update user_alias ${alias.id}: ${error.message}`)
        }
      }
    }

    // 2. Update enroll_courses
    const enrollUpdates = await transactionalEntityManager
      .createQueryBuilder()
      .update(EnrollCourse)
      .set({ userId: targetUserId })
      .where('userId = :userId', { userId: placeholderUserId })
      .execute()

    const enrollCoursesUpdated = enrollUpdates.affected || 0
    console.log(`✅ Updated ${enrollCoursesUpdated} enroll_courses`)

    // 3. Update invoices
    const invoiceUpdates = await transactionalEntityManager
      .createQueryBuilder()
      .update(Invoice)
      .set({ userId: targetUserId })
      .where('userId = :userId', { userId: placeholderUserId })
      .execute()

    const invoicesUpdated = invoiceUpdates.affected || 0
    console.log(`✅ Updated ${invoicesUpdated} invoices`)

    // 4. Update student_lessons
    const studentLessonUpdates = await transactionalEntityManager
      .createQueryBuilder()
      .update(StudentLesson)
      .set({ userId: targetUserId })
      .where('userId = :userId', { userId: placeholderUserId })
      .execute()

    const studentLessonsUpdated = studentLessonUpdates.affected || 0
    console.log(`✅ Updated ${studentLessonsUpdated} student_lessons`)

    // 5. Update student_memos
    const studentMemoUpdates = await transactionalEntityManager
      .createQueryBuilder()
      .update(StudentMemo)
      .set({ userId: targetUserId })
      .where('userId = :userId', { userId: placeholderUserId })
      .execute()

    const studentMemosUpdated = studentMemoUpdates.affected || 0
    console.log(`✅ Updated ${studentMemosUpdated} student_memos`)

    // 6. Update request_time_changes
    const requestTimeChangeUpdates = await transactionalEntityManager
      .createQueryBuilder()
      .update(RequestTimeChange)
      .set({ userId: targetUserId })
      .where('userId = :userId', { userId: placeholderUserId })
      .execute()

    const requestTimeChangesUpdated = requestTimeChangeUpdates.affected || 0
    console.log(`✅ Updated ${requestTimeChangesUpdated} request_time_changes`)

    // 7. Update notification_records
    const notificationRecordUpdates = await transactionalEntityManager
      .createQueryBuilder()
      .update(NotificationRecord)
      .set({ recipientUserId: targetUserId })
      .where('recipientUserId = :userId', { userId: placeholderUserId })
      .execute()

    const notificationRecordsUpdated = notificationRecordUpdates.affected || 0
    console.log(`✅ Updated ${notificationRecordsUpdated} notification_records`)

    // 8. Update invoices applicants array
    const invoicesWithApplicants = await transactionalEntityManager
      .createQueryBuilder(Invoice, 'invoice')
      .where('invoice.userId = :targetUserId', { targetUserId })
      .andWhere('invoice.applicants IS NOT NULL')
      .andWhere('invoice.applicants @> :placeholderUserId::jsonb', {
        placeholderUserId: JSON.stringify([placeholderUserId]),
      })
      .getMany()

    let applicantsArrayUpdated = 0
    for (const invoice of invoicesWithApplicants) {
      try {
        // Replace the placeholder user ID with the target user ID in the applicants array
        const updatedApplicants = invoice.applicants.map((applicantId) =>
          applicantId === placeholderUserId ? targetUserId : applicantId
        )

        await transactionalEntityManager.update(Invoice, invoice.id, {
          applicants: updatedApplicants,
        })

        console.log(
          `✅ Updated invoice ${invoice.id} applicants array: ${JSON.stringify(
            invoice.applicants
          )} → ${JSON.stringify(updatedApplicants)}`
        )
        applicantsArrayUpdated++
      } catch (error) {
        console.log(`❌ Failed to update invoice ${invoice.id} applicants array: ${error.message}`)
      }
    }

    console.log(`✅ Updated ${applicantsArrayUpdated} invoices applicants arrays`)

    return {
      userAliasesUpdated,
      enrollCoursesUpdated,
      invoicesUpdated,
      studentLessonsUpdated,
      studentMemosUpdated,
      requestTimeChangesUpdated,
      notificationRecordsUpdated,
      applicantsArrayUpdated,
    }
  }

  async combineUserAliasesWithSameEmailPatterns(): Promise<{
    consolidated: number
    skipped: number
    total: number
  }> {
    return await this.entityManager.transaction(async (transactionalEntityManager) => {
      try {
        this.logger.log('🔍 Finding user_aliases with email patterns...')

        // Find all user_aliases with email patterns like +1, +2, +3, etc.
        const userAliasesWithPatterns = await this.userAliasesRepository.find({
          where: {
            email: Not(IsNull()),
            user: {
              id: Not(IsNull()),
            },
          },
          relations: {
            user: true,
          },
          withDeleted: true,
        })

        console.log(`📧 Found ${userAliasesWithPatterns.length} user_aliases with email patterns`)

        // Group user_aliases by base email (without +1, +2, etc.)
        const emailGroups = new Map<string, UserAlias[]>()

        for (const alias of userAliasesWithPatterns) {
          const baseEmail = alias.email?.split('@')[0]?.replace(/\+[0-9]+$/, '')
          const emailDomain = alias.email?.split('@')[1]

          if (baseEmail && emailDomain) {
            const fullBaseEmail = `${baseEmail}@${emailDomain}`

            if (!emailGroups.has(fullBaseEmail)) {
              emailGroups.set(fullBaseEmail, [])
            }
            emailGroups.get(fullBaseEmail)!.push(alias)
          }
        }

        console.log(`📊 Found ${emailGroups.size} unique base email groups`)

        let consolidatedCount = 0
        let skippedCount = 0

        console.log(emailGroups)

        for (const [baseEmail, aliases] of emailGroups.entries()) {
          // Check if any user has 8521000 phone pattern
          const hasPlaceholderUserAliases = aliases.some((u) => u.user.phone.startsWith('8521000'))

          if (!hasPlaceholderUserAliases) {
            skippedCount++
            continue
          }

          // Find target user (non-8521000) and placeholder users
          const targetUserAlias = aliases.find((u) => !u.user.phone.startsWith('8521000'))
          const placeholderUserAliases = aliases.filter((u) => u.user.phone.startsWith('8521000'))

          if (!targetUserAlias) {
            console.log(`⚠️ No target user found for ${baseEmail}, skipping...`)
            skippedCount++
            continue
          }

          console.log(`🎯 Target user: ${targetUserAlias.id} (${targetUserAlias.user.email})`)
          console.log(`📱 Placeholder users: ${placeholderUserAliases.map((u) => u.id).join(', ')}`)

          // Process each placeholder user
          for (const placeholderUserAlias of placeholderUserAliases) {
            console.log(`\n🔄 Processing placeholder user: ${placeholderUserAlias.id}`)

            // Check if placeholder user has any student_lessons
            const studentLessonsCount = await transactionalEntityManager
              .createQueryBuilder(StudentLesson, 'lesson')
              .where('lesson.userId = :userId', { userId: placeholderUserAlias.user.id })
              .withDeleted()
              .getCount()

            if (studentLessonsCount === 0) {
              console.log(
                `⏭️ User ${placeholderUserAlias.user.id} has no student lessons, skipping...`
              )
              skippedCount++
              continue
            }

            console.log(
              `✅ User ${placeholderUserAlias.user.id} has ${studentLessonsCount} student lessons, proceeding...`
            )

            const targetUserId = targetUserAlias.userId
            const placeholderUserId = placeholderUserAlias.userId

            // Use helper function to update all user IDs across tables
            await this.updateUserIdsAcrossTables(
              transactionalEntityManager,
              placeholderUserId,
              targetUserId
            )

            consolidatedCount++
          }
        }

        console.log('\n📊 Migration Summary:')
        console.log(`✅ Successfully consolidated: ${consolidatedCount} users`)
        console.log(`⏭️ Skipped: ${skippedCount} users`)
        console.log(`📧 Total email groups processed: ${emailGroups.size}`)
        console.log('🎉 Migration completed successfully')

        return {
          consolidated: consolidatedCount,
          skipped: skippedCount,
          total: emailGroups.size,
        }
      } catch (error) {
        console.error('❌ Migration failed, rolling back:', error)
        throw error
      }
    })
  }

  async combineUserAliasesWithSameName(): Promise<{
    consolidated: number
    skipped: number
    total: number
  }> {
    return await this.entityManager.transaction(async (transactionalEntityManager) => {
      try {
        console.log('🔍 Finding user_aliases with same names...')

        // Find all user_aliases with non-null names
        const userAliasesWithNames = await this.userAliasesRepository.find({
          where: {
            name: Not(IsNull()),
            user: {
              id: Not(IsNull()),
            },
          },
          relations: {
            user: true,
          },
          withDeleted: true,
        })

        console.log(`📝 Found ${userAliasesWithNames.length} user_aliases with names`)

        // Group user_aliases by name (case-insensitive)
        const nameGroups = new Map<string, UserAlias[]>()

        for (const alias of userAliasesWithNames) {
          const normalizedName = alias.name?.toLowerCase().trim()
          if (normalizedName) {
            if (!nameGroups.has(normalizedName)) {
              nameGroups.set(normalizedName, [])
            }
            nameGroups.get(normalizedName)!.push(alias)
          }
        }

        console.log(`📊 Found ${nameGroups.size} unique name groups`)

        // Filter groups that have multiple user_aliases with different user_ids
        const duplicateNameGroups = new Map<string, UserAlias[]>()

        for (const [name, aliases] of nameGroups.entries()) {
          // Get all userIds from user_aliases for this name
          const userIds = aliases.map((a) => a.userId).filter(Boolean)
          const uniqueUserIds = new Set(userIds)

          // Only include if there are multiple different userIds for the same name
          if (uniqueUserIds.size > 1) {
            console.log(
              `📝 Name "${name}" has ${uniqueUserIds.size} different userIds: ${Array.from(
                uniqueUserIds
              ).join(', ')}`
            )
            console.log(
              `   User aliases: ${aliases.map((a) => `ID:${a.id} (userId:${a.userId})`).join(', ')}`
            )
            duplicateNameGroups.set(name, aliases)
          }
        }

        console.log(`📊 Found ${duplicateNameGroups.size} names with multiple users`)

        let consolidatedCount = 0
        let skippedCount = 0
        const userAliasChanges: Array<{ aliasId: number; fromUserId: number; toUserId: number }> =
          []

        for (const [name, aliases] of duplicateNameGroups.entries()) {
          // Check if any user has 8521000 phone pattern
          const hasPlaceholderUser = aliases.some((a) => a.user?.phone.startsWith('8521000'))

          if (!hasPlaceholderUser) {
            console.log(`⚠️ No placeholder user found for name "${name}", skipping...`)
            skippedCount++
            continue
          }

          // Find target user (non-8521000) and placeholder users
          const targetUserAlias = aliases.find((a) => !a.user?.phone.startsWith('8521000'))
          const placeholderUserAliases = aliases.filter((a) => a.user?.phone.startsWith('8521000'))

          if (!targetUserAlias) {
            console.log(`⚠️ No target user found for name "${name}", skipping...`)
            skippedCount++
            continue
          }

          console.log(`🎯 Target user: ${targetUserAlias.user.id} (${targetUserAlias.user.email})`)
          console.log(
            `📱 Placeholder users: ${placeholderUserAliases.map((a) => a.user.id).join(', ')}`
          )

          // Process each placeholder user
          for (const placeholderUserAlias of placeholderUserAliases) {
            console.log(`\n🔄 Processing placeholder user: ${placeholderUserAlias.user.id}`)

            // Check if placeholder user has any student_lessons
            const studentLessonsCount = await transactionalEntityManager
              .createQueryBuilder(StudentLesson, 'lesson')
              .where('lesson.userId = :userId', { userId: placeholderUserAlias.user.id })
              .withDeleted()
              .getCount()

            if (studentLessonsCount === 0) {
              console.log(
                `⏭️ User ${placeholderUserAlias.user.id} has no student lessons, skipping...`
              )
              skippedCount++
              continue
            }

            console.log(
              `✅ User ${placeholderUserAlias.user.id} has ${studentLessonsCount} student lessons, proceeding...`
            )

            const targetUserId = targetUserAlias.user.id
            const placeholderUserId = placeholderUserAlias.user.id

            // 1. Find user_aliases for this placeholder user (for batch update later)
            const userAliases = await transactionalEntityManager
              .createQueryBuilder(UserAlias, 'alias')
              .where('alias.userId = :userId', { userId: placeholderUserId })
              .withDeleted()
              .getMany()

            if (userAliases.length > 0) {
              console.log(
                `📋 Found ${userAliases.length} user_aliases for user ${placeholderUserId}`
              )

              // Record the changes for user_aliases (batch update later)
              for (const alias of userAliases) {
                userAliasChanges.push({
                  aliasId: alias.id,
                  fromUserId: placeholderUserId,
                  toUserId: targetUserId,
                })
              }
            }

            // Use helper function to update all user IDs across tables
            await this.updateUserIdsAcrossTables(
              transactionalEntityManager,
              placeholderUserId,
              targetUserId
            )

            consolidatedCount++
          }
        }

        // Now update all user_aliases
        console.log('\n🔄 Updating user_aliases...')
        for (const change of userAliasChanges) {
          try {
            await transactionalEntityManager.update(UserAlias, change.aliasId, {
              userId: change.toUserId,
            })
            console.log(
              `✅ Updated user_alias ${change.aliasId} from user ${change.fromUserId} to user ${change.toUserId}`
            )
          } catch (error) {
            console.log(`❌ Failed to update user_alias ${change.aliasId}: ${error.message}`)
          }
        }

        console.log('\n📊 Migration Summary:')
        console.log(`✅ Successfully consolidated: ${consolidatedCount} users`)
        console.log(`📋 User_alias changes recorded: ${userAliasChanges.length}`)
        console.log(`⏭️ Skipped: ${skippedCount} name groups`)
        console.log(`📝 Total name groups processed: ${duplicateNameGroups.size}`)
        console.log('🎉 Migration completed successfully')

        return {
          consolidated: consolidatedCount,
          skipped: skippedCount,
          total: duplicateNameGroups.size,
        }
      } catch (error) {
        console.error('❌ Migration failed, rolling back:', error)
        throw error
      }
    })
  }

  async fixInvoiceApplicantsArray(): Promise<{
    fixed: number
    skipped: number
    errors: number
    total: number
  }> {
    return await this.entityManager.transaction(async (transactionalEntityManager) => {
      try {
        console.log('🔍 Checking invoices with applicants array...')

        // Find all invoices that have applicants array
        const invoicesWithApplicants = await transactionalEntityManager.find(Invoice, {
          where: {
            applicants: Not(IsNull()),
          },
          select: ['id', 'userId', 'applicants'],
        })

        console.log(`📧 Found ${invoicesWithApplicants.length} invoices with applicants array`)

        let fixedCount = 0
        let skippedCount = 0
        let errorCount = 0

        for (const invoice of invoicesWithApplicants) {
          try {
            console.log(`\n🔄 Processing invoice ${invoice.id}`)
            console.log(`📋 Current userId: ${invoice.userId}`)
            console.log(`👥 Current applicants: ${JSON.stringify(invoice.applicants)}`)

            // Check if the correct userId is already in the applicants array
            if (
              invoice.applicants.length === 0 ||
              (invoice.applicants && invoice.applicants.includes(invoice.userId))
            ) {
              console.log(`✅ Invoice ${invoice.id} already has correct userId in applicants array`)
              skippedCount++
              continue
            }

            // If applicants array is empty or null, initialize it with the userId
            // if (!invoice.applicants || invoice.applicants.length === 0) {
            //   const updatedApplicants = [invoice.userId]
            //   await transactionalEntityManager.update(Invoice, invoice.id, {
            //     applicants: updatedApplicants,
            //   })
            //   console.log(
            //     `✅ Updated invoice ${invoice.id} with new applicants array: ${JSON.stringify(
            //       updatedApplicants
            //     )}`
            //   )
            //   fixedCount++
            //   continue
            // }

            // Find the closest user ID in the applicants array to replace
            // Strategy: find the user ID that's closest to the correct userId
            let closestUserId = invoice.applicants[0] // Default to first one
            let minDifference = Math.abs(invoice.applicants[0] - invoice.userId)

            for (const applicantId of invoice.applicants) {
              const difference = Math.abs(applicantId - invoice.userId)
              if (difference < minDifference) {
                minDifference = difference
                closestUserId = applicantId
              }
            }

            console.log(
              `🎯 Replacing closest userId ${closestUserId} with correct userId ${invoice.userId}`
            )

            // Replace the closest user ID with the correct userId
            const updatedApplicants = invoice.applicants.map((applicantId) =>
              applicantId === closestUserId ? invoice.userId : applicantId
            )

            await transactionalEntityManager.update(Invoice, invoice.id, {
              applicants: updatedApplicants,
            })

            console.log(
              `✅ Updated invoice ${invoice.id} applicants: ${JSON.stringify(updatedApplicants)}`
            )
            fixedCount++
          } catch (error) {
            console.error(`❌ Error processing invoice ${invoice.id}: ${error.message}`)
            errorCount++
          }
        }

        console.log('\n📊 Migration Summary:')
        console.log(`✅ Successfully fixed: ${fixedCount} invoices`)
        console.log(`⏭️ Skipped (already correct): ${skippedCount} invoices`)
        console.log(`❌ Errors: ${errorCount} invoices`)
        console.log(`📧 Total invoices processed: ${invoicesWithApplicants.length}`)
        console.log('🎉 Migration completed successfully')

        return {
          fixed: fixedCount,
          skipped: skippedCount,
          errors: errorCount,
          total: invoicesWithApplicants.length,
        }
      } catch (error) {
        console.error('❌ Migration failed, rolling back:', error)
        throw error
      }
    })
  }

  async cleanupDuplicateUserAliases(): Promise<{
    totalGroups: number
    duplicatesFound: number
    deletedCount: number
    errors: number
  }> {
    return await this.entityManager.transaction(async (transactionalEntityManager) => {
      try {
        this.logger.log('🧹 Starting cleanup of duplicate user_aliases...')

        // Find all user_aliases with their institution info
        const allUserAliases = await transactionalEntityManager.find(UserAlias, {
          select: ['id', 'userId', 'name', 'email', 'institutionId'],
          withDeleted: true,
        })

        this.logger.log(`📋 Found ${allUserAliases.length} total user_aliases to check`)

        // Group user_aliases by userId and institutionId
        const userInstitutionGroups = new Map<string, UserAlias[]>()

        for (const userAlias of allUserAliases) {
          const key = `${userAlias.userId}-${userAlias.institutionId}`
          if (!userInstitutionGroups.has(key)) {
            userInstitutionGroups.set(key, [])
          }
          userInstitutionGroups.get(key)!.push(userAlias)
        }

        this.logger.log(`📊 Found ${userInstitutionGroups.size} user-institution groups`)

        let duplicatesFound = 0
        let deletedCount = 0
        let errorCount = 0

        for (const [key, userAliases] of userInstitutionGroups.entries()) {
          // Only process groups with more than one user_alias
          if (userAliases.length > 1) {
            const [userId, institutionId] = key.split('-')
            this.logger.log(
              `\n🔍 Found ${userAliases.length} user_aliases for user ${userId} in institution ${institutionId}`
            )

            // Check if this group qualifies for cleanup (same name + email pattern)
            const qualifiedForCleanup = this.checkIfGroupQualifiesForCleanup(userAliases)

            if (qualifiedForCleanup) {
              this.logger.log(
                `✅ Group qualifies for cleanup - same name and email pattern detected`
              )

              duplicatesFound++

              // Check each user_alias for activity and delete only those with NO activity
              for (const userAlias of userAliases) {
                try {
                  // Check if this user_alias is used in ANY table
                  const hasAnyUsage = await this.checkUserAliasUsage(
                    transactionalEntityManager,
                    userAlias.id
                  )

                  if (hasAnyUsage) {
                    this.logger.log(
                      `✅ Keeping user_alias ${userAlias.id} - has activity in other tables`
                    )
                  } else {
                    // Only soft delete if no usage found
                    await transactionalEntityManager.softDelete(UserAlias, userAlias.id)
                    this.logger.log(`🗑️ Soft deleted user_alias ${userAlias.id} - no activity`)
                    deletedCount++
                  }
                } catch (error) {
                  this.logger.error(
                    `❌ Error processing user_alias ${userAlias.id}: ${error.message}`
                  )
                  errorCount++
                }
              }
            } else {
              this.logger.log(
                `⏭️ Group does not qualify for cleanup - different names or no email pattern`
              )
            }
          }
        }

        this.logger.log('\n📊 Cleanup Summary:')
        this.logger.log(`📊 Total user-institution groups: ${userInstitutionGroups.size}`)
        this.logger.log(`🔄 Duplicate groups found: ${duplicatesFound}`)
        this.logger.log(`✅ Successfully deleted: ${deletedCount}`)
        this.logger.log(`❌ Errors: ${errorCount}`)
        this.logger.log('🎉 Cleanup completed successfully')

        return {
          totalGroups: userInstitutionGroups.size,
          duplicatesFound,
          deletedCount,
          errors: errorCount,
        }
      } catch (error) {
        this.logger.error('❌ Cleanup failed, rolling back:', error)
        throw error
      }
    })
  }

  /**
   * Check if a group of user_aliases qualifies for cleanup
   * Must have same name AND (emails are equal OR email follows +1, +2 pattern)
   */
  private checkIfGroupQualifiesForCleanup(userAliases: UserAlias[]): boolean {
    if (userAliases.length < 2) {
      return false
    }

    // Check if all user_aliases have the same name
    const firstUserAlias = userAliases[0]
    const allSameName = userAliases.every((userAlias) => userAlias.name === firstUserAlias.name)

    if (!allSameName) {
      this.logger.log(`  ❌ Names are different: ${userAliases.map((ua) => ua.name).join(', ')}`)
      return false
    }

    this.logger.log(`  ✅ All names are the same: "${firstUserAlias.name}"`)

    // Check if emails follow the +1, +2 pattern
    const emails = userAliases.map((ua) => ua.email).filter((email) => email)

    if (emails.length < 2) {
      this.logger.log(`  ❌ Not enough emails to check pattern (${emails.length} emails)`)
      return false
    }

    // Check if all emails are exactly the same
    const allEmailsEqual = emails.every((email) => email === emails[0])
    if (allEmailsEqual) {
      this.logger.log(`  ✅ All emails are exactly the same: "${emails[0]}"`)
      return true
    }

    // Find the base email (without +1, +2, etc.)
    const baseEmail = this.extractBaseEmail(emails)

    if (!baseEmail) {
      this.logger.log(`  ❌ No consistent base email pattern found`)
      return false
    }

    // Check if all emails follow the pattern: baseEmail, baseEmail+1, baseEmail+2, etc.
    const expectedEmails = this.generateExpectedEmails(baseEmail, emails.length)
    const emailsMatchPattern = this.arraysEqual(emails.sort(), expectedEmails.sort())

    if (emailsMatchPattern) {
      this.logger.log(`  ✅ Email pattern confirmed: ${emails.join(', ')}`)
      return true
    } else {
      this.logger.log(`  ❌ Email pattern mismatch. Found: ${emails.join(', ')}`)
      return false
    }
  }

  /**
   * Extract base email from a list of emails that follow +1, +2 pattern
   */
  private extractBaseEmail(emails: string[]): string | null {
    if (emails.length === 0) return null

    // Find the email without +number suffix
    const baseEmail = emails.find((email) => !email.includes('+'))

    if (baseEmail) {
      return baseEmail
    }

    // If no base email found, try to extract from +1, +2 pattern
    const emailWithPlus = emails.find((email) => email.includes('+'))
    if (emailWithPlus) {
      const match = emailWithPlus.match(/^(.+)\+\d+@(.+)$/)
      if (match) {
        return `${match[1]}@${match[2]}`
      }
    }

    return null
  }

  /**
   * Generate expected emails based on base email and count
   */
  private generateExpectedEmails(baseEmail: string, count: number): string[] {
    const emails: string[] = []

    for (let i = 0; i < count; i++) {
      if (i === 0) {
        emails.push(baseEmail)
      } else {
        const [localPart, domain] = baseEmail.split('@')
        emails.push(`${localPart}+${i}@${domain}`)
      }
    }

    return emails
  }

  /**
   * Compare two arrays for equality
   */
  private arraysEqual(a: string[], b: string[]): boolean {
    if (a.length !== b.length) return false
    return a.every((val, index) => val === b[index])
  }

  /**
   * Check if a user_alias has any usage in any table
   */
  private async checkUserAliasUsage(
    transactionalEntityManager: EntityManager,
    userAliasId: number
  ): Promise<boolean> {
    // Check enroll_courses
    const enrollCoursesCount = await transactionalEntityManager
      .createQueryBuilder(EnrollCourse, 'enroll')
      .where('enroll.userId = :userAliasId', { userAliasId })
      .withDeleted()
      .getCount()

    if (enrollCoursesCount > 0) {
      this.logger.log(`    📚 Found ${enrollCoursesCount} enroll_courses`)
      return true
    }

    // Check invoices
    const invoicesCount = await transactionalEntityManager
      .createQueryBuilder(Invoice, 'invoice')
      .where('invoice.userId = :userAliasId', { userAliasId })
      .withDeleted()
      .getCount()

    if (invoicesCount > 0) {
      this.logger.log(`    💰 Found ${invoicesCount} invoices`)
      return true
    }

    // Check student_forms
    const studentFormsCount = await transactionalEntityManager
      .createQueryBuilder(StudentForm, 'form')
      .where('form.userId = :userAliasId', { userAliasId })
      .withDeleted()
      .getCount()

    if (studentFormsCount > 0) {
      this.logger.log(`    📝 Found ${studentFormsCount} student_forms`)
      return true
    }

    // Check student_memos
    const studentMemosCount = await transactionalEntityManager
      .createQueryBuilder(StudentMemo, 'memo')
      .where('memo.userId = :userAliasId', { userAliasId })
      .withDeleted()
      .getCount()

    if (studentMemosCount > 0) {
      this.logger.log(`    📝 Found ${studentMemosCount} student_memos`)
      return true
    }

    // Check student_lessons
    const studentLessonsCount = await transactionalEntityManager
      .createQueryBuilder(StudentLesson, 'lesson')
      .where('lesson.userId = :userAliasId', { userAliasId })
      .withDeleted()
      .getCount()

    if (studentLessonsCount > 0) {
      this.logger.log(`    📚 Found ${studentLessonsCount} student_lessons`)
      return true
    }

    // Check request_time_changes
    const requestTimeChangesCount = await transactionalEntityManager
      .createQueryBuilder(RequestTimeChange, 'request')
      .where('request.userId = :userAliasId', { userAliasId })
      .withDeleted()
      .getCount()

    if (requestTimeChangesCount > 0) {
      this.logger.log(`    ⏰ Found ${requestTimeChangesCount} request_time_changes`)
      return true
    }

    // Check notification_records
    const notificationRecordsCount = await transactionalEntityManager
      .createQueryBuilder(NotificationRecord, 'notification')
      .where('notification.recipientUserId = :userAliasId', { userAliasId })
      .withDeleted()
      .getCount()

    if (notificationRecordsCount > 0) {
      this.logger.log(`    🔔 Found ${notificationRecordsCount} notification_records`)
      return true
    }

    // Check if user_alias is referenced in invoices applicants array
    const invoicesWithApplicantsCount = await transactionalEntityManager
      .createQueryBuilder(Invoice, 'invoice')
      .where('invoice.applicants @> :userAliasId::jsonb', {
        userAliasId: JSON.stringify([userAliasId]),
      })
      .withDeleted()
      .getCount()

    if (invoicesWithApplicantsCount > 0) {
      this.logger.log(
        `    💰 Found ${invoicesWithApplicantsCount} invoices with user in applicants array`
      )
      return true
    }

    this.logger.log(`    ✅ No usage found - safe to delete`)
    return false
  }

  async addStudentLessonsForPeriodLesson(
    periodId: number,
    periodLessonId: number
  ): Promise<{
    createdCount: number
    classLessonsProcessed: number
    errors: Array<{ enrollCourseId: number; classLessonId: number; error: string }>
  }> {
    const result = {
      createdCount: 0,
      classLessonsProcessed: 0,
      errors: [],
    }

    try {
      console.log(
        `Starting add student lessons for period lesson ${periodLessonId} in period ${periodId}`
      )

      // 1. Find all class lessons with the specified periodLessonId
      const classLessons = await this.classLessonRepository.find({
        where: { lessonId: periodLessonId },
        relations: ['class', 'course'],
      })

      console.log(
        `Found ${classLessons.length} class lessons with periodLessonId ${periodLessonId}`
      )

      if (classLessons.length === 0) {
        console.log('No class lessons found. Exiting.')
        return result
      }

      result.classLessonsProcessed = classLessons.length

      // 2. For each class lesson, find related enroll courses and student schedules
      for (const classLesson of classLessons) {
        try {
          // Find enroll courses for this class
          const enrollCourses = await this.enrollCourseRepository.find({
            where: {
              courseId: classLesson.courseId,
              institutionId: classLesson.institutionId,
            },
            relations: ['course'],
          })

          console.log(
            `Found ${enrollCourses.length} enroll courses for class lesson ${classLesson.id} (course: ${classLesson.courseId}, institution: ${classLesson.institutionId})`
          )

          // 3. For each enroll course, find student schedules with matching periodId
          for (const enrollCourse of enrollCourses) {
            try {
              // Find student schedules for this enroll course with matching periodId
              const studentSchedules = await this.entityManager.query(
                `
                SELECT ss.* 
                FROM student_schedule ss
                WHERE ss.enroll_course_id = $1 
                  AND ss.period_id = $2
                  AND ss.deleted_at IS NULL
                `,
                [enrollCourse.id, periodId]
              )

              console.log(
                `Found ${studentSchedules.length} student schedules for enroll course ${enrollCourse.id} with period ${periodId}`
              )

              // 4. For each student schedule, create a student lesson if it doesn't exist
              for (const studentSchedule of studentSchedules) {
                try {
                  // Check if student lesson already exists for this class lesson and student schedule
                  const existingStudentLesson = await this.studentLessonRepository.findOne({
                    where: {
                      classLessonId: classLesson.id,
                      studentScheduleId: studentSchedule.id,
                    },
                  })

                  if (existingStudentLesson) {
                    console.log(
                      `Student lesson already exists for class lesson ${classLesson.id} and student schedule ${studentSchedule.id}. Skipping.`
                    )
                    continue
                  }

                  // Create new student lesson
                  const newStudentLesson = this.studentLessonRepository.create({
                    institutionId: classLesson.institutionId,
                    courseId: classLesson.courseId,
                    enrollCourseId: enrollCourse.id,
                    classId: classLesson.classId,
                    userId: enrollCourse.userId,
                    classLessonId: classLesson.id,
                    studentScheduleId: studentSchedule.id,
                    startTime: classLesson.changeStartTime || classLesson.startTime,
                    endTime: classLesson.changeEndTime || classLesson.endTime,
                    isCheckin: false,
                    isExtra: false,
                    attendance: AttendanceStatus.PENDING,
                  })

                  await this.studentLessonRepository.save(newStudentLesson)
                  result.createdCount++

                  console.log(
                    `✅ Created student lesson ${newStudentLesson.id} for class lesson ${classLesson.id}, enroll course ${enrollCourse.id}, student schedule ${studentSchedule.id}`
                  )
                } catch (error) {
                  const errorMsg = `Failed to create student lesson for student schedule ${studentSchedule.id}: ${error.message}`
                  console.error(errorMsg)
                  result.errors.push({
                    enrollCourseId: enrollCourse.id,
                    classLessonId: classLesson.id,
                    error: errorMsg,
                  })
                }
              }
            } catch (error) {
              const errorMsg = `Failed to process enroll course ${enrollCourse.id}: ${error.message}`
              console.error(errorMsg)
              result.errors.push({
                enrollCourseId: enrollCourse.id,
                classLessonId: classLesson.id,
                error: errorMsg,
              })
            }
          }
        } catch (error) {
          const errorMsg = `Failed to process class lesson ${classLesson.id}: ${error.message}`
          console.error(errorMsg)
          result.errors.push({
            enrollCourseId: 0,
            classLessonId: classLesson.id,
            error: errorMsg,
          })
        }
      }

      console.log(`\n=== Operation Summary ===`)
      console.log(`Class lessons processed: ${result.classLessonsProcessed}`)
      console.log(`Student lessons created: ${result.createdCount}`)
      console.log(`Errors: ${result.errors.length}`)

      return result
    } catch (error) {
      console.error('Failed to add student lessons for period lesson:', error)
      result.errors.push({
        enrollCourseId: 0,
        classLessonId: 0,
        error: error.message,
      })
      throw error
    }
  }

  async addStudentLessonsForClassLesson(
    periodId: number,
    classLessonId: number
  ): Promise<{
    createdCount: number
    studentSchedulesProcessed: number
    updatedFirstLessonIds: number
    errors: Array<{ studentScheduleId: number; error: string }>
  }> {
    const result = {
      createdCount: 0,
      studentSchedulesProcessed: 0,
      updatedFirstLessonIds: 0,
      errors: [],
    }

    try {
      console.log(
        `Starting add student lessons for class lesson ${classLessonId} for period ${periodId}`
      )

      // 1. Find the class lesson with the specified classLessonId
      const classLesson = await this.classLessonRepository.findOne({
        where: { id: classLessonId },
        relations: ['class', 'course'],
      })

      if (!classLesson) {
        throw new Error(`Class lesson ${classLessonId} not found`)
      }

      console.log(`Found class lesson ${classLessonId}`)
      console.log(
        `Class lesson start time: ${classLesson.startTime}, end time: ${classLesson.endTime}`
      )

      // 2. Find all student schedules with the specified period_id
      const studentSchedules = await this.entityManager.query(
        `
        SELECT ss.* 
        FROM student_schedule ss
        WHERE ss.period_id = $1 
          AND ss.deleted_at IS NULL
        `,
        [periodId]
      )

      console.log(`Found ${studentSchedules.length} student schedules with period ${periodId}`)

      if (studentSchedules.length === 0) {
        console.log('No student schedules found. Exiting.')
        return result
      }

      result.studentSchedulesProcessed = studentSchedules.length

      // 3. For each student schedule, create a student lesson if it doesn't exist
      for (const studentSchedule of studentSchedules) {
        try {
          // Check if student lesson already exists for this class lesson and student schedule
          const existingStudentLesson = await this.studentLessonRepository.findOne({
            where: {
              classLessonId: classLesson.id,
              studentScheduleId: studentSchedule.id,
            },
          })

          if (existingStudentLesson) {
            console.log(
              `Student lesson already exists for class lesson ${classLesson.id} and student schedule ${studentSchedule.id}. Skipping.`
            )
            continue
          }

          // Find the enroll course for this student schedule
          const enrollCourse = await this.enrollCourseRepository.findOneBy({
            id: studentSchedule.enrollCourseId,
          })

          if (!enrollCourse) {
            const errorMsg = `Enroll course ${studentSchedule.enrollCourseId} not found`
            console.error(errorMsg)
            result.errors.push({
              studentScheduleId: studentSchedule.id,
              error: errorMsg,
            })
            continue
          }

          // Create new student lesson with the same start_time and end_time as the class lesson
          const newStudentLesson = this.studentLessonRepository.create({
            institutionId: classLesson.institutionId,
            courseId: classLesson.courseId,
            enrollCourseId: enrollCourse.id,
            classId: classLesson.classId,
            userId: enrollCourse.userId,
            classLessonId: classLesson.id,
            studentScheduleId: studentSchedule.id,
            startTime: classLesson.changeStartTime || classLesson.startTime,
            endTime: classLesson.changeEndTime || classLesson.endTime,
            isCheckin: false,
            isExtra: false,
            attendance: AttendanceStatus.PENDING,
          })

          await this.studentLessonRepository.save(newStudentLesson)
          result.createdCount++

          console.log(
            `✅ Created student lesson ${newStudentLesson.id} for class lesson ${classLesson.id}, student schedule ${studentSchedule.id}, enroll course ${enrollCourse.id}`
          )

          // 4. Update first_student_lesson_id if it's not set
          if (!studentSchedule.firstStudentLessonId) {
            await this.entityManager.query(
              `
              UPDATE student_schedule 
              SET first_student_lesson_id = $1
              WHERE id = $2
              `,
              [newStudentLesson.id, studentSchedule.id]
            )
            result.updatedFirstLessonIds++
            console.log(
              `Updated first_student_lesson_id to ${newStudentLesson.id} for student schedule ${studentSchedule.id}`
            )
          }
        } catch (error) {
          const errorMsg = `Failed to create student lesson for student schedule ${studentSchedule.id}: ${error.message}`
          console.error(errorMsg)
          result.errors.push({
            studentScheduleId: studentSchedule.id,
            error: errorMsg,
          })
        }
      }

      console.log(`\n=== Operation Summary ===`)
      console.log(`Student schedules processed: ${result.studentSchedulesProcessed}`)
      console.log(`Student lessons created: ${result.createdCount}`)
      console.log(`Updated first lesson IDs: ${result.updatedFirstLessonIds}`)
      console.log(`Errors: ${result.errors.length}`)

      return result
    } catch (error) {
      console.error('Failed to add student lessons for class lesson:', error)
      result.errors.push({
        studentScheduleId: 0,
        error: error.message,
      })
      throw error
    }
  }
}
