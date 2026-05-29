/* eslint-disable prettier/prettier */
// eslint-disable-next-line simple-import-sort/imports
import {
  CreateAndUpdateStudentContactInfoDto,
  CreateOrUpdateStudentContactInfoV2Dto,
  StudentNotificationSettings,
} from '@/application/admin/student-onboard/dtos/student-memo.dto'
import {
  AddTeachingServiceDto,
  ChangeStudentLessonDto,
  CreateExtraLessonDto,
  CreateStudentDto,
  DbMapping,
  DeleteTeachingServiceDto,
  GetEnrolledLessonsDto,
  GetStudentDetailResponseDto,
  GetStudentFormFieldsDto,
  GetStudentFormResponseDto,
  GetTeachingServiceOptDto,
  ImportCommonField,
  ImportStudentField,
  ImportStuDto,
  ImportStuResponseDto,
  StudentAllLessonsReponseDto,
  GetTeachingServiceByInvoiceDto,
  StudentAttendanceDataResponse,
  StudentChangeLessonDto,
  StudentChangeLessonOptDto,
  StudentCouponDto,
  StudentListWithSelectedFieldsDto,
  StudentOnbDeleteDto,
  StudentOnbDetailtByAliasIdDto,
  StudentOnbFilterListDto,
  StudentOnbListDto,
  MergeStudentDto,
  UpdateEnrollCourseDto,
  UpdateLessonAttendanceDto,
  UpdateStatusDto,
  UpdateStudentFormDto,
} from '@/application/admin/student-onboard/dtos/student-onboard.dto'
import {
  MetaRef,
  PayNowResponse,
  StudentCreateEnrollCourseDto,
  StudentEnrollCourseResponse,
  StudentMetaRefExtended,
} from '@/application/student/enroll-courses/dto/create-enroll-course.dto'
import { StudentUpdateEnrollCourseMetaDto } from '@/application/student/enroll-courses/dto/update-enroll-course.dto'
import { ApiError } from '@/common/api-formats/api-error'
import { KEY_DEFAULT } from '@/common/constants'
import { EmailService } from '@/domain/external/email.service'
import { ClassService } from '@/domain/service/class.service'
import { CouponsService } from '@/domain/service/coupons.service'
import { RecurringSchedulesService } from '@/domain/service/course-recurring-schedules.service'
import { CoursesService } from '@/domain/service/courses.service'
import { EnrollCoursesService } from '@/domain/service/enroll-courses.service'
import { RecordLogService } from '@/domain/service/record-log.service'
import { CourseErrorMessage, EnrollCourseErrorMessage } from '@/exceptions/error-message/course'
import { ErrorCode, ImportCSVError } from '@/exceptions/error-message/errors'
import { InvoiceErrorMessage } from '@/exceptions/error-message/invoice'
import { SiteErrorMessage } from '@/exceptions/error-message/site'
import { StudentErrorMessage, UserErrorMessage } from '@/exceptions/error-message/user'
import { ClassLesson } from '@/models/class-lessons.entity'
import { ClassEntity } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import { CommonField, FieldMapping, FieldStatus, FieldType } from '@/models/common-field.entity'
import { RecurringSchedulesRepository } from '@/models/course-recurring-schedules.entity'
import { RegularPeriodsRepository } from '@/models/course-regular-periods.entity'
import { Course } from '@/models/courses.entity'
import { CoursesRepository } from '@/models/courses.repository'
import { LessonString } from '@/models/custom-types/lesson-string'
import { EnrollClassMapping, EnrollCourse, EnrollIntoInfo } from '@/models/enroll-courses.entity'
import { EnrollCourseRepository } from '@/models/enroll-courses.repository'
import {
  FilterMatchMode,
  HandleImportError,
  Operator,
  StudentPrimaryIdentifier,
  WeekDayEnum,
} from '@/models/enums'
import {
  ChargeFrequency,
  ClassTypeEnum,
  ImportRequiredFields,
  PaymentMethod,
  RecordLogType,
} from '@/models/enums/'
import { AttendanceStatus, EnrollConfirmStatus } from '@/models/enums/status'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { Invoice } from '@/models/invoice.entity'
import { InvoiceRepository } from '@/models/invoice.repository'
import { RecordLog } from '@/models/record-log.entity'
import { RepeatFormatsRepository } from '@/models/repeat-formats.entity'
import { SitesRepository } from '@/models/sites.repository'
import { StudentForm, StudentFormMetadata } from '@/models/student-form.entity'
import { StudentLesson } from '@/models/student-lesson.entity'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { StudentSchedule, StudentScheduleType } from '@/models/student-schedule.entity'
import { StudentScheduleRepository } from '@/models/student-schedule.repository'
import { UserRole } from '@/models/user-role.entity'
import { UserRolesRepository } from '@/models/user-roles.repository'
import { User } from '@/models/user.entity'
import { UsersRepository } from '@/models/users.repository'
import {
  getNumberIdFromFieldId,
  lessonObjectToString,
  parseStringToArray,
  transformEmail,
  transformPhone,
} from '@/utils/string.utils'
import * as bcrypt from 'bcryptjs'

import { ClassLessonService } from './class-lesson.service'

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { InjectRepository } from '@nestjs/typeorm'
import { instanceToInstance } from 'class-transformer'
import { randomUUID } from 'crypto'
import { utcToZonedTime } from 'date-fns-tz'

import { SupportedType } from '@/application/admin/custom-messages/dto/custom-message.dto'
import { ChangeLessonEmailDTO } from '@/application/admin/setting-notifications/setting-notifications.dto'
import { AddToParentGroupDto } from '@/application/admin/student-onboard/dtos/add-to-parent-group.dto'
import { ChangeParentGroupDto } from '@/application/admin/student-onboard/dtos/change-parent-group.dto'
import { RemoveFromParentGroupDto } from '@/application/admin/student-onboard/dtos/remove-from-parent-group.dto'
import { SetParentAccountDto } from '@/application/admin/student-onboard/dtos/set-parent-account.dto'
import { AppointmentRepository } from '@/models/appointment.entity'
import { ClassPriceOptionRepository } from '@/models/class-price-options.repository'
import { CommonFieldRepository } from '@/models/common-field.repository'
import { CommonFormRepository } from '@/models/common-form.repository'
import { CreditTransactions } from '@/models/credit-transactions.entity'
import { CreditTransactionsRepository } from '@/models/credit-transactions.repository'
import { DocumentCampaignRecipients } from '@/models/document-campaign-recipients.entity'
import { Institution } from '@/models/institutions.entity'
import { NotificationStatus } from '@/models/notification-record.entity'
import { PaymentEvidenceRepository } from '@/models/payment-evidence.repository'
import { PeriodLessons } from '@/models/period-lessons.entity'
import { DEFAULT_BASE_USER_QUOTA } from '@/common/constants/default-quotas.constant'
import { UserAlias } from '@/models/user-aliases.entity'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { buildSuccessPaymentLink } from '@/utils/payment-link.utils'
import { replaceContentVariables } from '@/utils/shallow.utils'
import {
  filterTimeslotStringsWithinPeriod,
  getCurrentTimeStamp,
  isTimeslotWithinPeriod,
  toISOStringFromExcelOrString,
} from '@/utils/time.utils'
import * as fs from 'fs'
import * as _ from 'lodash'
import * as path from 'path'
import {
  Brackets,
  DataSource,
  FindOptionsWhere,
  In,
  Like,
  Not,
  Repository,
} from 'typeorm'
import * as XLSX from 'xlsx'
import { AppointmentService } from './appointment.service'
import { AuthService } from './auth.service'
import { ClassPriceOptionService } from './class-price-option.service'
import { CreditManagementService } from './credit-management.service'
import { CustomMessageService } from './custom-message.service'
import { EnrollmentFormService } from './enrollment-form.service'
import { NotificationRecordService } from './notification-log.service'
import { PaymentEvidenceService } from './payment-evidence.service'
import { StudentNotifSettingService } from './student-notif-setting.service'
import { UsersService } from './users.service'
import { WhatsappWebService } from './whatsapp-web.service'

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dayjs = require('dayjs')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const utc = require('dayjs/plugin/utc')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const timezone = require('dayjs/plugin/timezone')
// eslint-disable-next-line @typescript-eslint/no-var-requires
const customParseFormat = require('dayjs/plugin/customParseFormat')

dayjs.extend(customParseFormat)
dayjs.extend(utc)
dayjs.extend(timezone)

import 'dayjs/plugin/customParseFormat'
import 'dayjs/plugin/timezone'
import 'dayjs/plugin/utc'

@Injectable()
export class StudentOnbService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly enrollCourseRepository: EnrollCourseRepository,
    private readonly userRepository: UsersRepository,
    private readonly userAliasesRepository: UserAliasesRepository,
    private readonly userRoleRepository: UserRolesRepository,
    private readonly courseRepository: CoursesRepository,
    private readonly classRepository: ClassRepository,
    @InjectRepository(ClassLesson)
    private classLessonRepository: Repository<ClassLesson>,
    private readonly studentLessonRepository: StudentLessonRepository,
    @InjectRepository(RecordLog)
    private readonly recordLogRepository: Repository<RecordLog>,
    @InjectRepository(StudentForm)
    private readonly studentFormRepository: Repository<StudentForm>,
    private readonly commonFieldRepository: CommonFieldRepository,
    private readonly commonFormRepository: CommonFormRepository,
    private readonly recurringScheduleRepository: RecurringSchedulesRepository,
    private readonly regularPeriodsRepository: RegularPeriodsRepository,
    private readonly repeatFormatsRepository: RepeatFormatsRepository,
    private readonly enrollCourseService: EnrollCoursesService,
    private readonly couponsService: CouponsService,
    private readonly emailService: EmailService,
    private readonly classService: ClassService,
    private readonly logService: RecordLogService,
    private readonly classLessonService: ClassLessonService,
    private readonly recurringSchedulesService: RecurringSchedulesService,
    private readonly studentScheduleRepository: StudentScheduleRepository,
    private readonly jwtService: JwtService,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly sitesRepository: SitesRepository,
    private readonly coursesService: CoursesService,
    private readonly enrollmentFormService: EnrollmentFormService,
    private readonly paymentEvidenceRepository: PaymentEvidenceRepository,
    private readonly customMessageService: CustomMessageService,
    private readonly whatsappWebService: WhatsappWebService,
    private readonly notificationRecordService: NotificationRecordService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly appointmentService: AppointmentService,
    private readonly appointmentRepository: AppointmentRepository,
    private readonly studentNotifSettingService: StudentNotifSettingService,
    private readonly classPriceOptionRepository: ClassPriceOptionRepository,
    private readonly classPriceOptionService: ClassPriceOptionService,
    private readonly paymentEvidenceService: PaymentEvidenceService,
    private readonly institutionsRepository: InstitutionsRepository,
    private readonly creditTransactionsRepository: CreditTransactionsRepository,
    private readonly creditManagementService: CreditManagementService
  ) {}
  private async isWhatsappEnabled(
    userId: number,
    institutionId: number,
    type: SupportedType
  ): Promise<boolean> {
    const setting = await this.studentNotifSettingService.getByStudentAndType(
      userId,
      institutionId,
      type
    )
    return !setting || setting.whatsapp
  }

  async getAllStudentsInInstitution(
    params: StudentOnbListDto,
    payload?: StudentListWithSelectedFieldsDto
  ): Promise<UserAlias[]> {
    const userRoles = await this.userRoleRepository.find({
      where: {
        institutionId: params.institutionId,
        siteId: params.siteId,
        isStudent: true,
      },
    })

    const userRolesIds = userRoles.map((ur) => ur.userId)
    let whereClause: FindOptionsWhere<UserAlias> = {
      institutionId: params.institutionId,
      userId: In(userRolesIds),
      // enrollCourses: {
      //   id: Not(IsNull()),
      // },
    }
    if (payload?.search) {
      whereClause = {
        ...whereClause,
        user: [
          { email: Like(`%${payload.search}%`) },
          { phone: Like(`%${payload.search}%`) },
          { firstName: Like(`%${payload.search}%`) },
        ],
      }
    }

    const userAliases = await this.userAliasesRepository.find({
      where: whereClause,
      relations: {
        user: true,
        enrollCourses: {
          studentSchedule: {
            class: true,
          },
          course: true,
          invoice: true,
        },
      },
      select: payload?.select,
    })
    return userAliases
  }

  async getAllStudentsInInstitutionQueryBuilder(
    params: StudentOnbListDto
  ): Promise<GetStudentDetailResponseDto[]> {
    // First get eligible student user IDs
    const userRoles = await this.userRoleRepository.find({
      where: {
        institutionId: params.institutionId,
        siteId: params.siteId,
        isStudent: true,
      },
      select: ['userId'], // Only select userId to minimize data transfer
    })

    const userRolesIds = userRoles.map((ur) => ur.userId)

    if (userRolesIds.length === 0) return []

    // Build the main query using QueryBuilder
    const query = this.userAliasesRepository
      .createQueryBuilder('userAlias')
      .leftJoinAndSelect('userAlias.user', 'user')
      .leftJoinAndSelect('userAlias.parentUserAlias', 'parentUserAlias')
      .leftJoinAndSelect('parentUserAlias.user', 'parentUser')
      .leftJoinAndSelect('userAlias.enrollCourses', 'enrollCourse')
      .leftJoinAndSelect('enrollCourse.course', 'course')
      .leftJoinAndSelect('enrollCourse.studentSchedule', 'studentSchedule')
      .leftJoinAndSelect('studentSchedule.class', 'class')
      .leftJoinAndSelect('enrollCourse.invoice', 'invoice')
      .leftJoinAndSelect('invoice.createdByUser', 'createdByUser')
      .leftJoinAndSelect('userAlias.studentForms', 'studentForms')
      .leftJoinAndSelect('studentSchedule.studentLessons', 'studentLessons')
      .where('userAlias.institutionId = :institutionId', { institutionId: params.institutionId })
      .andWhere('userAlias.userId IN (:...userRolesIds)', { userRolesIds })
      .andWhere(
        new Brackets((qb) => {
          qb.where('invoice.id IS NULL').orWhere('invoice.institutionId = :institutionId', {
            institutionId: params.institutionId,
          })
        })
      )
      .andWhere(
        new Brackets((qb) => {
          if (params.userId) {
            qb.where('class.instructorId = :userId', {
              userId: params.userId,
            })
          } else {
            // pass and allow all
            qb.where('1=1')
          }
        })
      )

      .select([
        'userAlias.id',
        'userAlias.userId',
        'userAlias.name',
        'userAlias.email',
        'userAlias.isStudentParent',
        'userAlias.childOfUserAliasId',
        'userAlias.remarks',

        'studentForms.formFieldId',
        'studentForms.formFieldType',
        'studentForms.formFieldValue',

        'user.id',
        'user.phone',
        'user.status',
        'user.createdAt',
        'user.updatedAt',

        'enrollCourse.id',
        'enrollCourse.courseId',
        'enrollCourse.institutionId',

        // 'enrollCourse.registrationForm',

        'invoice.id',
        'invoice.paymentState',
        'invoice.proofToken',
        'invoice.currency',
        'invoice.payAmount',
        'invoice.createdAt',
        'invoice.updatedAt',
        'invoice.usedBalance',
        'invoice.createdBy',

        'createdByUser.id',
        'createdByUser.email',

        'course.id',
        'course.name',
        'course.path',

        'studentSchedule.id',
        'studentSchedule.invoiceId',

        'studentLessons.id',
        'studentLessons.attendance',
        'studentLessons.changeEndTime',
        'studentLessons.endTime',

        'class.id',
        'class.type',
        'class.name',

        // Parent data
        'parentUserAlias.id',
        'parentUserAlias.name',
        'parentUserAlias.email',
        'parentUser.id',
        'parentUser.phone',
      ])
      // Add index hints for better performance
      .useIndex('IDX_user_alias_institution_id')
      .useIndex('IDX_user_alias_user_id')
      .useIndex('IX_invoices_institution_id')
      .useIndex('IX_enroll_courses_course_id')

    // Optional: Add caching if the data doesn't change frequently
    if (process.env.NODE_ENV === 'production') {
      query.cache(60000) // Cache for 1 minute
    }

    return await query.getMany()
  }

  async getAllStudentsInInstitutionQueryBuilderWithStudentLessons(
    // if there is userId inside the function, it means the user is only getting his own students
    params: StudentOnbListDto
  ): Promise<GetStudentDetailResponseDto[]> {
    // First get eligible student user IDs
    const userRoles = await this.userRoleRepository.find({
      where: {
        institutionId: params.institutionId,
        siteId: params.siteId,
        isStudent: true,
      },
      select: ['userId'], // Only select userId to minimize data transfer
    })

    const userRolesIds = userRoles.map((ur) => ur.userId)

    if (userRolesIds.length === 0) return []

    // Build the main query using QueryBuilder
    const query = this.userAliasesRepository
      .createQueryBuilder('userAlias')
      .leftJoinAndSelect('userAlias.user', 'user')
      .leftJoinAndSelect('user.enrollCourses', 'enrollCourses')
      .leftJoinAndSelect('enrollCourses.course', 'course')
      .leftJoinAndSelect('enrollCourses.studentSchedule', 'studentSchedules')
      .leftJoinAndSelect('studentSchedules.class', 'class')
      .leftJoinAndSelect('studentSchedules.invoice', 'invoice')
      .leftJoinAndSelect('studentSchedules.studentLessons', 'studentLesson')
      .where('userAlias.institutionId = :institutionId', { institutionId: params.institutionId })
      .andWhere('userAlias.userId IN (:...userRolesIds)', { userRolesIds })
      .andWhere(
        new Brackets((qb) => {
          qb.where('invoice.id IS NULL').orWhere('invoice.institutionId = :institutionId', {
            institutionId: params.institutionId,
          })
        })
      )
      .andWhere(
        new Brackets((qb) => {
          if (params.userId) {
            qb.where('class.instructorId = :userId', {
              userId: params.userId,
            })
          } else {
            // pass and allow all
            qb.where('1=1')
          }
        })
      )
      .select([
        'userAlias.id',
        'userAlias.userId',
        // 'userAlias.phone',
        'userAlias.name',
        'userAlias.email',
        'userAlias.remarks',

        'user.firstName',
        'user.phone',
        'user.status',
        'user.createdAt',
        'user.updatedAt',

        'enrollCourses.id',
        'enrollCourses.courseId',
        'enrollCourses.institutionId',
        'enrollCourses.registrationForm',

        'invoice.id',
        'invoice.paymentState',
        'invoice.proofToken',
        'invoice.payAmount',
        'invoice.createdAt',
        'invoice.updatedAt',
        'invoice.usedBalance',

        'course.id',
        'course.name',
        'course.path',

        'studentSchedules.id',
        'studentSchedules.invoiceId',

        'studentLesson.id',
        'studentLesson.attendance',

        'class.id',
        'class.type',
        'class.name',

        'recurringFormat.id',
        'recurringFormat.every',
        'recurringFormat.unit',
        'recurringFormat.times',
        'recurringFormat.startTime',
        'recurringFormat.repeat',
      ])
      // Add index hints for better performance
      .useIndex('IX_user_aliases_user_id')
      .useIndex('IX_invoices_institution_id')
      .useIndex('IX_enroll_courses_course_id')

    // Optional: Add caching if the data doesn't change frequently
    if (process.env.NODE_ENV === 'production') {
      query.cache(60000) // Cache for 1 minute
    }

    const result = await query.getMany()

    return result.map((o) => {
      const enrollCourses = o.user.enrollCourses.filter((p) =>
        p.studentSchedule.some((q) => q.class?.type === ClassTypeEnum.SUBSCRIPTION)
      )

      const newStudentLessons = enrollCourses.map((p) => {
        const studentSchedule = p.studentSchedule.find(
          (q) => q.class.type === ClassTypeEnum.SUBSCRIPTION
        )
        return {
          id: `subscription.${p.id}`,
          attendance: studentSchedule.invoice.paymentState,
          course: p.course,
          class: studentSchedule.class,
          enrollCourse: { ...p, studentSchedule },
          studentSchedule,
        }
      })

      delete o.user.enrollCourses

      return {
        ...o,
        user: {
          ...o.user,
          studentLessons: [...o.user.studentLessons, ...newStudentLessons]?.sort((a, b) => {
            if (a.studentSchedule && b.studentSchedule) {
              return a.studentSchedule.id - b.studentSchedule.id
            }
            return 0
          }),
        },
      }
    })
  }

  async getStudentOnbByCustomFieldFilter(
    params: StudentOnbFilterListDto
  ): Promise<GetStudentDetailResponseDto[]> {
    const filterStudents: GetStudentDetailResponseDto[] = []
    const allStudentAliases = await this.getAllStudentsInInstitution(params)

    if (params.filterRules.length === 0) {
      return allStudentAliases
    }

    const ruleSelectIds = params.filterRules.map((rule) => {
      return rule.selectedFieldId
    })

    const getAllStudentFormField = await this.studentFormRepository.find({
      where: {
        institutionId: params.institutionId,
      },
    })

    if (getAllStudentFormField.length === 0) {
      return []
    }

    const groupByStudent: Record<string, StudentForm[]> = getAllStudentFormField.reduce(
      (acc, student) => {
        acc[student.userId] = [...(acc[student.userId] || []), student]
        return acc
      },
      {}
    )

    // Get all the field's values fron fielld table

    const allCommonFields = await this.commonFieldRepository.find({
      where: {
        id: In(ruleSelectIds),
      },
    })

    for (const [userId, studentForm] of Object.entries(groupByStudent)) {
      if (!userId) continue

      const filterStudentForm = studentForm.filter((stuFormAns) => {
        let id: number

        if (!isNaN(Number(stuFormAns.formFieldId.split('.')[2]))) {
          id = Number(stuFormAns.formFieldId.split('.')[2])
        }

        return ruleSelectIds.includes(id)
      })

      let ruleMatchCount = 0

      for (const stuForm of filterStudentForm) {
        const stuFormId =
          typeof stuForm.formFieldId === 'string'
            ? Number(stuForm.formFieldId.split('.')[2])
            : stuForm.formFieldId
        const rule = params.filterRules.find((rule) => rule.selectedFieldId === stuFormId)

        if (!rule) continue

        const field = allCommonFields.find((field) => field.id === stuFormId)

        if (!field) continue

        const fieldValue = stuForm.formFieldValue

        if (!fieldValue && rule.operator !== Operator.IsEmpty) {
          continue
        }

        if (
          [FieldType.DROPDOWN_LIST, FieldType.MULTIPLE_CHOICE, FieldType.SINGLE_CHOICE].includes(
            field.type
          )
        ) {
          if (rule.operator === Operator.Contain || rule.operator === Operator.Equals) {
            const isContain = rule.matchOptions?.some((item) => fieldValue.includes(item))
            if (isContain) ruleMatchCount = ruleMatchCount + 1
          } else if (rule.operator === Operator.NotContain) {
            const isNotContain = !rule.matchOptions?.some((item) => fieldValue.includes(item))
            if (isNotContain) ruleMatchCount = ruleMatchCount + 1
          } else if (rule.operator === Operator.IsEmpty) {
            const isEmpty = !fieldValue || fieldValue.length === 0
            if (isEmpty) ruleMatchCount = ruleMatchCount + 1
          } else if (rule.operator === Operator.NotEmpty) {
            const isNotEmpty =
              fieldValue !== undefined && fieldValue !== null && fieldValue.length > 0
            if (isNotEmpty) ruleMatchCount = ruleMatchCount + 1
          }
        } else if (
          [
            FieldType.SHORT_ANSWER,
            FieldType.EMAIL,
            FieldType.PHONE,
            FieldType.DESCRIPTION,
          ].includes(field.type)
        ) {
          if (rule.operator === Operator.Contain) {
            const isContain = fieldValue.toLowerCase().includes(rule.matchValue)
            if (isContain) ruleMatchCount = ruleMatchCount + 1
          } else if (rule.operator === Operator.NotContain) {
            const isNotContain = fieldValue.toLowerCase().includes(rule.matchValue)
            if (isNotContain) ruleMatchCount = ruleMatchCount + 1
          } else if (rule.operator === Operator.Equals) {
            const isEquals = fieldValue.toLowerCase() === rule.matchValue
            if (isEquals) ruleMatchCount = ruleMatchCount + 1
          } else if (rule.operator === Operator.IsEmpty) {
            const isEmpty = fieldValue === undefined || fieldValue === ''
            if (isEmpty) ruleMatchCount = ruleMatchCount + 1
          } else if (rule.operator === Operator.NotEmpty) {
            const isNotEmpty = fieldValue !== undefined || fieldValue !== ''
            if (isNotEmpty) ruleMatchCount = ruleMatchCount + 1
          }
        } else if (field.type === FieldType.DATE) {
          if (rule.operator === Operator.Before) {
            // const isBefore = dayjs(new Date(rule.matchValue)).isBefore(new Date(fieldValue))
            const isBefore = new Date(rule.matchValue) > new Date(fieldValue)
            if (isBefore) ruleMatchCount = ruleMatchCount + 1
          } else if (rule.operator === Operator.After) {
            // const isAfter = dayjs(new Date(rule.matchValue)).isAfter(fieldValue)
            const isAfter = new Date(rule.matchValue) < new Date(fieldValue)

            if (isAfter) ruleMatchCount = ruleMatchCount + 1
          }
        }
      }

      if (
        (params.matchMode === FilterMatchMode.Any && ruleMatchCount > 0) ||
        (params.matchMode === FilterMatchMode.All && ruleMatchCount === params.filterRules.length)
      ) {
        const foundStudent = allStudentAliases.find((student) => student.userId === Number(userId))

        if (foundStudent) {
          filterStudents.push(foundStudent)
        }
      }
    }

    return filterStudents
  }

  async getActiveStudents(siteId: number, institutionId: number): Promise<User[]> {
    const userRoles = await this.userRoleRepository.find({
      where: {
        institutionId,
        siteId,
        isStudent: true,
      },
      withDeleted: false,
    })

    const userRolesIds = userRoles.map((ur) => ur.userId)
    const users = await this.userRepository.find({
      where: {
        id: In(userRolesIds),
      },
      relations: {
        enrollCourses: {
          studentSchedule: {
            class: true,
          },
        },
      },
      select: {
        id: true,
        firstName: true,
        email: true,
        phone: true,
        status: true,
        enrollCourses: {
          id: true,
        },
      },
    })
    return users
  }

  async isNewUsersQuotaAvailable(
    siteId: number,
    institutionId: number,
    newUserCount: number
  ): Promise<boolean> {
    const users = await this.getActiveStudents(siteId, institutionId)
    const maxActiveStudents = DEFAULT_BASE_USER_QUOTA
    return users.length + newUserCount <= maxActiveStudents
  }

  async createStudentRecord(params: CreateStudentDto): Promise<User> {
    const isQuotaAvailable = await this.isNewUsersQuotaAvailable(
      params.siteId,
      params.institutionId,
      1
    )
    if (!isQuotaAvailable) throw new ApiError(ErrorCode.QUOTA_STUDENTS_ACTIVE_EXCEED)

    const createdStudent = await this.usersService.createStudentAccount(
      {
        firstName: params.name,
        phone: params.phone,
        email: params.email,
        password: randomUUID(),
      },
      params.institutionId,
      params.siteId
    )

    // After that, we will need to create a custom field if the field matches the name ID
    // This is for Wise Education only

    const customField = await this.commonFieldRepository.findOne({
      where: {
        institutionId: params.institutionId,
        question: 'Student ID',
        type: FieldType.NUMBER,
      },
    })

    if (customField) {
      // Get the userAlias for the created student
      const userAlias = await this.userAliasesRepository.findOne({
        where: {
          userId: createdStudent.id,
          institutionId: params.institutionId,
          name: params.name,
        },
        order: {
          createdAt: 'DESC',
        },
      })

      // Get the last student ID from the institution (including deleted records)
      const fieldId = String(customField.id)
      const existingStudentForms = await this.studentFormRepository.find({
        where: {
          institutionId: params.institutionId,
          fieldId,
        },
        order: {
          formFieldValue: 'DESC',
        },
        take: 5,
        withDeleted: true,
      })

      // Parse all formFieldValue as numbers and find the maximum
      const studentIds = existingStudentForms
        .map((form) => {
          const value = form.formFieldValue
          if (!value) return 0
          const parsed = Number(value)
          return isNaN(parsed) ? 0 : parsed
        })
        .filter((id) => id > 0)

      // Get the maximum student ID and increment by 1, or start at 1 if no records exist
      const lastStudentId = studentIds.length > 0 ? Math.max(...studentIds) : 0
      const nextStudentId = String(lastStudentId + 1)

      await this.addFieldsToStudentRecord({
        userId: createdStudent.id,
        userAliasId: userAlias?.id,
        institutionId: params.institutionId,
        newFields: [
          {
            id: fieldId,
            value: nextStudentId,
            type: FieldType.NUMBER,
            question: 'Student ID',
          },
        ],
      })
    }

    // Return status code 304 not modified if no new student role was created
    // I don't want to break the structure of the User data type, so I re-used the userStatus

    return createdStudent
  }

  async viewById(params: StudentOnbDetailtByAliasIdDto): Promise<GetStudentDetailResponseDto> {
    // This doesn't work if the user somehow has two user alias in the same institution
    const userAlias = await this.userAliasesRepository.findOne({
      where: { id: params.userAliasId },
      relations: {
        user: true,
      },
    })

    if (!userAlias) throw new ApiError(ErrorCode.STUDENT_NOT_FOUND)

    // studentInfo is now the userAlias itself (memo fields are on UserAlias)
    const studentInfo: UserAlias | null = userAlias.institutionId === params.institutionId
      ? userAlias
      : await this.userAliasesRepository.findFirstByUserIdAndInstitution(
          params.institutionId,
          userAlias.userId
        )

    const { password, permissions, userRoles, enrollCourses, ...user } = userAlias.user

    const isOnlyUserAlias = await this.checkIfIsOnlyUserAlias(params.userId)

    if (!studentInfo) {
      return {
        ...instanceToInstance(user, {
          excludePrefixes: ['__'],
        }),

        studentInfo: null,
        isOnlyUserAlias,
      }
    }
    // eslint-disable-next-line unused-imports/no-unused-vars

    // We need to see if there are other user alias in the database.
    // If yes, we should not allow the admin to change the user's email

    return {
      ...instanceToInstance(user, {
        excludePrefixes: ['__'],
      }),
      studentInfo: {
        userAliasId: userAlias.id,
        userAlias: {
          id: userAlias.id,
          name: userAlias.name,
          email: userAlias.email,
          userId: userAlias.userId,
          secondaryEmail: userAlias.secondaryEmail ?? null,
          // Surfaced so the student-detail UI can derive parent-ness. An alias
          // with a non-null childOfUserAliasId is a *child* (a student); only
          // aliases with no parent reference are the billing-account parent.
          // This is the source of truth — the standalone isStudentParent flag
          // can drift if it's set incorrectly during creation/import.
          childOfUserAliasId: userAlias.childOfUserAliasId ?? null,
        },
      },
      isOnlyUserAlias,
    }
  }

  // async viewByAliasId(params: StudentOnbDetailtDto): Promise<GetStudentDetailResponseDto> {
  //   const user = await this.userRepository.findOne({
  //     where: { id: params.userId },
  //     select: ['id', 'firstName', 'lastName', 'email', 'phone', 'status'],
  //   })

  //   if (!user) throw new ApiError(ErrorCode.STUDENT_NOTFOUND)

  //   const studentInfo = await this.studentMemoRepository.findOne({
  //     where: { userId: params.userId, institutionId: params.institutionId },
  //     relations: {
  //       userAlias: true,
  //     },
  //   })

  //   return {
  //     ...user,
  //     studentMemo: studentInfo,
  //   }
  // }

  async deleteStudentRecord(params: StudentOnbDeleteDto): Promise<User[]> {
    // This should NOT remove the user, but only the user role
    const userAliases = await this.userAliasesRepository.findAll({
      where: { id: In(params.userAliasIds) },
      select: ['id'],
    })

    const users = userAliases.map((userAlias) => userAlias.user)

    if (userAliases.length === 0) throw new ApiError(ErrorCode.STUDENT_NOT_FOUND)

    for (const singleUserAlias of userAliases) {
      // Find if there are remaining use alias that uses this user role
      const otherUserAliases = await this.userAliasesRepository.find({
        where: {
          id: Not(singleUserAlias.id),
          userId: singleUserAlias.userId,
          institutionId: params.institutionId,
        },
      })

      // Can be deleted when there are no other user alias that uses this user role
      if (otherUserAliases.length === 0) {
        const userRole = await this.userRoleRepository.findOne({
          where: {
            userId: singleUserAlias.userId,
            institutionId: params.institutionId,
            isStudent: true,
          },
        })

        if (userRole) {
          await this.userRoleRepository.softRemove(userRole)
        }
      }

      const studentForm = await this.studentFormRepository.find({
        where: {
          userId: singleUserAlias.userId,
          institutionId: params.institutionId,
        },
      })

      if (studentForm) {
        await this.studentFormRepository.softRemove(studentForm)
      }

      const userAlias = await this.userAliasesRepository.findAll({
        where: {
          id: singleUserAlias.id,
        },
      })
      if (userAlias) {
        await this.userAliasesRepository.softRemove(userAlias)
      }

      const invoice = await this.invoiceRepository.findAll({
        where: {
          userId: singleUserAlias.userId,
          institutionId: params.institutionId,
          userAliasId: singleUserAlias.id,
        },
        relations: {
          enrollCourses: true,
        },
      })

      const enrollIds = invoice.flatMap((inv) => inv.enrollCourses.map((inv) => inv.id))
      const invoiceIds = invoice.map((inv) => inv.id)

      const studentSchedules = await this.studentScheduleRepository.findAll({
        where: {
          invoiceId: In(invoiceIds),
        },
      })
      const studentLessons = await this.studentLessonRepository.findAll({
        where: {
          userId: singleUserAlias.userId,
          enrollCourseId: In(enrollIds),
        },
      })
      const enrollCourses = await this.enrollCourseRepository.findBy({
        id: In(enrollIds), // 'In' is used to match multiple IDs from the array
      })

      if (studentLessons) {
        await this.studentLessonRepository.softRemove(studentLessons)
      }

      if (studentSchedules) {
        await this.studentScheduleRepository.softRemove(studentLessons)
      }

      if (invoice) {
        await this.invoiceRepository.softRemove(invoice)
      }

      if (enrollCourses) {
        await this.enrollCourseRepository.softRemove(enrollCourses)
      }
    }

    // await this.userRepository.softRemove(users)
    return users
  }

  async mergeStudentRecord(params: MergeStudentDto): Promise<UserAlias> {
    const sourceAlias = await this.userAliasesRepository.findOne({
      where: { id: params.sourceUserAliasId, institutionId: params.institutionId },
    })
    const targetAlias = await this.userAliasesRepository.findOne({
      where: { id: params.targetUserAliasId, institutionId: params.institutionId },
    })

    if (!sourceAlias) throw new ApiError(ErrorCode.STUDENT_NOT_FOUND)
    if (!targetAlias) throw new ApiError(ErrorCode.STUDENT_NOT_FOUND)

    const isDifferentUser = sourceAlias.userId !== targetAlias.userId
    const sourceUserId = sourceAlias.userId
    const targetUserId = targetAlias.userId

    await this.dataSource.transaction(async (manager) => {
      // 1. Collect enrollCourse IDs being moved (needed for StudentLesson update)
      const movingEnrollCourses = await manager
        .createQueryBuilder()
        .select('ec.id', 'id')
        .from('enroll_courses', 'ec')
        .where('ec.user_alias_id = :sourceId AND ec.deleted_at IS NULL', { sourceId: params.sourceUserAliasId })
        .getRawMany()
      const movingEnrollIds = movingEnrollCourses.map((r) => r.id)

      // 2. Reassign EnrollCourse
      const enrollUpdate: Partial<EnrollCourse> = { userAliasId: params.targetUserAliasId }
      if (isDifferentUser) enrollUpdate.userId = targetUserId
      if (movingEnrollIds.length > 0) {
        await manager
          .createQueryBuilder()
          .update(EnrollCourse)
          .set(enrollUpdate)
          .where('user_alias_id = :sourceId', { sourceId: params.sourceUserAliasId })
          .execute()
      }

      // 3. Reassign Invoice
      const invoiceUpdate: Partial<Invoice> = { userAliasId: params.targetUserAliasId }
      if (isDifferentUser) invoiceUpdate.userId = targetUserId
      await manager
        .createQueryBuilder()
        .update(Invoice)
        .set(invoiceUpdate)
        .where('user_alias_id = :sourceId', { sourceId: params.sourceUserAliasId })
        .execute()

      // 5. Reassign CreditTransactions
      await manager
        .createQueryBuilder()
        .update(CreditTransactions)
        .set({ userAliasId: params.targetUserAliasId })
        .where('user_alias_id = :sourceId AND deleted_at IS NULL', { sourceId: params.sourceUserAliasId })
        .execute()

      // 6. Reassign StudentForm userAliasId (always — it has both userId and userAliasId columns)
      await manager
        .createQueryBuilder()
        .update(StudentForm)
        .set({ userAliasId: params.targetUserAliasId })
        .where('user_alias_id = :sourceId AND deleted_at IS NULL', { sourceId: params.sourceUserAliasId })
        .execute()

      // 7. Reassign DocumentCampaignRecipients (studentId is a UserAlias FK)
      await manager
        .createQueryBuilder()
        .update(DocumentCampaignRecipients)
        .set({ studentId: params.targetUserAliasId })
        .where('student_id = :sourceId AND deleted_at IS NULL', { sourceId: params.sourceUserAliasId })
        .execute()

      // 8. If different users — also update userId on StudentForm and StudentLesson
      if (isDifferentUser) {
        await manager
          .createQueryBuilder()
          .update(StudentForm)
          .set({ userId: targetUserId })
          .where('user_alias_id = :targetId AND institution_id = :institutionId AND deleted_at IS NULL', {
            targetId: params.targetUserAliasId,
            institutionId: params.institutionId,
          })
          .execute()

        if (movingEnrollIds.length > 0) {
          await manager
            .createQueryBuilder()
            .update(StudentLesson)
            .set({ userId: targetUserId })
            .where(
              'user_id = :sourceUserId AND enroll_course_id IN (:...enrollIds) AND deleted_at IS NULL',
              { sourceUserId, enrollIds: movingEnrollIds }
            )
            .execute()
        }
      }

      // 9. Reparent any child aliases that point to the source
      await manager
        .createQueryBuilder()
        .update(UserAlias)
        .set({ childOfUserAliasId: params.targetUserAliasId })
        .where('child_of_user_alias_id = :sourceId AND deleted_at IS NULL', { sourceId: params.sourceUserAliasId })
        .execute()

      // 10. Clean up userRole if this was the last alias for that user in this institution
      const remainingAliases = await manager
        .createQueryBuilder()
        .select('ua.id', 'id')
        .from('user_aliases', 'ua')
        .where(
          'ua.user_id = :sourceUserId AND ua.institution_id = :institutionId AND ua.id != :sourceId AND ua.deleted_at IS NULL',
          { sourceUserId, institutionId: params.institutionId, sourceId: params.sourceUserAliasId }
        )
        .getRawMany()

      if (remainingAliases.length === 0) {
        await manager
          .createQueryBuilder()
          .update(UserRole)
          .set({ deletedAt: new Date() })
          .where(
            'user_id = :sourceUserId AND institution_id = :institutionId AND is_student = true AND deleted_at IS NULL',
            { sourceUserId, institutionId: params.institutionId }
          )
          .execute()
      }

      // Soft-delete the source alias
      await manager
        .createQueryBuilder()
        .update(UserAlias)
        .set({ deletedAt: new Date() })
        .where('id = :sourceId', { sourceId: params.sourceUserAliasId })
        .execute()
    })

    return targetAlias
  }

  async updateStatus(params: UpdateStatusDto, currentUser) {
    const user = await this.userRepository.findOneById(params.userId)

    if (!user) throw new ApiError(ErrorCode.STUDENT_NOT_FOUND)

    await this.logService.create([
      {
        userId: user.id,
        institutionId: params.institutionId,
        type: RecordLogType.STUDENT_CHANGE_INFOMATION,
        detail: {
          changeBy: _.pick(currentUser, ['firstName', 'id', 'email']),
          modifiedDate: dayjs().toDate(),
          fields: { status: params.status },
          olds: { status: user.status },
        },
      },
    ])

    user.status = params.status

    return await this.userRepository.update({ id: user.id }, { status: params.status })
  }

  async getTeachingService(params: GetTeachingServiceByInvoiceDto) {
    // invoiceId already uniquely identifies the invoice — applying a userAliasId
    // filter on top of it would exclude combined invoices whose enrollCourses
    // belong to multiple aliases. Only fall back to userAliasId scoping when no
    // invoiceId is supplied (e.g. the student-detail page).
    const whereClause: any = {
      institutionId: params.institutionId,
    }
    if (params.invoiceId) {
      whereClause.id = params.invoiceId
    } else if (params.userAliasId) {
      whereClause.userAliasId = params.userAliasId
    }

    const getAllClasses = await this.invoiceRepository.find({
      where: whereClause,
      relations: {
        studentSchedules: {
          studentLessons: true,
        },
        course: true,
        enrollCourses: {
          multipleClassMapping: {
            class: true,
          },
        },
      },
    })
    const enrollIds = getAllClasses.flatMap((i) => i.enrollCourses.map((c) => c.id))
    const lessonsByEnroll = await this.studentLessonRepository.find({
      where: { enrollCourseId: In(enrollIds) },
    })
    const grouped = _.groupBy(lessonsByEnroll, 'enrollCourseId')

    // Batch-load all classes referenced by the current lesson classId fields so
    // we can resolve class names even when EnrollClassMapping drifted after a
    // lesson change.
    const allLessonClassIds = [...new Set(lessonsByEnroll.map((l) => l.classId).filter((id): id is number => !!id))]
    const classesById = new Map<number, { id: number; name: string; type: string }>()
    if (allLessonClassIds.length > 0) {
      const classes = await this.classRepository.find({
        where: { id: In(allLessonClassIds) },
        select: ['id', 'name', 'type'],
      })
      classes.forEach((c) => classesById.set(c.id, c))
    }

    const processedSubscriptionClasses = []
    getAllClasses.forEach((item) => {
      item.enrollCourses.forEach((enrollCourse) => {
        // Collect all lessons for this enrollCourse. Prefer the directly-queried
        // student_lesson rows (which carry classId). Fall back to the schedule
        // relation but scope it to this enrollCourse so lessons don't bleed
        // across students in combined invoices.
        const enrollCourseItems = grouped[enrollCourse.id]?.length
          ? grouped[enrollCourse.id]
          : item.studentSchedules
              .filter((s) => s.enrollCourseId === enrollCourse.id)
              .flatMap((s) => s.studentLessons)

        if (!enrollCourseItems.length) return

        // Group by the lesson's CURRENT classId so stale EnrollClassMapping
        // entries never produce empty rows, and lessons moved to a new class
        // are always visible under the correct class name.
        const rawClassIds: number[] = enrollCourseItems.map((l) => l.classId).filter((id): id is number => !!id)
        const usedClassIds: number[] = [...new Set(rawClassIds)]

        usedClassIds.forEach((classId: number) => {
          const classInfo = classesById.get(classId)
          if (!classInfo) return

          const classLessons = enrollCourseItems.filter((l) => l.classId === classId)
          if (!classLessons.length) return

          processedSubscriptionClasses.push({
            courseId: item.courseId,
            courseName: item.course.name,
            courseImg: item.course.previewImageUrl,
            classId: classInfo.id,
            className: classInfo.name,
            enrollCourseId: enrollCourse.id,
            paymentState: item.paymentState,
            billingStartDate: enrollCourse.billingStartDate,
            billingEndDate: enrollCourse.billingEndDate,
            billingNextDate: enrollCourse.billingNextDate,
            paymentAmount: enrollCourse.paymentAmount,
            invoiceId: item.id,
            confirmState: enrollCourse.confirmState,
            registrationForm: enrollCourse.registrationForm,
            lessons: classLessons,
            classType: classInfo.type as ClassTypeEnum,
          })
        })
      })
    })

    return processedSubscriptionClasses.filter((item) => !!item)
  }

  async getTeachingServiceOpt(params: GetTeachingServiceOptDto) {
    const institution = await this.institutionsRepository.findOne({
      where: {
        id: params.institutionId,
      },
      relations: {
        site: {
          siteSettings: true,
        },
      },
    })

    if (!institution) throw new ApiError(ErrorCode.INSTITUTION_NOT_FOUND)
    const timeZone = (await institution.site.siteSettings)?.timeZone

    // Step 1: Find the classes that is available first
    const allClasses = await this.classRepository.find({
      where: {
        siteId: params.siteId,
        institutionId: params.institutionId,
      },
      select: ['id', 'name', 'type', 'courseId', 'isArchived', 'applicationPeriod'],
      order: {
        name: 'ASC',
      },
    })

    // Step 2: Find the details of the courseId associated with the course
    const listOfAllCourses = allClasses.map((c) => c.courseId)
    const uniqueCourseIds = _.uniq(listOfAllCourses)

    const allCourses = await this.courseRepository.find({
      where: {
        id: In(uniqueCourseIds),
        institutionId: params.institutionId,
      },
      select: ['id', 'name', 'isArchived'],
      order: {
        name: 'ASC',
      },
    })
    // Step 3: Find the details of the courseId associated with the course

    const recurringClasses = await Promise.all(
      allClasses.map(async (item) => {
        if (item.type !== ClassTypeEnum.RECURRING) return
        const allLessonDates = await this.recurringSchedulesService.getAllLessonsByRecurringClassId(
          item.id
        )
        return {
          id: item.id,
          name: item.name,
          type: item.type,
          lessonIds: allLessonDates,
          courseId: item.courseId,
          isArchived: item.isArchived,
          applicationPeriod: item.applicationPeriod,
        }
      })
    )

    // This is the instance of a single class
    const recurringLessonDates = await Promise.all(
      recurringClasses.map(async (item) => {
        // Temporarily set the number of lessons as 12(3 months)
        // Format: {4: [date1, date2, date3, date4], 6: [date1, date2, date3, date4]}

        if (item && item.lessonIds && item.lessonIds.length > 0) {
          const periods = await this.recurringSchedulesService.getStartingLessons(
            item.lessonIds,
            params.siteId,
            params.institutionId,
            12,
            12
          )
          // Filter by applicationPeriod if provided
          const ap = item.applicationPeriod
          const apStart = ap?.startDatetime ? new Date(ap.startDatetime) : null
          const apEnd = ap?.endDatetime ? new Date(ap.endDatetime) : null
          const filtered =
            apStart || apEnd
              ? Object.fromEntries(
                  Object.entries(periods).map(([key, value]) => [
                    key,
                    filterTimeslotStringsWithinPeriod(
                      value.map((v) => v.toString()),
                      apStart,
                      apEnd
                    ),
                  ])
                )
              : periods

          return {
            id: item.id,
            courseId: item.courseId,
            name: item.name,
            type: item.type,
            periods: filtered,
            isArchived: item.isArchived,
          }
        }
      })
    )

    // Calculating the list of lessosn to be returned
    // The final array: [{..., classes: {id: classId, name: className , lessons: [{id:lessonId, lessons: [date1, date2, date3, date4]}]}}]

    // Step 4: Find the details of the regular Courses associated with the course

    const regularOrWorkshopClasses = allClasses.filter(
      (item) => item.type === ClassTypeEnum.REGULAR || item.type === ClassTypeEnum.WORKSHOP
    )
    const regularClassIds = regularOrWorkshopClasses.map((c) => c.id)

    const regularV2Classes = allClasses.filter((item) => item.type === ClassTypeEnum.REGULAR_V2)
    const regularPeriods = await this.regularPeriodsRepository.find({
      where: {
        classId: In(regularClassIds),
        institutionId: params.institutionId,
      },
      select: ['id', 'classEntity', 'classId', 'lessons', 'repeatFormat'],
      relations: ['lessons'],
    })

    const convertLessons = {}

    regularPeriods.forEach((item) => {
      if (!convertLessons[item.classId]) {
        convertLessons[item.classId] = {}
      }

      const lessonArray = lessonObjectToString(item.lessons)

      convertLessons[item.classId][item.id] = lessonArray.map((o) => o.toString())
    })

    const processedRegularOrWorkshopClasses = []

    regularOrWorkshopClasses.forEach((item) => {
      processedRegularOrWorkshopClasses.push({
        id: item.id,
        courseId: item.courseId,
        type: item.type,
        name: item.name,
        periods: convertLessons[item.id],
        isArchived: item.isArchived,
      })
    })

    // APPOINTMENT classes
    const appointmentClasses = allClasses.filter((item) => item.type === ClassTypeEnum.APPOINTMENT)

    const appointmentEntities = await this.appointmentRepository.find({
      where: {
        classId: In(appointmentClasses.map((c) => c.id)),
      },
      relations: {
        availability: true,
      },
    })

    const appointmentClassesWithEntities = appointmentClasses.map((item) => {
      const appointmentEntity = appointmentEntities.find((e) => e.classId === item.id)
      return {
        ...item,
        appointment: appointmentEntity,
      }
    })

    const appointmentClassesWithPeriods = await Promise.all(
      appointmentClassesWithEntities.map(async (item) => {
        const periods = {}
        if (
          item.appointment &&
          item.appointment.availability &&
          Array.isArray(item.appointment.availability.availableSchedules)
        ) {
          const ap = item.applicationPeriod
          const apStart = ap?.startDatetime ? new Date(ap.startDatetime) : null
          const apEnd = ap?.endDatetime ? new Date(ap.endDatetime) : null

          // Precompute override "force-allow" dates (YYYY-MM-DD) that bypass the AP window
          const overrides = item.appointment.availability.dateOverrides || []
          const allowedOverrideDates = new Set(
            overrides
              .filter((o) => o.isAvailable)
              .map((o) => {
                const d = new Date(o.date)
                // Format to YYYY-MM-DD same as appointment.service.ts
                const yyyy = d.getUTCFullYear()
                const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
                const dd = String(d.getUTCDate()).padStart(2, '0')
                return `${yyyy}-${mm}-${dd}`
              })
          )

          const slotsBySchedule = await Promise.all(
            item.appointment.availability.availableSchedules.map((s) =>
              this.appointmentService
                .generateTimeslotsForSchedule(item.appointment, s, 4, 4, timeZone)
                .then((slots) => {
                  const filtered =
                    apStart || apEnd
                      ? slots.filter((slot) => {
                          const [startStr, endStr] = slot.split(' ')
                          const start = new Date(startStr)
                          const end = new Date(endStr)

                          // Same date key generation as appointment.service.ts
                          const local = utcToZonedTime(start, timeZone)
                          const yyyy = local.getFullYear()
                          const mm = String(local.getMonth() + 1).padStart(2, '0')
                          const dd = String(local.getDate()).padStart(2, '0')
                          const dateKey = `${yyyy}-${mm}-${dd}`

                          if (allowedOverrideDates.has(dateKey)) {
                            // Override day is force-allow
                            return true
                          }
                          // Otherwise enforce applicationPeriod
                          return isTimeslotWithinPeriod(start, end, apStart, apEnd)
                        })
                      : slots
                  return { key: `${s.dayOfWeek}_${s.startTime}_${s.endTime}`, slots: filtered }
                })
            )
          )
          slotsBySchedule.forEach(({ slots }) => {
            slots.forEach((s) => {
              if (!s) return
              const [startTime] = s.split(' ')
              if (!periods[startTime]) {
                periods[startTime] = []
              }
              periods[startTime].push(s)
            })
          })
        }
        return {
          id: item.id,
          courseId: item.courseId,
          type: item.type,
          name: item.name,
          periods,
          isArchived: item.isArchived,
        }
      })
    )

    // Packaging the outermost later of the object
    const finalCourses = allCourses.map((c) => {
      const finalRegularClasses = processedRegularOrWorkshopClasses.filter(
        (item) => item?.courseId === c.id
      )
      const finalRegularV2Classes = regularV2Classes.filter((item) => item?.courseId === c.id)
      const finalRecurringClasses = recurringLessonDates.filter((item) => item?.courseId === c.id)
      const subscriptionClasses = allClasses.filter(
        (item) => item.type === ClassTypeEnum.SUBSCRIPTION && item.courseId === c.id
      )
      const finalAppointmentClasses = appointmentClassesWithPeriods.filter(
        (item) => item?.courseId === c.id
      )

      return {
        id: c.id,
        name: c.name,
        isArchived: c.isArchived,
        classes: [
          ...finalRegularClasses,
          ...finalRegularV2Classes,
          ...finalRecurringClasses,
          ...subscriptionClasses,
          ...finalAppointmentClasses,
        ],
      }
    })

    return finalCourses
  }

  async getTeachingServiceOptSubscription(params: GetTeachingServiceOptDto) {
    const allClasses = await this.classRepository.find({
      where: {
        siteId: params.siteId,
        institutionId: params.institutionId,
      },
      select: ['id', 'name', 'type', 'courseId', 'applicationPeriod', 'isArchived'],
      order: {
        name: 'ASC',
      },
    })

    const listOfAllCourses = allClasses.map((c) => c.courseId)
    const uniqueCourseIds = _.uniq(listOfAllCourses)

    const allCourses = await this.courseRepository.find({
      where: {
        id: In(uniqueCourseIds),
        institutionId: params.institutionId,
      },
      select: ['id', 'name'],
      order: {
        name: 'ASC',
      },
    })

    // Process recurring classes
    const recurringClassResults = await Promise.all(
      allClasses.map(async (item) => {
        if (item.type !== ClassTypeEnum.RECURRING) return null

        const allLessonDates = await this.recurringSchedulesService.getAllLessonsByRecurringClassId(
          item.id
        )
        const periods = await this.recurringSchedulesService.getStartingLessons(
          allLessonDates,
          params.siteId,
          params.institutionId,
          12,
          12
        )

        return {
          id: item.id,
          courseId: item.courseId,
          name: item.name,
          type: item.type,
          periods,
        }
      })
    )

    const recurringLessonDates = recurringClassResults.filter(
      (c): c is NonNullable<typeof c> => !!c
    )

    // Process subscription classes
    const subscriptionClassResults = await Promise.all(
      allClasses.map(async (item) => {
        if (item.type !== ClassTypeEnum.SUBSCRIPTION) return null

        const lessonIds = await this.recurringSchedulesService.getAllLessonsByRecurringClassId(
          item.id
        )
        const periods = await this.recurringSchedulesService.getStartingLessons(
          lessonIds,
          params.siteId,
          params.institutionId,
          12,
          12
        )

        return {
          id: item.id,
          courseId: item.courseId,
          name: item.name,
          type: item.type,
          periods,
          isArchived: item.isArchived,
        }
      })
    )

    const subscriptionLessonDates = subscriptionClassResults.filter(
      (c): c is NonNullable<typeof c> => !!c
    )

    // Combine all classes per course
    const finalCourses = allCourses.map((c) => {
      const courseRecurring = recurringLessonDates.filter((cls) => cls.courseId === c.id)
      const courseSubscription = subscriptionLessonDates.filter((cls) => cls.courseId === c.id)

      return {
        id: c.id,
        name: c.name,
        classes: [...courseRecurring, ...courseSubscription],
      }
    })

    return finalCourses
  }

  async updateTeachingService({
    params,
    enrolId,
  }: {
    params: AddTeachingServiceDto
    enrolId: number
  }): Promise<EnrollCourse> {
    const enrollmentExist = await this.enrollCourseRepository.findOneBy({
      id: enrolId,
    })

    if (!enrollmentExist) {
      throw new NotFoundException(EnrollCourseErrorMessage.ENROLL_COURSE_NOT_FOUND)
    }

    const thisCourse = await this.courseRepository.findOneById(params.courseId)
    const thisClass = await this.classRepository.findOneById(params.classId)
    const thisLessonDate = await this.recurringScheduleRepository.findOneBy({
      id: params.recurringScheduleId,
    })

    const recurringFormat = await this.repeatFormatsRepository.findOneBy({
      id: thisClass.recurringFormat?.id,
    })

    if (!thisClass) throw new ApiError(ErrorCode.CLASS_NOT_FOUND)
    if (!thisCourse) throw new ApiError(ErrorCode.COURSE_NOT_FOUND)

    const currentUserAlias = await this.userAliasesRepository.findOneBy({
      id: params.userAliasId,
    })
    if (!currentUserAlias) throw new ApiError(ErrorCode.STUDENT_NOT_FOUND)

    const student = await this.userRepository.findOneById(currentUserAlias.userId)
    if (!student) throw new ApiError(ErrorCode.STUDENT_NOT_FOUND)

    if (params.isChangeClass) {
      // Remove all the student lessons and schedules of the old enrollment
      await this.paymentEvidenceService.deletePayment(
        enrollmentExist.id,
        params.siteId,
        params.institutionId
      )

      const newEnrolId = (await this.addTeachingService(params)) as any

      await this.enrollCourseRepository.update(enrollmentExist.id, {
        confirmState: EnrollConfirmStatus.STOPPED,
        deletedAt: getCurrentTimeStamp(),
      })

      return await this.enrollCourseRepository.findOneBy({ id: newEnrolId.id })
    }

    // const createEnrollCourse = this.enrollCourseRepository.create({
    //   ...(_.omit(params, ['classLessonDate']) as object),
    //   confirmState: EnrollConfirmStatus.ACCEPTED,
    //   paymentMethod: PaymentMethod.PAY_LATER,
    //   paymentState: PaymentStatus.PENDING,
    //   name: student.firstName,
    //   phone: student.phone,
    // });

    // const enrollCourse = await this.enrollCourseRepository.save(createEnrollCourse);

    const pickedRecurringSchedule = await this.recurringSchedulesService.findOneBy({
      id: params.recurringScheduleId,
    })
    const priceOption = await this.classPriceOptionService.getPriceOptionForClass(
      params.classId,
      params.priceOptionId
    )
    if (!priceOption) {
      throw new ApiError(ErrorCode.PRICE_OPTION_NOT_FOUND)
    }

    const courseMeta: StudentMetaRefExtended = {
      type: thisClass.type as ClassTypeEnum,
      pickedClass: thisClass,
      classId: params.classId,
      pickedRecurringSchedule,
      pickedFirstDate: params.firstLessonDate.toString(),
      lessonCount: recurringFormat.times,
      priceOptionId: priceOption.id,
      lessonPrice: priceOption.amount,
    }

    if (thisClass.type === ClassTypeEnum.RECURRING) {
      courseMeta.periodId = params.recurringScheduleId
    } else if (thisClass.type === ClassTypeEnum.REGULAR) {
      courseMeta.periodId = params.periodId
    }

    const newSchedule: StudentScheduleType = {
      type: thisClass.type as ClassTypeEnum,
      classId: params.classId,
      recurringScheduleId: params.recurringScheduleId,
      // firstLesson: params.classLessonDate.toString(),
      // firstSchedule: params.classPeriod,
      enrollCourseId: enrollmentExist.id,
    }

    // let schedules;
    // if (Array.isArray(enrollmentExist.studentSchedule)) {
    //   schedules = [...enrollmentExist.studentSchedule, newSchedule];
    // } else if (typeof enrollmentExist.studentSchedule === 'object') {
    //   schedules = [enrollmentExist.studentSchedule, newSchedule];
    // } else {
    //   schedules = newSchedule;
    // }

    const enrollInto: EnrollIntoInfo = {
      type: thisClass.type as ClassTypeEnum,
      courseName: thisCourse.name,
      secondLevelName: thisClass.name,
      thirdLevelName: thisLessonDate ? WeekDayEnum[thisLessonDate.weekDay] : '',
      lessonCount: recurringFormat.times,
    }

    const updateBody: StudentUpdateEnrollCourseMetaDto = {
      siteId: params.siteId,
      institutionId: params.institutionId,
      courseId: params.courseId,
      meta: courseMeta,
      enrollInto,
      redirectUrl: params.redirectUrl,
      // studentSchedule: schedules,
    }

    const { enrollCourseInstance: enrollCourse } =
      await this.enrollCourseService.addNewScheduleToEnrollment(
        enrollmentExist.id,
        updateBody,
        [student],
        thisCourse,
        params.recurringScheduleId
      )
    const newScheduleToBeSaved = this.studentScheduleRepository.create(newSchedule)
    await this.studentScheduleRepository.save(newScheduleToBeSaved)

    return enrollCourse
  }

  async createEnrollCourseDto(params: AddTeachingServiceDto) {
    const currentUserAlias = await this.userAliasesRepository.findOneBy({
      id: params.userAliasId,
    })

    if (!currentUserAlias) throw new NotFoundException(UserErrorMessage.USER_NOT_FOUND)

    const currentUser = await this.userRepository.findOneBy({
      id: currentUserAlias.userId,
    })

    const course = await this.coursesService.findOne(params.courseId)

    if (!course) {
      throw new NotFoundException(CourseErrorMessage.COURSE_NOT_FOUND)
    }

    const selectedClass = await this.classService.findOneCondition({
      where: { id: params.classId },
      relations: {
        regularPeriods: {
          lessons: true,
        },
        appointment: true,
        recurringSchedules: {
          studentSchedules: true,
        },
        regularScheduleV2: {
          periodsV2: {
            lessonRepeatFormat: true,
          },
        },
      },
    })

    if (!selectedClass) {
      throw new NotFoundException(CourseErrorMessage.CLASS_NOT_FOUND)
    }

    // If lessonPrice is 0, it will be written as 0, but it should be written as the tuition of the class
    const lessonPrice = Number(params.lessonPrice)
    if (Number.isNaN(lessonPrice)) {
      throw new BadRequestException('Lesson price must be a valid number')
    }

    const createEnrollCourseDto = new StudentCreateEnrollCourseDto()

    if (!createEnrollCourseDto.studentData) {
      createEnrollCourseDto.studentData = []
    }
    createEnrollCourseDto.studentData.push({
      id: currentUser.id,
      studentName: params.name || currentUserAlias.name,
      email: params.email || currentUserAlias.email,
      phoneNumber: params.phone || currentUser.phone,
    })

    createEnrollCourseDto.institutionId = params.institutionId
    createEnrollCourseDto.siteId = params.siteId
    createEnrollCourseDto.courseId = params.courseId

    if (!createEnrollCourseDto.registrationForm) {
      // get form & fields
      let form = await this.commonFormRepository.getDetailForm(course.formId)
      // if no form, create default
      if (!form?.fields) {
        const fields = await this.enrollmentFormService.getOrCreateDefaultFields(
          params.institutionId
        )
        form = { fields }
      }
      createEnrollCourseDto.registrationForm = (form?.fields as CommonField[])
        ?.filter((o) => o.isRequire && o.columnMapping)
        .map((o) => {
          return {
            id: `applicant.0.${o.id}`,
            order: o.order,
            value: params[o.columnMapping],
            question: o.question,
            isDefault: o.isRequire,
          }
        })
    }

    const selectedClassMeta = new MetaRef()
    selectedClassMeta.type = selectedClass.type
    selectedClassMeta.classId = selectedClass.id

    if (
      selectedClass.type === ClassTypeEnum.REGULAR ||
      selectedClass.type === ClassTypeEnum.WORKSHOP
    ) {
      /**
       * REGULAR & WORKSHOP
       */
      selectedClassMeta.periodId = params.periodId
      selectedClassMeta.pickedLessons = this.generatePickedLessonsRegularLessons(
        selectedClass,
        params.periodId,
        params.firstLessonDate
      )
    } else if (selectedClass.type === ClassTypeEnum.RECURRING) {
      /**
       * RECURRING
       */
      const recurringSchedule = selectedClass.recurringSchedules.find(
        (schedule) => schedule.id === params.recurringScheduleId
      )
      selectedClassMeta.pickedRecurringSchedule = recurringSchedule
    } else if (selectedClass.type === ClassTypeEnum.APPOINTMENT) {
      const appointmentClass = selectedClass.appointment
      if (!appointmentClass) {
        throw new NotFoundException(CourseErrorMessage.APPOINTMENT_CLASS_NOT_FOUND)
      }
      selectedClassMeta.pickedLessons = [
        {
          classId: appointmentClass.id,
          startTime: new Date(params.firstLessonDate.split(' ')[0]),
          endTime: new Date(params.firstLessonDate.split(' ')[1]),
        } as PeriodLessons,
      ]
    } else if (selectedClass.type === ClassTypeEnum.REGULAR_V2) {
      selectedClassMeta.individualPickedLessonsString = params.individualLessons?.map((period) => {
        return new LessonString([period.startTime, period.endTime].join(' '))
      })
    }
    if (selectedClass.type !== ClassTypeEnum.SUBSCRIPTION) {
      selectedClassMeta.pickedFirstDate = params.firstLessonDate.toString()
    }

    selectedClassMeta.lessonPrice = lessonPrice
    selectedClassMeta.priceOptionId = params.priceOptionId
    // Set userAliasId from params to ensure invoice and enroll courses use the correct userAliasId
    selectedClassMeta.userAliasId = params.userAliasId
    createEnrollCourseDto.selectedClassMeta = [selectedClassMeta]

    if (lessonPrice === 0) {
      createEnrollCourseDto.paymentMethod = PaymentMethod.NOT_REQUIRED // Assuming default payment method
    } else {
      createEnrollCourseDto.paymentMethod = PaymentMethod.PAY_LATER // Assuming default payment method
    }

    createEnrollCourseDto.redirectUrl = params.redirectUrl
    createEnrollCourseDto.setMultipleClass = false
    createEnrollCourseDto.siteId = params.siteId

    return {
      dto: createEnrollCourseDto,
      currentUser,
      course,
    }
  }
  generatePickedLessonsRegularLessons(
    classEntity: ClassEntity,
    periodId: number,
    firstLesson: string | LessonString
  ): PeriodLessons[] {
    const selectedPeriod = classEntity.regularPeriods.find((period) => period.id === periodId)
    if (!selectedPeriod || !selectedPeriod.lessons) {
      throw new NotFoundException(CourseErrorMessage.PERIOD_NOT_FOUND)
    }

    // Get the start time
    const firstLessonDateStartTime = firstLesson?.split(' ')[0]

    // Get all the date after the first lesson date in the period
    const firstLessonDate = new Date(firstLessonDateStartTime)

    const lessonsAfterToday = selectedPeriod.lessons.filter((lesson) => {
      const lessonDate = new Date(lesson.startTime) // Assuming lessons have a startDate property
      return lessonDate >= firstLessonDate
    })

    return lessonsAfterToday
  }

  async addTeachingService(
    params: AddTeachingServiceDto
  ): Promise<StudentEnrollCourseResponse[] | PayNowResponse[]> {
    const { dto, currentUser, course } = await this.createEnrollCourseDto(params)
    const response = await this.enrollCourseService.enrollClasses({
      createEnrollCourseDto: dto,
      currentUser,
      course,
      isCustomised: true,
      isSendEmail: params.isSendEmail,
    })

    if (response && response.finalResponse) {
      return response.finalResponse
    } else {
      throw new BadRequestException(EnrollCourseErrorMessage.COURSE_NOT_AVAILABLE)
    }
  }

  async updateRemarks(
    userAliasId: number,
    remarks: string | null
  ): Promise<{ id: number; remarks: string | null }> {
    const userAlias = await this.userAliasesRepository.findOneBy({ id: userAliasId })
    if (!userAlias) throw new ApiError(ErrorCode.USERID_NOT_FOUND)
    userAlias.remarks = remarks ?? null
    await this.userAliasesRepository.save(userAlias)
    return { id: userAlias.id, remarks: userAlias.remarks }
  }

  async editStudentContactInfo(params: CreateAndUpdateStudentContactInfoDto) {
    if (
      !params.userId ||
      !params.institutionId ||
      params.userId === 0 ||
      params.institutionId === 0
    ) {
      throw new NotFoundException(UserErrorMessage.USER_NOT_FOUND)
    }

    params.contactEmail = transformEmail(params.contactEmail)
    params.contactPhone = transformPhone(params.contactPhone)

    const userAlias = await this.userAliasesRepository.findOrCreate({
      institutionId: params.institutionId,
      userId: params.userId,
      alias: params.contactName,
      phone: params.contactPhone,
    })
    return userAlias
  }

  async updateContactInfoV2(params: CreateOrUpdateStudentContactInfoV2Dto) {
    const user = await this.userRepository.findOneBy({ id: params.userId })
    if (!user) throw new ApiError(ErrorCode.USERID_NOT_FOUND)

    const institution = await this.institutionsRepository.findOneBy({ id: params.institutionId })
    if (!institution) throw new ApiError(ErrorCode.INSTITUTION_NOT_FOUND)

    // Check if the user alias exists, then create it if it doesn't
    let userAlias = await this.userAliasesRepository.findOneBy({
      id: params.userAliasId,
    })

    if (!userAlias) {
      const aliasPassword = await bcrypt.hash(params.phone, 12)
      const newUserAlias = this.userAliasesRepository.create({
        institutionId: params.institutionId,
        userId: params.userId,
        name: params.alias,
        email: params.email,
        refUserId: user.id,
        aliasPassword,
      })
      userAlias = await this.userAliasesRepository.save(newUserAlias)
    } else {
      if (params.alias !== userAlias.name || params.email !== userAlias.email) {
        userAlias.name = params.alias
        userAlias.email = params.email
        userAlias.refUserId = user.id
        await this.userAliasesRepository.save(userAlias)
        await this.userRepository.save(user)
      }
    }

    const isOnlyUserAlias = await this.checkIfIsOnlyUserAlias(params.userId)
    if (isOnlyUserAlias) {
      await this.userRepository.update({ id: params.userId }, { phone: params.phone })
    }

    if (params.invoiceId) {
      try {
        const invoice = await this.invoiceRepository.findOne({
          where: { id: params.invoiceId },
          relations: { enrollCourses: true },
        })
        if (invoice && invoice.enrollCourses && invoice.enrollCourses.length > 0) {
          await this.invoiceRepository.update({ id: params.invoiceId }, { payBy: params.alias })
          const enrollId = invoice.enrollCourses[0].id
          await this.enrollCourseRepository.update(
            { id: enrollId },
            { name: params.alias, email: params.email, phone: params.phone }
          )
        }
      } catch (error) {
        console.error(error)
      }
    }

    return userAlias
  }

  async updateLesson(params: ChangeStudentLessonDto) {
    const studentLesson = await this.studentLessonRepository.findOneById(params.studentLessonId)

    if (!studentLesson) throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND)

    const classLesson = await this.classLessonRepository.findOneById(params.classLessonId)

    if (!classLesson) throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND)

    const exStudentLesson = await this.studentLessonRepository.findByEffectiveClassLessonId(
      [params.classLessonId],
      {
        where: {
          userId: studentLesson.userId,
        },
      }
    )

    if (exStudentLesson) throw new ApiError(ErrorCode.STUDENT_ALREADY_EXIST_IN_CLASS)

    return await this.studentLessonRepository.save({
      ...studentLesson,
      // Preserve original reference on first change only
      ...(studentLesson.changeClassLessonId ? {} : {
        changeClassLessonId: studentLesson.classLessonId,
        changeStartTime: studentLesson.startTime,
        changeEndTime: studentLesson.endTime,
      }),
      classLessonId: classLesson.id,
      startTime: classLesson.startTime,
      endTime: classLesson.endTime,
    })
  }

  async deleteTeachingService(params: DeleteTeachingServiceDto) {
    const enrollCourse = await this.enrollCourseRepository.findOneById(params.enrollCourseId, {
      relations: {
        studentSchedule: {
          studentLessons: true,
        },
        invoice: {
          paymentEvidence: true,
        },
      },
    })

    if (!enrollCourse) throw new ApiError(ErrorCode.CLASS_NOT_FOUND)
    const invoice = enrollCourse.invoice
    const paymentEvidences = invoice ? [invoice.paymentEvidence].filter(Boolean) : []

    const studentSchedules = enrollCourse.studentSchedule
    const studentLessons = enrollCourse.studentSchedule.flatMap((d) => d.studentLessons)
    // Remove invoice
    if (invoice) {
      await this.invoiceRepository.softRemove(invoice)
    }
    // Remove payment evidence
    await this.paymentEvidenceRepository.softRemove(paymentEvidences)
    // Remove student schedules
    await this.studentScheduleRepository.softRemove(studentSchedules)
    // Remove student lessons
    await this.studentLessonRepository.softRemove(studentLessons)
    // Remove enrollCourse
    return await this.enrollCourseRepository.softRemove({ id: params.enrollCourseId })
  }

  async deleteSingleStudentLesson(id: number) {
    const studentLesson = await this.studentLessonRepository.findOneById(id)
    if (!studentLesson) throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND)

    const studentSchedule = await this.studentScheduleRepository.findOneById(
      studentLesson.studentScheduleId,
      {
        relations: {
          studentLessons: true,
        },
      }
    )

    if (studentSchedule && studentSchedule.studentLessons.length > 1) {
      const firstSchedule = studentSchedule.studentLessons.filter((item) => item !== studentLesson)

      const firstLesson = firstSchedule[0]
      const newStudentSchedule = {
        ...studentSchedule,

        firstStudentLesson: firstLesson,
      }

      await this.studentScheduleRepository.save(newStudentSchedule)
    } else {
      // delte the student lesson first
      await this.studentLessonRepository.softRemove({ id })

      // Delete the student schedule
      await this.studentScheduleRepository.softRemove(studentSchedule)
    }

    return await this.studentLessonRepository.softRemove({ id })
  }

  async getCoupons(params: StudentCouponDto) {
    return await this.couponsService.getCoupons(params)
  }

  async getAllStudentLessonsOfUser({
    userId,
    institutionId,
  }: {
    userId: number
    institutionId: number
  }): Promise<StudentAllLessonsReponseDto[]> {
    const studentLessons = await this.studentLessonRepository.find({
      // Only find those within today
      where: {
        userId,
        institutionId,
        enrollCourse: {
          confirmState: EnrollConfirmStatus.ACCEPTED,
        },
      },
      relations: {
        class: true,
        course: true,
        enrollCourse: true,
      },
    })

    if (!studentLessons) return []

    const user = await this.userRepository.findOne({ where: { id: userId } })

    if (!user) return []

    const userAlias = await this.userAliasesRepository.findOne({
      where: { userId, institutionId },
      relations: { user: true },
    })

    return studentLessons
      .map((sl) => {
        return {
          name: userAlias?.name ?? user.firstName,
          email: user.email,
          studentId: user.id,
          phone: userAlias?.user.phone ?? user.phone,
          courseName: sl.course?.name ?? '',
          className: sl.class?.name ?? '',
          studentLesson: sl,
          registrationForm: sl.enrollCourse.registrationForm,
        }
      })
      .filter((d) => !!d)
  }

  async getEnrolledStudentLessonsForScanning(
    body: GetEnrolledLessonsDto
  ): Promise<StudentAttendanceDataResponse[]> {
    const res = []
    let isUseOriginalLesson = true

    let lessons: StudentLesson[] = await this.studentLessonRepository.find({
      where: { id: In(body.studentLessonIds) },
    })

    // Check if ALL lessons inside have a valid enrollCourse
    const enrollCourseIds = lessons.map((lesson) => lesson.enrollCourseId)
    const validEnrollCourses = await this.enrollCourseRepository.find({
      where: { id: In(enrollCourseIds) },
      select: ['id'],
    })

    const validEnrollCourseIds = new Set(validEnrollCourses.map((ec) => ec.id))
    const isUseOriginalLessonArray = lessons.map((lesson) =>
      validEnrollCourseIds.has(lesson.enrollCourseId)
    )

    isUseOriginalLesson = isUseOriginalLessonArray.every((item) => item)

    // Use the invoice token to get the lessons if the original lesson is not valid
    if (!isUseOriginalLesson) {
      if (!body.invoiceToken) {
        throw new ApiError(StudentErrorMessage.STUDENT_NOT_FOUND)
      }

      const invoice = await this.invoiceRepository.findOne({
        where: {
          proofToken: body.invoiceToken,
        },
        relations: {
          enrollCourses: true,
        },
      })

      if (!invoice) throw new ApiError(StudentErrorMessage.STUDENT_NOT_FOUND)
      const firstEnrollCourse = invoice.enrollCourses.at(0)
      lessons = await this.studentLessonRepository.find({
        where: {
          enrollCourseId: firstEnrollCourse.id,
        },
      })
    }

    for (const sl of lessons) {
      const data = new StudentAttendanceDataResponse()

      const student = await this.userRepository.findOne({
        where: {
          id: sl.userId,
        },
      })

      const enrollCourse = await this.enrollCourseRepository.findOne({
        where: {
          id: sl.enrollCourseId,
        },
      })

      if (!enrollCourse) {
        throw new ApiError(StudentErrorMessage.STUDENT_NOT_FOUND)
      }

      const course = await this.courseRepository.findOne({ where: { id: sl.courseId } })

      const class_ = await this.classRepository.findOne({ where: { id: sl.classId } })

      data.studentId = student.id
      data.studentLesson = sl
      data.registrationForm = enrollCourse.registrationForm
      data.name = student.firstName
      data.email = student.email
      data.phone = student.phone
      data.courseName = course.name
      data.className = class_.name

      res.push(data)
    }
    return res
  }

  async updateEnrollCourse(params: UpdateEnrollCourseDto): Promise<EnrollCourse> {
    const enrollCourse = await this.enrollCourseRepository.findOneBy({ id: params.enrollCourseId })

    if (!enrollCourse) throw new ApiError(ErrorCode.CLASS_NOT_FOUND)

    if (params.confirmState) {
      enrollCourse.confirmState = params.confirmState
    }

    if (params.billingStartDate) {
      enrollCourse.billingStartDate = new Date(params.billingStartDate)
    }
    if (params.billingEndDate) {
      enrollCourse.billingEndDate = new Date(params.billingEndDate)
    }
    if (params.billingNextDate) {
      enrollCourse.billingNextDate = new Date(params.billingNextDate)
    }

    if (params.price) {
      const pricingOption = await this.classPriceOptionRepository.findOneBy({
        id: enrollCourse.priceOptionId,
      })
      // if (!pricingOption) throw new ApiError(ErrorCode.PRICE_OPTION_NOT_FOUND)

      if (pricingOption) {
        pricingOption.amount = params.price

        await this.classPriceOptionRepository.save(pricingOption)
      }

      enrollCourse.paymentAmount = params.price
    }

    if (params.isPaused !== undefined) {
      enrollCourse.isPaused = params.isPaused
    }

    return await this.enrollCourseRepository.save(enrollCourse)
  }

  async addExtraLesson(createExtraLessonDto: CreateExtraLessonDto): Promise<string> {
    /**
     * The Flow:
     * 1. Find the enrollCourse
     * 2. Find the current invoice associated with the enroll course
     * 3. Find the student schedule
     * 4. Add new student lessons to the existing schedule
     */
    const enrollCourse = await this.enrollCourseRepository.findOne({
      where: {
        id: createExtraLessonDto.enrollId,
      },
      relations: {
        course: true,
      },
    })
    if (!enrollCourse) {
      throw new NotFoundException(EnrollCourseErrorMessage.ENROLL_COURSE_NOT_FOUND)
    }

    if (!enrollCourse.invoiceId) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }

    // Find the existing invoice
    const invoice = await this.invoiceRepository.findOne({
      where: {
        id: enrollCourse.invoiceId,
      },
      relations: {
        enrollCourses: {
          course: true,
        },
        studentSchedules: {
          studentLessons: true,
        },
        userAlias: true,
        user: true,
      },
    })

    if (!invoice) {
      throw new NotFoundException(InvoiceErrorMessage.INVOICE_NOT_FOUND)
    }

    const site = await this.sitesRepository.findOneBy({
      id: enrollCourse.siteId,
    })
    if (!site) {
      throw new NotFoundException(SiteErrorMessage.SITE_NOT_FOUND)
    }
    const institution = await this.institutionsRepository.findOne({
      where: {
        id: enrollCourse.institutionId,
      },
      relations: {
        site: true,
      },
    })

    const jwtOption = {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    }

    const token = this.jwtService.sign(
      {
        email: enrollCourse.preferredEmail,
      },
      jwtOption
    )

    // Find the student schedule
    let studentSchedule: StudentSchedule

    if (createExtraLessonDto.studentScheduleId) {
      studentSchedule = await this.studentScheduleRepository.findOne({
        where: {
          id: createExtraLessonDto.studentScheduleId,
          enrollCourseId: enrollCourse.id,
        },
        relations: {
          studentLessons: true,
        },
      })

      if (!studentSchedule) {
        throw new NotFoundException(EnrollCourseErrorMessage.STUDENT_SCHEDULE_NOT_FOUND)
      }
    } else {
      // Find the first student schedule associated with this enroll course and invoice
      studentSchedule = await this.studentScheduleRepository.findOne({
        where: {
          enrollCourseId: enrollCourse.id,
          invoiceId: invoice.id,
        },
        relations: {
          studentLessons: true,
        },
        order: {
          createdAt: 'ASC',
        },
      })

      if (!studentSchedule) {
        throw new NotFoundException(EnrollCourseErrorMessage.STUDENT_SCHEDULE_NOT_FOUND)
      }
    }

    // Create class lessons if needed
    let createdStudentLessons: StudentLesson[] = []
    if (createExtraLessonDto.extraLessons && createExtraLessonDto.extraLessons.length > 0) {
      const classLessons = await this.classLessonService.createLessonToClassLessonTable({
        siteId: enrollCourse.siteId,
        institutionId: enrollCourse.institutionId,
        courseId: enrollCourse.courseId,
        classId: createExtraLessonDto?.classId || studentSchedule?.classId,
        lessonSchedules: createExtraLessonDto.extraLessons,
      })

      // Connect class lessons to student lessons
      createdStudentLessons = await this.classLessonService.connectClassLessonToStudentLesson({
        classLessons,
        studentId: enrollCourse.userId,
        enrollCourseId: enrollCourse.id,
        studentScheduleId: studentSchedule.id,
      })

      // Mark student lessons as extra and send WhatsApp reminders
      const classId = createExtraLessonDto?.classId || studentSchedule?.classId
      const classItem = await this.classRepository.findOneById(classId, {
        relations: {
          locationRoom: true,
          instructor: true,
        },
      })

      for (const studentLesson of createdStudentLessons) {
        // Update student lesson to mark as extra
        studentLesson.isExtra = true
        await this.studentLessonRepository.save(studentLesson)

        // Send WhatsApp reminder for each lesson
        await this.sendWhatsappReminderAddLesson(
          enrollCourse,
          invoice,
          institution,
          classItem,
          studentLesson.startTime,
          studentLesson.endTime
        )
      }
    }

    return token
  }

  async sendWhatsappReminderAddLesson(
    enrollCourse: EnrollCourse,
    invoice: Invoice,
    institution: Institution,
    classItem: ClassEntity,
    startDate: Date,
    endDate: Date
  ) {
    const customMessage = await this.customMessageService.getCustomMessageByType(
      institution.id,
      SupportedType.STUDENT_NOTIF_AFTER_ADD_NEW_LESSON
    )
    const user = await this.usersService.findOneBy({
      id: enrollCourse.userId,
    })
    const adminUser = await this.usersService.getUserOwnerOfInstitution(institution.id)
    if (!user || !adminUser) return
    const accessToken = await this.authService.createToken(
      adminUser,
      this.authService.jwtAdminOption
    )

    const site = await this.sitesRepository.findOneById(enrollCourse.siteId)

    const classLessonDate =
      dayjs(startDate).format('DD/MM/YYYY') + ' - ' + dayjs(endDate).format('DD/MM/YYYY')
    const lessonTime = dayjs(startDate).format('HH:mm') + ' - ' + dayjs(endDate).format('HH:mm')
    const location = classItem.locationRoom?.address || ''
    const instructor = classItem.instructor?.fullName || ''
    const duration = dayjs(endDate).diff(startDate, 'minutes')

    const whatsappReminderDto = {
      recipientUserId: user.id,
      institutionId: enrollCourse.institutionId,
      siteId: enrollCourse.siteId,
      institutionName: institution?.name,
      wtsPhoneNumber: institution?.phone,
      studentPhone: enrollCourse.preferredPhone,
      studentName: enrollCourse.preferredName,
      studentEmail: enrollCourse.preferredEmail,
      courseName: enrollCourse.course?.name,
      className: classItem.name,
      classLessonDate,
      lessonTime,
      location,
      duration: `${duration} minutes`,
      successPaymentLink: buildSuccessPaymentLink({
        institution,
        invoice,
        enrollCourse,
        site,
      }),
      instructor,
      classLessonDuration: duration,
      token: accessToken,
      accountId: adminUser.id,
    }
    const isWhatsappEnabled = await this.isWhatsappEnabled(
      user.id,
      institution.id,
      SupportedType.STUDENT_NOTIF_AFTER_ADD_NEW_LESSON
    )

    if (isWhatsappEnabled !== undefined && !isWhatsappEnabled) return

    if (customMessage) {
      const content = replaceContentVariables(customMessage.content, whatsappReminderDto)
      await this.whatsappWebService.sendWhatsappMessage(
        {
          content,
          institutionId: institution.id,
          phone: enrollCourse.preferredPhone,
        },
        {
          recipientUserId: user.id,
          recipientUserPhone: enrollCourse.preferredPhone,
          institutionId: institution.id,
          siteId: institution.siteId,
        }
      )
    } else {
      await this.notificationRecordService.saveNotificationLog({
        messageContent: JSON.stringify(whatsappReminderDto),
        notificationStatus: NotificationStatus.FAILED,
        recipientUserId: user.id,
        recipientUserPhone: user.phone,
        institutionId: institution.id,
        siteId: institution.siteId,
      })
    }
  }

  async getStudentChangeLesson(params: StudentChangeLessonOptDto): Promise<ClassLesson[]> {
    const studentLesson = await this.studentLessonRepository.findOneById(params.studentLessonId)

    if (!studentLesson) throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND)

    const lessons = await this.studentLessonRepository
      .createQueryBuilder()
      .select(
        `( CASE WHEN change_class_lesson_id IS NULL THEN class_lesson_id ELSE change_class_lesson_id END ) AS "clId"`
      )
      .where({
        userId: studentLesson.userId,
        institutionId: studentLesson.institutionId,
      })
      .getRawMany()

    const clIds = _.map(lessons, (l) => l.clId)

    return await this.classLessonRepository
      .createQueryBuilder('cl')
      .leftJoinAndSelect(ClassEntity, 'c', 'c.id = cl.class_id')
      .leftJoinAndSelect(Course, 'co', 'co.id = cl.course_id')
      .select(
        `
        cl.id,
        co.id as "courseId",
        co.name as "courseName",
        co.preview_image_url as "courseImg",
        c.id as "classId",
        c.name as "className",
        (CASE WHEN cl.change_date IS NULL THEN cl.date ELSE cl.change_date END ) AS date,
        (CASE WHEN cl.change_start_time IS NULL THEN cl.start_time ELSE cl.change_start_time END ) AS "startTime",
        (CASE WHEN cl.change_end_time IS NULL THEN cl.end_time ELSE cl.change_end_time END ) AS "endTime"
      `
      )
      .where(`cl.id NOT IN (:...ids)`, { ids: clIds })
      .andWhere({
        institutionId: studentLesson.institutionId,
      })
      .andWhere(`cl.start_time > :date`, {
        date: dayjs().toDate(),
      })
      .getRawMany()
  }

  async changeStudentLesson(
    {
      siteId,
      institutionId,
      courseId,
      classId,
      lessonDateTime,
      currentLessonId,
      isSendEmail,
    }: StudentChangeLessonDto,
    user: User
  ): Promise<StudentLesson> {
    // Use transaction to ensure data consistency
    return await this.dataSource.transaction(async (transactionalEntityManager) => {
      const studentLesson = await transactionalEntityManager.findOne(StudentLesson, {
        where: { id: currentLessonId },
        relations: {
          studentSchedule: {
            invoice: true,
            enrollCourses: true,
          },
          class: {
            locationRoom: true,
            instructor: true,
          },
        },
      })

      // Null safety check
      if (!studentLesson) {
        throw new ApiError(ErrorCode.STUDENT_LESSON_NOT_FOUND)
      }

      // Validate studentSchedule exists
      if (!studentLesson.studentSchedule) {
        throw new ApiError(
          ErrorCode.CLASS_LESSON_NOT_FOUND,
          'Student schedule not found for this lesson'
        )
      }

      // Validate invoice exists
      if (!studentLesson.studentSchedule.invoice) {
        throw new ApiError(
          ErrorCode.CLASS_LESSON_NOT_FOUND,
          'Invoice not found for this enrollment'
        )
      }

      const institution = await transactionalEntityManager.findOne(Institution, {
        where: { id: institutionId },
        relations: {
          site: true,
        },
      })

      if (!institution) {
        throw new ApiError(ErrorCode.INSTITUTION_NOT_FOUND)
      }

      const resultStudentLesson = await this.handleSameCourseClassChangeWithTransaction({
        studentLesson,
        courseId,
        classId,
        siteId,
        institutionId,
        lessonDateTime,
        isSendEmail,
        institution,
        user,
        transactionalEntityManager,
      })

      return resultStudentLesson
    })
  }

  private async handleCourseOrClassChangeWithTransaction({
    studentLesson,
    courseId,
    classId,
    siteId,
    institutionId,
    lessonDateTime,
    isSendEmail,
    institution,
    user,
    transactionalEntityManager,
  }: {
    studentLesson: StudentLesson
    courseId: number
    classId: number
    siteId: number
    institutionId: number
    lessonDateTime: LessonString | string
    isSendEmail: boolean
    institution: Institution
    user: any
    transactionalEntityManager: any
  }): Promise<StudentLesson> {
    // Create class lesson for the new course/class
    const classLessonArray = await this.classLessonService.createLessonToClassLessonTable({
      siteId,
      institutionId,
      courseId,
      classId,
      lessonSchedules: [lessonDateTime as LessonString],
    })

    if (!classLessonArray || classLessonArray.length === 0) {
      throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND)
    }

    const classLesson = classLessonArray[0] as ClassLesson
    const startTime = classLesson.changeStartTime ?? classLesson.startTime
    const endTime = classLesson.changeEndTime ?? classLesson.endTime

    // Get current enrollment - use the first enrollCourse or find by enrollCourseId
    let currentEnrollCourse = studentLesson.studentSchedule.enrollCourses?.[0] as EnrollCourse

    if (!currentEnrollCourse) {
      // Fallback: find by enrollCourseId
      currentEnrollCourse = await transactionalEntityManager.findOne(EnrollCourse, {
        where: { id: studentLesson.enrollCourseId },
      })
    }

    if (!currentEnrollCourse) {
      throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND, 'Enrollment not found')
    }

    const currentInvoice = studentLesson.studentSchedule.invoice

    // Create new enroll course under the same invoice
    const newEnrollCourse = await this.createNewEnrollCourseForLessonChangeWithTransaction({
      currentEnrollCourse,
      courseId,
      classId,
      institutionId,
      siteId,
      currentInvoice,
      transactionalEntityManager,
    })

    // Always create a new student lesson for the new course/class
    const resultStudentLesson = await this.createNewStudentLessonForCourseChangeWithTransaction({
      originalStudentLesson: studentLesson,
      newEnrollCourse,
      classLesson,
      startTime,
      endTime,
      institutionId,
      currentInvoice,
      transactionalEntityManager,
    })

    // Always update the original student lesson with change information for record keeping
    // Mark the old student lesson as isCheckin = true so it won't be retrieved in the original class-lesson list
    // This ensures that when a student is moved to a different class/course, they don't appear
    // in the original class's lesson list
    studentLesson.changeClassLessonId = classLesson.id
    studentLesson.changeStartTime = startTime
    studentLesson.changeEndTime = endTime
    studentLesson.isCheckin = true
    await transactionalEntityManager.save(StudentLesson, studentLesson)

    // Clean up old class lessons if no other students are using them
    await this.cleanupOldClassLessonsWithTransaction(studentLesson, transactionalEntityManager)

    // Send email/WhatsApp notification if requested (outside transaction to avoid blocking)
    // Note: We do this after transaction to avoid holding the transaction open
    if (isSendEmail) {
      // Using setImmediate to send after transaction commits
      setImmediate(async () => {
        try {
          await this.sendChangeLessonReminder(institution, user, resultStudentLesson)
        } catch (error) {
          console.error('Failed to send change lesson reminder:', error)
        }
      })
    }

    // Record the lesson change log
    await this.recordLogRescheduleLessonWithTransaction({
      institutionId,
      classLessonId: this.studentLessonRepository.getEffectiveClassLessonId(resultStudentLesson),
      studentLesson: resultStudentLesson,
      user,
      transactionalEntityManager,
    })

    return resultStudentLesson
  }

  private async handleSameCourseClassChangeWithTransaction({
    studentLesson,
    courseId,
    classId,
    siteId,
    institutionId,
    lessonDateTime,
    isSendEmail,
    institution,
    user,
    transactionalEntityManager,
  }: {
    studentLesson: StudentLesson
    courseId: number
    classId: number
    siteId: number
    institutionId: number
    lessonDateTime: LessonString | string
    isSendEmail: boolean
    institution: Institution
    user: any
    transactionalEntityManager: any
  }): Promise<StudentLesson> {
    // Create class lesson for the same course/class
    const classLessonArray = await this.classLessonService.createLessonToClassLessonTable({
      siteId,
      institutionId,
      courseId,
      classId,
      lessonSchedules: [lessonDateTime as LessonString],
    })

    if (!classLessonArray || classLessonArray.length === 0) {
      throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND)
    }

    const classLesson = classLessonArray[0]
    const startTime = classLesson.changeStartTime ?? classLesson.startTime
    const endTime = classLesson.changeEndTime ?? classLesson.endTime

    // Check if the current slot (classLessonId) will be vacated — soft-delete if no other students
    const currentClassLesson = await transactionalEntityManager.findOne(ClassLesson, {
      where: { id: studentLesson.classLessonId },
    })

    if (currentClassLesson) {
      const studentLessons = await this.studentLessonRepository.findByEffectiveClassLessonId(
        [currentClassLesson.id],
        {
          where: {
            id: Not(studentLesson.id),
          },
        }
      )

      // check if there is any other student in this class lesson
      if (!studentLessons?.length) {
        currentClassLesson.deletedAt = getCurrentTimeStamp() as unknown as Date
        await transactionalEntityManager.save(ClassLesson, currentClassLesson)
      }
    }
    // changeClassLessonId is the original reference — never clean it up

    const originalClassId = studentLesson.classId

    // Preserve original reference on first change only
    if (!studentLesson.changeClassLessonId) {
      studentLesson.changeClassLessonId = studentLesson.classLessonId
      studentLesson.changeStartTime = studentLesson.startTime
      studentLesson.changeEndTime = studentLesson.endTime
    }
    // Update primary fields to the new/current lesson
    studentLesson.classLessonId = classLesson.id
    studentLesson.startTime = startTime
    studentLesson.endTime = endTime
    studentLesson.classId = classLesson.classId
    studentLesson.courseId = classLesson.courseId

    const res = await transactionalEntityManager.save(StudentLesson, studentLesson)

    // When the class changes, update the EnrollClassMapping so TeachingService
    // always reflects the correct current class. Try to match by the old classId
    // first; fall back to any existing mapping for this enrollment (handles cases
    // where prior changes left the mapping out of sync).
    if (originalClassId !== classLesson.classId) {
      let enrollClassMapping = await transactionalEntityManager.findOne(EnrollClassMapping, {
        where: {
          enrollCourseId: studentLesson.enrollCourseId,
          classId: originalClassId,
        },
      })
      if (!enrollClassMapping) {
        // Fallback: find any mapping for this enrollment
        enrollClassMapping = await transactionalEntityManager.findOne(EnrollClassMapping, {
          where: { enrollCourseId: studentLesson.enrollCourseId },
          order: { id: 'DESC' },
        })
      }
      if (enrollClassMapping) {
        enrollClassMapping.classId = classLesson.classId
        await transactionalEntityManager.save(EnrollClassMapping, enrollClassMapping)
      }
    }

    // Send email/WhatsApp notification if requested (outside transaction to avoid blocking)
    if (isSendEmail) {
      setImmediate(async () => {
        try {
          await this.sendChangeLessonReminder(institution, user, studentLesson)
        } catch (error) {
          console.error('Failed to send change lesson reminder:', error)
        }
      })
    }

    await this.recordLogRescheduleLessonWithTransaction({
      institutionId,
      classLessonId: this.studentLessonRepository.getEffectiveClassLessonId(studentLesson),
      studentLesson,
      user,
      transactionalEntityManager,
    })

    return res
  }

  private async createNewEnrollCourseForLessonChangeWithTransaction({
    currentEnrollCourse,
    courseId,
    classId,
    institutionId,
    siteId,
    currentInvoice,
    transactionalEntityManager,
  }: {
    currentEnrollCourse: EnrollCourse
    courseId: number
    classId: number
    institutionId: number
    siteId: number
    currentInvoice: Invoice
    transactionalEntityManager: any
  }): Promise<EnrollCourse> {
    // get detail classId
    const detailClass = await this.classRepository.findOne({
      where: { id: classId },
      relations: { course: true },
    })

    if (!detailClass) {
      throw new ApiError(ErrorCode.CLASS_NOT_FOUND, 'Class not found')
    }

    // Create new enroll course based on the current one but with new course/class info
    const newEnrollCourse = transactionalEntityManager.create(EnrollCourse, {
      siteId,
      institutionId,
      userId: currentEnrollCourse.userId,
      userAliasId: currentEnrollCourse.userAliasId,
      courseId,
      name: currentEnrollCourse.name,
      email: currentEnrollCourse.email,
      phone: currentEnrollCourse.phone,
      confirmState: currentEnrollCourse.confirmState,
      currency: currentEnrollCourse.currency,
      paymentAmount: currentEnrollCourse.paymentAmount,
      billingStartDate: currentEnrollCourse.billingStartDate,
      billingEndDate: currentEnrollCourse.billingEndDate,
      billingNextDate: currentEnrollCourse.billingNextDate,
      billingFormatId: currentEnrollCourse.billingFormatId,
      priceOptionId: currentEnrollCourse.priceOptionId,
      registrationForm: currentEnrollCourse.registrationForm,
      enrollInto: [
        ...(currentEnrollCourse.enrollInto || []),
        {
          courseName: detailClass.course?.name,
          lessonCount: 1,
          secondLevelName: detailClass.name,
          type: detailClass.type,
        },
      ],
    })

    const savedEnrollCourse = await transactionalEntityManager.save(EnrollCourse, newEnrollCourse)

    // create EnrollClassMapping for the new enroll course
    const enrollClassMapping = transactionalEntityManager.create(EnrollClassMapping, {
      enrollCourseId: savedEnrollCourse.id,
      classId,
      lessonPrice: currentEnrollCourse.paymentAmount,
    })
    await transactionalEntityManager.save(EnrollClassMapping, enrollClassMapping)

    // Link the new enroll course to the existing invoice
    // Reload invoice to ensure we have the latest data
    const latestInvoice = await transactionalEntityManager.findOne(Invoice, {
      where: { id: currentInvoice.id },
      relations: { enrollCourses: true },
    })

    if (!latestInvoice) {
      throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND, 'Invoice not found')
    }

    if (latestInvoice.enrollCourses) {
      latestInvoice.enrollCourses.push(savedEnrollCourse)
    } else {
      latestInvoice.enrollCourses = [savedEnrollCourse]
    }
    await transactionalEntityManager.save(Invoice, latestInvoice)

    return savedEnrollCourse
  }

  private async createNewStudentLessonForCourseChangeWithTransaction({
    originalStudentLesson,
    newEnrollCourse,
    classLesson,
    startTime,
    endTime,
    institutionId,
    currentInvoice,
    transactionalEntityManager,
  }: {
    originalStudentLesson: StudentLesson
    newEnrollCourse: EnrollCourse
    classLesson: ClassLesson
    startTime: Date
    endTime: Date
    institutionId: number
    currentInvoice: Invoice
    transactionalEntityManager: any
  }): Promise<StudentLesson> {
    // Create new student lesson for the new course/class
    const newStudentLesson = transactionalEntityManager.create(StudentLesson, {
      institutionId,
      courseId: classLesson.courseId,
      enrollCourseId: newEnrollCourse.id,
      classId: classLesson.classId,
      userId: originalStudentLesson.userId,
      classLessonId: classLesson.id,
      startTime,
      endTime,
      isCheckin: false,
      isExtra: originalStudentLesson.isExtra,
      attendance: originalStudentLesson.attendance,
      expiryDate: originalStudentLesson.expiryDate,
    })

    const savedStudentLesson = await transactionalEntityManager.save(
      StudentLesson,
      newStudentLesson
    )

    // Create a new student schedule for the new enroll course
    const newStudentSchedule = transactionalEntityManager.create(StudentSchedule, {
      type: originalStudentLesson.studentSchedule?.type || ClassTypeEnum.REGULAR,
      classId: classLesson.classId,
      enrollCourseId: newEnrollCourse.id,
      invoiceId: currentInvoice.id,
      firstStudentLessonId: savedStudentLesson.id,
    })

    await transactionalEntityManager.save(StudentSchedule, newStudentSchedule)

    // Update the new student lesson with the schedule
    savedStudentLesson.studentScheduleId = newStudentSchedule.id
    await transactionalEntityManager.save(StudentLesson, savedStudentLesson)

    return savedStudentLesson
  }

  private async cleanupOldClassLessonsWithTransaction(
    studentLesson: StudentLesson,
    transactionalEntityManager: any
  ): Promise<void> {
    const oldClassLesson = await transactionalEntityManager.findOne(ClassLesson, {
      where: { id: studentLesson.classLessonId },
    })

    const changeClassLesson = await transactionalEntityManager.findOne(ClassLesson, {
      where: { id: studentLesson.changeClassLessonId },
    })

    if (oldClassLesson) {
      const studentLessons = await this.studentLessonRepository.findByEffectiveClassLessonId(
        [oldClassLesson.id],
        {
          where: {
            id: Not(studentLesson.id),
          },
        }
      )

      // check if there is any other student in this class lesson
      if (!studentLessons?.length) {
        oldClassLesson.deletedAt = getCurrentTimeStamp() as unknown as Date
        await transactionalEntityManager.save(ClassLesson, oldClassLesson)
      }
    }

    if (changeClassLesson) {
      const studentLessons = await this.studentLessonRepository.findByEffectiveClassLessonId(
        [changeClassLesson.id],
        {
          where: {
            id: Not(studentLesson.id),
          },
        }
      )

      // check if there is any other student in this class lesson
      if (!studentLessons?.length) {
        changeClassLesson.deletedAt = getCurrentTimeStamp() as unknown as Date
        await transactionalEntityManager.save(ClassLesson, changeClassLesson)
      }
    }
  }

  extractDateVariables(classItem: ClassEntity, studentLesson: StudentLesson) {
    const location = classItem.locationRoom?.address || ''
    const instructor = classItem.instructor?.firstName || ''
    const timeZoneId = classItem.site?.timeZone?.id || 'UTC'

    const oldClassLessonStartDate = dayjs(studentLesson.changeStartTime)
      .tz(timeZoneId)
      .format('DD/MM/YYYY HH:mm')
    const oldClassLessonEndTime = dayjs(studentLesson.changeEndTime)
      .tz(timeZoneId)
      .format('DD/MM/YYYY HH:mm')
    const newClassLessonStartDate = dayjs(studentLesson.startTime)
      .tz(timeZoneId)
      .format('DD/MM/YYYY HH:mm')
    const newClassLessonEndDate = dayjs(studentLesson.endTime)
      .tz(timeZoneId)
      .format('DD/MM/YYYY HH:mm')

    return {
      location,
      instructor,
      oldClassLessonStartDate,
      oldClassLessonEndTime,
      newClassLessonStartDate,
      newClassLessonEndDate,
    }
  }

  async sendChangeLessonReminder(
    institution: Institution,
    user: User,
    studentLesson: StudentLesson
  ) {
    const { class: classItem, enrollCourse } = studentLesson
    const { course } = enrollCourse
    const { site } = institution
    const {
      location,
      instructor,
      oldClassLessonStartDate,
      oldClassLessonEndTime,
      newClassLessonStartDate,
      newClassLessonEndDate,
    } = this.extractDateVariables(classItem, studentLesson)

    const emailReminderVariables: ChangeLessonEmailDTO = {
      price: enrollCourse.paymentAmount,
      classId: classItem.id,
      courseId: course.id,
      periodId: studentLesson.studentSchedule.periodId,
      adminEmail: institution.email,
      adminPhone: institution.phone,
      institutionName: institution.name,
      location,
      instructor,
      timeZone: site.timeZone.id,
      classLessonDate: `${oldClassLessonStartDate} - ${oldClassLessonEndTime}`,
      newClassLessonDate: `${newClassLessonStartDate} - ${newClassLessonEndDate}`,
      courseName: course.name,
      className: classItem.name,
      studentEmail: enrollCourse.preferredEmail,
      studentName: enrollCourse.preferredName,
      studentFirstName: enrollCourse.preferredName,
      studentPhone: enrollCourse.preferredPhone,
      recipientUserId: user.id,
      institutionId: institution.id,
      siteId: site.id,
    }

    await this.emailService.sendStudentChangeLessonEmail(emailReminderVariables)

    const customMessage = await this.customMessageService.getCustomMessageByType(
      institution.id,
      SupportedType.STUDENT_NOTIF_AFTER_CHANGE_LESSON_DATE
    )
    const isWhatsappEnabled = await this.isWhatsappEnabled(
      user.id,
      institution.id,
      SupportedType.STUDENT_NOTIF_AFTER_CHANGE_LESSON_DATE
    )

    if (isWhatsappEnabled !== undefined && !isWhatsappEnabled) return

    if (customMessage) {
      const content = replaceContentVariables(customMessage.content, emailReminderVariables)
      try {
        await this.whatsappWebService.sendWhatsappMessage(
          {
            content,
            institutionId: institution.id,
            phone: enrollCourse.preferredPhone,
          },
          {
            recipientUserId: user.id,
            recipientUserPhone: enrollCourse.preferredPhone,
            institutionId: institution.id,
            siteId: site.id,
          }
        )
      } catch (e) {
        console.log(e)
      }
    }
  }

  async updateLessonAttendance(
    updateLessonAttendanceDto: UpdateLessonAttendanceDto
  ): Promise<{ id: number; attendance: AttendanceStatus }> {
    const { studentLessonId, attendance } = updateLessonAttendanceDto
    const { affected } = await this.studentLessonRepository.update(
      { id: studentLessonId },
      { attendance }
    )
    if (!affected) throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND)
    return { id: studentLessonId, attendance }
  }

  async recordLogRescheduleLesson({
    classLessonId,
    institutionId,
    studentLesson,
    user,
  }: {
    classLessonId: number
    institutionId: number
    studentLesson: StudentLesson
    user: User
  }): Promise<RecordLog> {
    const dataLog = await this.studentLessonRepository
      .createQueryBuilder('stu')
      .leftJoin('class_lessons', 'cll_new', 'cll_new.id = stu.class_lesson_id')
      .leftJoin('classes', 'cl_new', 'cl_new.id = cll_new.class_id')
      .leftJoin('courses', 'co_new', 'co_new.id = cll_new.course_id')
      .leftJoin('class_lessons', 'cll_old', 'cll_old.id = stu.change_class_lesson_id')
      .leftJoin('classes', 'cl_old', 'cl_old.id = cll_old.class_id')
      .leftJoin('courses', 'co_old', 'co_old.id = cll_old.course_id')
      .leftJoin('users', 'u', 'u.id = stu.user_id')
      .where({
        id: studentLesson.id,
      })
      .select([
        'cl_old.name as "oldClassName"',
        'co_old.name as "oldCourseName"',
        'cl_new.name as "newClassName"',
        'co_new.name as "newCourseName"',
        'u.first_name as "studentFirstName"',
        'u.last_name as "studentLastName"',
      ])
      .getRawOne()

    return this.recordLogRepository.save(
      this.recordLogRepository.create({
        type: RecordLogType.RESCHEDULE_LESSON,
        institutionId,
        detail: {
          newClassName: dataLog.newClassName,
          newCourseName: dataLog.newCourseName,
          oldClassName: dataLog.oldClassName,
          oldCourseName: dataLog.oldCourseName,
          educatorFirstName: user.firstName,
          educatorLastName: user.lastName,
          educatorId: user.id,
          studentFirstName: dataLog.studentFirstName,
          studentLastName: dataLog.studentLastName,
          oldStartTime: studentLesson.changeStartTime,
          oldEndTime: studentLesson.changeEndTime,
          classLessonId,
          classLessonStartTime: studentLesson.startTime,
          classLessonEndTime: studentLesson.endTime,
          modifiedDate: dayjs().toDate(),
        },
        userId: studentLesson.userId,
      })
    )
  }

  async recordLogRescheduleLessonWithTransaction({
    classLessonId,
    institutionId,
    studentLesson,
    user,
    transactionalEntityManager,
  }: {
    classLessonId: number
    institutionId: number
    studentLesson: StudentLesson
    user: User
    transactionalEntityManager: any
  }): Promise<RecordLog> {
    const dataLog = await this.studentLessonRepository
      .createQueryBuilder('stu')
      .leftJoin('class_lessons', 'cll_new', 'cll_new.id = stu.class_lesson_id')
      .leftJoin('classes', 'cl_new', 'cl_new.id = cll_new.class_id')
      .leftJoin('courses', 'co_new', 'co_new.id = cll_new.course_id')
      .leftJoin('class_lessons', 'cll_old', 'cll_old.id = stu.change_class_lesson_id')
      .leftJoin('classes', 'cl_old', 'cl_old.id = cll_old.class_id')
      .leftJoin('courses', 'co_old', 'co_old.id = cll_old.course_id')
      .leftJoin('users', 'u', 'u.id = stu.user_id')
      .where({
        id: studentLesson.id,
      })
      .select([
        'cl_old.name as "oldClassName"',
        'co_old.name as "oldCourseName"',
        'cl_new.name as "newClassName"',
        'co_new.name as "newCourseName"',
        'u.first_name as "studentFirstName"',
        'u.last_name as "studentLastName"',
      ])
      .getRawOne()

    return transactionalEntityManager.save(
      RecordLog,
      transactionalEntityManager.create(RecordLog, {
        type: RecordLogType.RESCHEDULE_LESSON,
        institutionId,
        detail: {
          newClassName: dataLog?.newClassName,
          newCourseName: dataLog?.newCourseName,
          oldClassName: dataLog?.oldClassName,
          oldCourseName: dataLog?.oldCourseName,
          educatorFirstName: user.firstName,
          educatorLastName: user.lastName,
          educatorId: user.id,
          studentFirstName: dataLog?.studentFirstName,
          studentLastName: dataLog?.studentLastName,
          oldStartTime: studentLesson.changeStartTime,
          oldEndTime: studentLesson.changeEndTime,
          classLessonId,
          classLessonStartTime: studentLesson.startTime,
          classLessonEndTime: studentLesson.endTime,
          modifiedDate: dayjs().toDate(),
        },
        userId: studentLesson.userId,
      })
    )
  }

  async studentEnrollment(institutionId: number, userId: number, userAliasId: number) {
    const historicalFormData = await this.enrollCourseService.getUserHistoricalFormData(
      userId,
      userAliasId || 0,
      institutionId
    )
    const studentForms = await this.studentFormRepository.find({
      where: [{ userId, institutionId, userAliasId }],
      order: { updatedAt: 'DESC' },
    })
    let studentFormData = {}

    if (studentForms.length > 0) {
      const listOfFieldIds = studentForms.map((studentForm) => {
        return getNumberIdFromFieldId(studentForm.formFieldId)
      })

      const listOfFields = await this.commonFieldRepository.find({
        where: { id: In(listOfFieldIds) },
      })

      studentFormData = _.reduce(
        studentForms,
        (data, studentForm: StudentForm) => {
          if (studentForm.formFieldValue) {
            const fieldType = listOfFields.find((field) => {
              const formFieldId = studentForm.formFieldId
              if (isNaN(Number(formFieldId))) {
                return formFieldId.includes(field.id.toString())
              }
              return +formFieldId === field.id
            })

            data[studentForm.formFieldId] = {
              id: fieldType?.id,
              question: fieldType?.question,
              order: fieldType?.order,
              columnMapping: fieldType?.columnMapping,
              isDefault: fieldType?.isDefault,
              type: fieldType?.type,
              value: studentForm.formFieldValue,
              isRequire: fieldType?.isRequire,
              option: fieldType?.option,
            }
          }
          return data
        },
        {}
      )
    }

    // merge two data sources
    return {
      ...historicalFormData,
      ...studentFormData,
    }
  }

  async getStudentFormField(dto: GetStudentFormFieldsDto): Promise<GetStudentFormResponseDto[]> {
    const studentForms = await this.studentFormRepository.find({
      where: {
        userAliasId: dto.userAliasId,
        institutionId: dto.institutionId,
      },
      order: {
        createdAt: 'DESC', // Sort by created_at in descending order
      },
    })

    if (_.size(studentForms) === 0) {
      return []
    }

    const fieldValues = []
    const fieldIds = []

    for (const form of studentForms) {
      if (!fieldIds.includes(form.formFieldId)) {
        fieldValues.push({
          id: form.formFieldId,
          type: form.formFieldType,
          value: form.formFieldValue as string,
          question: form.formFieldQuestion,
          isDefault: form.formFieldIsDefault,
          order: form.formFieldOrder,
          columnMapping: form.formFieldColumnMapping,
        })
        fieldIds.push(form.formFieldId)
      }
    }

    return await Promise.all(fieldValues)
  }

  async updateStudentLessonRemarks(
    studentLessonId: number,
    remarks: string | null
  ): Promise<{ id: number; remarks: string | null }> {
    const studentLesson = await this.studentLessonRepository.findOne({
      where: { id: studentLessonId },
    })
    if (!studentLesson) throw new ApiError(ErrorCode.CLASS_LESSON_NOT_FOUND)
    await this.studentLessonRepository.update(studentLessonId, { remarks })
    return { id: studentLessonId, remarks }
  }

  async updateStudentForm(params: UpdateStudentFormDto) {
    let studentForms
    if (params.userAliasId) {
      studentForms = await this.studentFormRepository.find({
        where: { userAliasId: params.userAliasId, institutionId: params.institutionId },
      })
    } else {
      studentForms = await this.studentFormRepository.find({
        where: { userId: params.userId, institutionId: params.institutionId },
      })
    }
    // Find forms with both userId and institutionId filter upfront
    if (studentForms.length === 0) {
      throw new ApiError(ErrorCode.FORM_NOT_FOUND)
    }

    // Convert metadata array to Map for O(1) lookup
    const metadataMap = params.metadata.reduce((acc, item) => {
      if (!item.id) return acc
      acc[item.id] = item
      return acc
    }, {})

    // Filter forms that need updating and prepare update data
    const formsToUpdate = studentForms
      .filter((form) => {
        if (typeof form.formFieldId === 'string') {
          const finalFormId = form.formFieldId.split('.')
          if (finalFormId.length === 3) {
            return metadataMap[finalFormId[2]]
          }
        }
        return metadataMap[form.formFieldId]
      })
      .map((form) => {
        if (typeof form.formFieldId === 'string') {
          const finalFormId = form.formFieldId.split('.')
          if (finalFormId.length === 3) {
            return {
              ...form,
              metadata: metadataMap[finalFormId[2]],
              formFieldValue: metadataMap[finalFormId[2]].value as string,
            }
          }
        }
        return {
          ...form,
          metadata: metadataMap[form.formFieldId],
          formFieldValue: metadataMap[form.formFieldId].value as string,
        }
      })

    if (formsToUpdate.length === 0) {
      return []
    }

    if (params.invoiceId && params.metadata) {
      try {
        const invoice = await this.invoiceRepository.findOne({
          where: { id: params.invoiceId },
          relations: { enrollCourses: true },
        })
        if (invoice && invoice.enrollCourses && invoice.enrollCourses.length > 0) {
          const enroll = invoice.enrollCourses[0]
          if (enroll) {
            const registrationForm = enroll.registrationForm.map((o) => {
              if (!o.id?.toString()?.includes('.')) return o
              const id = o.id.split('.')[2]
              const check = params.metadata.find((p) => p.id?.toString() === id?.toString())
              if (!check) return o
              return { ...o, value: check.value as any }
            })
            await this.enrollCourseRepository.update({ id: enroll.id }, { registrationForm })
          }
        }
      } catch (error) {
        console.error(error)
      }
    }

    // Bulk save all updates in one query
    return await this.studentFormRepository.save(formsToUpdate)
  }

  async getColumnCSV(file: Express.Multer.File): Promise<{ clientColHeaders: string[] }> {
    const workbook = XLSX.read(file.buffer, { type: 'buffer' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const range = XLSX.utils.decode_range(worksheet['!ref'])
    const clientColHeaders = []
    let C = range.s.c
    const R = range.s.r /* start in the first row */
    /* walk every column in the range */
    for (C = range.s.c; C <= range.e.c; ++C) {
      const cell =
        worksheet[XLSX.utils.encode_cell({ c: C, r: R })] /* find the cell in the first row */
      let hdr = 'UNKNOWN ' + C
      if (cell && cell.t) hdr = XLSX.utils.format_cell(cell)
      clientColHeaders.push(hdr)
    }

    clientColHeaders.filter((header) => header !== undefined)


    return {
      clientColHeaders,
      // commonFields: [...DEFAULT_FIELD, ...commonFields],
    }
  }

  private mapComplexValue(value: any, fieldType: FieldType) {
    if (!fieldType) {
      return value
    } else if (
      fieldType === FieldType.DATE &&
      (typeof value === 'string' || typeof value === 'number') &&
      !Array.isArray(value)
    ) {
      const iso = toISOStringFromExcelOrString(value)
      if (iso) {
        return iso
      }
    } else if (fieldType === FieldType.MULTIPLE_CHOICE) {
      // Supposedly it should return just a string

      if (value && value !== '') {
        if (Array.isArray(value)) {
          return value
        }
        if (typeof value === 'string') {
          return parseStringToArray(value)
        }
        return []
      }
      return []
    }

    return value
  }

  private csvMapping(file: Express.Multer.File, fields: ImportCommonField[]) {
    const fileExtension = path.extname(file.path).toLowerCase()
    if (fileExtension !== '.csv' && fileExtension !== '.xlsx' && fileExtension !== '.xls') {
      throw new ApiError(ImportCSVError.INVALID_FILE_CSV)
    }
    const workbook = XLSX.readFile(file.path)

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new ApiError(ErrorCode.WORKSHEET_NOT_EXIST)
    }
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]

    // Use header: 1 to get array format and defval: '' to preserve empty cells
    const listRecord = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: '',
      raw: false,
    })

    if (listRecord.length <= 1 || !Array.isArray(listRecord)) {
      throw new ApiError(ImportCSVError.INVALID_CSV_DATA)
    }

    // Skip the first row as it contains headers
    const dataRows = listRecord.slice(1)

    const newFields: Record<string, number> = _.reduce(
      fields,
      (data, item) => {
        data = {
          ...data,
          [item.field]: item.column,
        }

        return data
      },
      {}
    )

    const recordTransform = []

    // This is a row of the CSV
    dataRows.forEach((item: any[]) => {
      const res = Object.keys(newFields).reduce((newItem: object, key: string) => {
        if (newFields[key] !== undefined) {
          let value = item[Number(newFields[key])]
          // Find the field definition
          const fieldDef = fields.find((f) => f.field === key)

          value = this.mapComplexValue(value, fieldDef.type)

          newItem[key] = value
        }
        return newItem
      }, {})

      recordTransform.push(res)
    })

    return recordTransform
  }

  async getChargeFrequencyValues(file: Express.Multer.File, fields: any) {
    const recordTransform = this.csvMapping(file, fields)

    const chargeFrequencies = [
      ...new Set(recordTransform.map((student: any) => student.ChargeFrequency)),
    ]

    return chargeFrequencies
  }

  // Example of mapDbValue: {"headerMap":[{"column":"1","field":"StudentName"},{"column":"3","field":"StudentEmail"},{"column":"4","field":"StudentPhone"}]}
  async checkImportCsvValid(
    file: Express.Multer.File,
    {
      siteId,
      institutionId,
      mapDbValue,
    }: { siteId: number; institutionId: number; mapDbValue: DbMapping }
  ) {
    const recordTransform: Array<Record<string, string>> = this.csvMapping(
      file,
      mapDbValue.headerMap
    )

    const customFields = mapDbValue.headerMap.filter(
      (field) => !(field.field in ImportRequiredFields)
    )

    const customDataFieldsData: CommonField[] = await this.commonFieldRepository.find({
      where: {
        institutionId,
        status: FieldStatus.ACTIVE,
        question: In(customFields.map((field) => field.field)),
      },
    })

    let error = []

    const institution = await this.institutionsRepository.findOne({
      where: {
        id: institutionId,
      },
    })

    const studentPrimaryIdentifier = institution?.studentPrimaryIdentifier

    for (const key in recordTransform) {
      const rowError = await this.validateRow(
        recordTransform[key],
        customDataFieldsData,
        {
          institutionId,
          siteId,
          row: parseInt(key) + 1,
        },
        studentPrimaryIdentifier
      )
      error = error.concat(rowError)
    }

    return error
  }

  async importCSV(dto: ImportStuDto): Promise<ImportStuResponseDto[]> {
    const isQuotaAvailable = await this.isNewUsersQuotaAvailable(
      dto.siteId,
      dto.institutionId,
      dto.convertedData.length
    )

    const institution = await this.institutionsRepository.findOne({
      where: {
        id: dto.institutionId,
      },
    })
    const studentPrimaryIdentifier = institution?.studentPrimaryIdentifier

    if (!isQuotaAvailable) {
      throw new ApiError(ErrorCode.QUOTA_STUDENTS_ACTIVE_EXCEED)
    }
    const newStudent = []

    for (const item of dto.convertedData) {
      // It will return null if the user already exists and the import error of "skip" is chosen
      newStudent.push(
        await this.handleImportStudent({
          item,
          siteId: dto.siteId,
          institutionId: dto.institutionId,
          handleDataMethod: dto.handleDataMethod,
          studentPrimaryIdentifier,
        })
      )
    }

    return newStudent.filter((student) => !!student)
  }

  async validateRow(
    record: Record<string, any>,
    customFormFields: CommonField[],
    { institutionId, siteId }: { institutionId: number; siteId: number; row: number },
    studentPrimaryIdentifier: StudentPrimaryIdentifier
  ) {
    const rowError = []
    const dbDataFound = {
      studentName: undefined,
      studentEmail: undefined,
      studentPhone: undefined,
    }

    if (!record[ImportRequiredFields.StudentName]) {
      rowError.push(ImportCSVError.EMPTY_NAME)
    } else if (typeof record[ImportRequiredFields.StudentName] !== 'string') {
      rowError.push(ImportCSVError.INVALID_NAME)
    }

    // check email
    if (studentPrimaryIdentifier === StudentPrimaryIdentifier.EMAIL) {
      console.log(
        'record[ImportRequiredFields.StudentEmail]',
        record[ImportRequiredFields.StudentEmail]
      )
      if (record[ImportRequiredFields.StudentEmail] === '') {
        rowError.push(ImportCSVError.EMPTY_EMAIL)
      } else if (!KEY_DEFAULT.email.regex.test(record[ImportRequiredFields.StudentEmail])) {
        rowError.push(ImportCSVError.INVALID_EMAIL)
      }
    }

    if (record[ImportRequiredFields.StudentPhone] === '') {
      rowError.push(ImportCSVError.EMPTY_PHONE)
    }

    const phoneNumberWithoutPlus = transformPhone(record[ImportRequiredFields.StudentPhone])

    // check phone
    if (!/^\d+$/.test(phoneNumberWithoutPlus)) {
      rowError.push(ImportCSVError.INVALID_PHONE_NUM)
    }

    if (institutionId && siteId) {
      const userExist = await this.usersService.findUserByStudentPrimaryIdentifier({
        email: record[ImportRequiredFields.StudentEmail],
        phone: phoneNumberWithoutPlus,
        firstName: record[ImportRequiredFields.StudentName],
        institutionId,
      })

      if (userExist?.user?.id) {
        const userAliasExist = await this.userAliasesRepository.findOne({
          where: {
            institutionId,
            userId: userExist.user.id,
          },
        })

        if (userAliasExist) {
          dbDataFound.studentName = record[ImportRequiredFields.StudentName]
          dbDataFound.studentEmail = record[ImportRequiredFields.StudentEmail]
          dbDataFound.studentPhone = phoneNumberWithoutPlus
          rowError.push(ErrorCode.STUDENT_ALREADY_EXIST)
        }
      }
    }

    // This part basically deprecated for all functions related to payment

    const hasPaymentAmount =
      record[ImportRequiredFields.AmountCharged] !== undefined &&
      record[ImportRequiredFields.AmountCharged] !== null
    const hasFirstChargeDate =
      record[ImportRequiredFields.FirstChargeDate] !== undefined &&
      record[ImportRequiredFields.FirstChargeDate] !== null
    const hasChargeFrequency =
      record[ImportRequiredFields.ChargeFrequency] !== undefined &&
      record[ImportRequiredFields.ChargeFrequency] !== null

    if (hasPaymentAmount || hasFirstChargeDate || hasChargeFrequency) {
      if (!hasPaymentAmount || !hasFirstChargeDate || !hasChargeFrequency) {
        rowError.push(ImportCSVError.INCOMPLETE_PAYMENT_INFO)
      } else {
        if (
          typeof record[ImportRequiredFields.AmountCharged] !== 'number' ||
          record[ImportRequiredFields.AmountCharged] < 0
        ) {
          rowError.push(ImportCSVError.INVALID_CHARGED_AMOUNT)
        }

        const dateValue = record[ImportRequiredFields.FirstChargeDate]
        const isValidDate = toISOStringFromExcelOrString(dateValue)

        if (!isValidDate) {
          rowError.push(ImportCSVError.INVALID_DATE)
        }

        // Validate charge frequency
        if (
          !Object.values(ChargeFrequency).includes(record[ImportRequiredFields.ChargeFrequency])
        ) {
          rowError.push(ImportCSVError.INVALID_CHARGE_FREQUENCY_VALUE)
        }
      }
    }

    // Check for validation of custom fields
    for (const customField of customFormFields) {
      const customFieldValue = record[customField.question]
      if (!this.enrollmentFormService.validateCustomField(customField, customFieldValue)) {
        rowError.push(ImportCSVError.INVALID_DATA_TYPE)
      }
    }

    record.importError = rowError
    record.dataFoundInDb = dbDataFound

    return record
  }

  async handleImportStudent({
    item,
    siteId,
    institutionId,
    handleDataMethod,
    studentPrimaryIdentifier,
  }: {
    item: ImportStudentField
    siteId: number
    institutionId: number
    handleDataMethod: string
    studentPrimaryIdentifier: StudentPrimaryIdentifier
  }): Promise<ImportStuResponseDto> {
    item.StudentEmail = transformEmail(item.StudentEmail)
    item.StudentPhone = transformPhone(item.StudentPhone)

    const res: ImportStuResponseDto = {
      user: null,
      userAlias: null,
      studentMemo: null,
      customFields: [],
    }

    if (!item.StudentPhone || !/^\d+$/.test(item.StudentPhone)) {
      return null
    }

    /*
     * 1. Check if the user exists. Point to the existing user if found.
     */

    let user = await this.usersService.findUserByStudentPrimaryIdentifierWithDeleted({
      email: item.StudentEmail,
      phone: item.StudentPhone,
      firstName: item.StudentName,
      institutionId,
    })

    if (!user) {
      user = await this.usersService.createStudentAccount(
        {
          firstName: item.StudentName,
          email: item.StudentEmail,
          phone: item.StudentPhone,
          password: randomUUID(),
        },
        institutionId,
        siteId
      )
    }

    let userAlias

    // For updating the basic infoarmation
    if (item.importError.length > 0) {
      if (handleDataMethod === HandleImportError.KeepOriginalData) {
        // pass
      } else if (handleDataMethod === HandleImportError.Overwrite) {
        // Only update the user's name and phone number if the user overwrites the data
        userAlias = await this.findUserAliasAndRestoreIfDeleted({
          userId: user.id,
          institutionId,
        })

        if (userAlias) {
          userAlias.name = item.StudentName
          await this.userAliasesRepository.save(userAlias)
        } else {
          await this.usersService.createStudentRelatedEntitiesWithExistingUser(
            {
              firstName: item.StudentName,
              email: item.StudentEmail,
              phone: item.StudentPhone,
            },
            user,
            studentPrimaryIdentifier,
            institutionId,
            siteId
          )
        }

        user.phone = item.StudentPhone
        user = await this.userRepository.save(user)
      } else {
        // Return because this is suppose to skip the import data if user already exists
        return
      }
    }

    if (!userAlias) {
      userAlias = await this.findUserAliasAndRestoreIfDeleted({
        userId: user.id,
        institutionId,
      })
    }

    res.user = {
      id: user.id,
      firstName: user.firstName,
      email: user.email,
      phone: user.phone,
    }
    res.userAlias = userAlias
    res.studentMemo = userAlias
    const { StudentName, StudentEmail, StudentPhone, ...customFields } = item

    // This part is JUST for the default fields on the database
    const defaultFieldsOnDB = await this.commonFieldRepository.find({
      where: {
        institutionId,
        isDefault: true,
        status: FieldStatus.ACTIVE,
        columnMapping: In([FieldMapping.NAME, FieldMapping.EMAIL, FieldMapping.PHONE]),
      },
    })

    const studentFormMetadata: StudentFormMetadata[] = [
      {
        id: `applicant.0.${FieldMapping.NAME}`,
        value: StudentName,
        question:
          defaultFieldsOnDB.find((field) => field.columnMapping === FieldMapping.NAME)?.question ||
          'Name',
        columnMapping: FieldMapping.NAME,
        type: FieldType.SHORT_ANSWER,
        isDefault: true,
      },
      {
        id: `applicant.0.${FieldMapping.EMAIL}`,
        value: StudentEmail,
        question:
          defaultFieldsOnDB.find((field) => field.columnMapping === FieldMapping.EMAIL)?.question ||
          'Email',
        type: FieldType.EMAIL,
        columnMapping: FieldMapping.EMAIL,
        isDefault: true,
      },
      {
        id: `applicant.0.${FieldMapping.PHONE}`,
        value: StudentPhone,
        question:
          defaultFieldsOnDB.find((field) => field.columnMapping === FieldMapping.PHONE)?.question ||
          'Phone',
        columnMapping: FieldMapping.PHONE,
        type: FieldType.PHONE,
        isDefault: true,
      },
    ]

    // Example of a student form metadata: {"id": "applicant.0.621", "order": 0, "value": "Jason", "question": "Name", "isDefault": true}
    if (customFields && Object.keys(customFields).length > 0) {
      // Filter customFields where the key is an id
      const customFieldsIdsOnly = Object.keys(customFields).filter((key) => !isNaN(parseInt(key)))

      const commonFields = await this.commonFieldRepository.find({
        where: {
          id: In(customFieldsIdsOnly),
        },
      })

      Object.entries(customFields).forEach(([key, field]) => {
        const thisField = commonFields.find((o) => o.id === Number(key))

        let value = field

        if (!thisField) {
          return null
        }

        // This part need to convert data type
        value = this.mapComplexValue(value, thisField.type)

        if (typeof value === 'object' && !Array.isArray(value)) {
          value = JSON.stringify(value)
        }

        studentFormMetadata.push({
          type: thisField.type,
          id: thisField.id.toString(),
          value,
          question: thisField.question,
          isDefault: false,
        })
      })

      const existingStudentForms = await this.studentFormRepository.find({
        where: {
          formFieldId: In(studentFormMetadata.map((o) => o.id)),
        },
      })

      const metaDataWithExistingFields = existingStudentForms.map((o) => {
        return {
          id: o.formFieldId,
          type: o.formFieldType,
          value: o.formFieldValue as string,
          question: o.formFieldQuestion,
          isDefault: o.formFieldIsDefault,
          order: o.formFieldOrder,
          columnMapping: o.formFieldColumnMapping,
        }
      })

      const metadataWithoutExistingFields = studentFormMetadata.filter(
        (o) => !metaDataWithExistingFields.map((o) => o.id).includes(o.id)
      )

      // This part is for updating the student form
      if (
        !handleDataMethod ||
        handleDataMethod === HandleImportError.KeepOriginalData ||
        handleDataMethod === HandleImportError.Overwrite
      ) {
        if (handleDataMethod === HandleImportError.Overwrite) {
          userAlias = await this.findUserAliasAndRestoreIfDeleted({
            userId: user.id,
            institutionId,
          })
        }

        if (userAlias) {
          await this.addFieldsToStudentRecord({
            userId: user.id,
            userAliasId: userAlias.id,
            institutionId,
            newFields: metadataWithoutExistingFields,
          })
        }

        metadataWithoutExistingFields.forEach((o) => {
          res[o.id] = o.value
        })
      }

      if (handleDataMethod === HandleImportError.Overwrite) {
        try {
          await this.updateStudentForm({
            userId: user.id,
            institutionId,
            metadata: metaDataWithExistingFields,
          })

          metaDataWithExistingFields.forEach((o) => {
            if (o.value && o.value !== '') {
              res[o.id] = o.value
            }
          })
        } catch (e) {
          // pass. this is to prevent the error of not finding a form
        }
      }

      res.customFields = metadataWithoutExistingFields
    }

    // return invoice
    return res
  }

  async exportCSV({ institutionId, fields }) {
    const transformFields = _.reduce(
      fields,
      (data, item) => {
        data[item.field] = item.column
        return data
      },
      {}
    )
    const activeForm = await this.userRepository
      .createQueryBuilder('us')
      .leftJoin('user_roles', 'ur', 'ur.user_id = us.id')
      .leftJoin('student_form', 'sf', 'sf.user_id = us.id')
      .leftJoin('common_field', 'c', 'c.id = sf.field_id')
      .where('ur.institution_id = :institutionId', { institutionId })
      .andWhere('ur.is_student = :isStudent', {
        isStudent: true,
      })
      .andWhere('c.status = :status', { status: FieldStatus.ACTIVE })
      .select([
        'us.id as id',
        'us.email as "email"',
        'us.phone as "phone"',
        `us.first_name as "name"`,
        'sf.metadata as "metadata"',
        'c.question as "question"',
        // 'c.type as "type"',
      ])
      .getRawMany()

    const transformActiveForm = _.reduce(
      activeForm,
      (data, item) => {
        if (!data[item.id]) {
          data[item.id] = {
            id: item.id,
            [KEY_DEFAULT.name.field]: item.name,
            [KEY_DEFAULT.email.field]: item.email,
            [KEY_DEFAULT.phone.field]: item.phone,
          }
        }
        if (item.type === FieldType.SINGLE_CHOICE)
          item.metadata.value = item.metadata.value.join(', ')
        data[item.id][transformFields[item.question]] = item.metadata.value

        return data
      },
      []
    ).filter((item) => item != undefined)

    const worksheet = XLSX.utils.json_to_sheet(transformActiveForm)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data')
    const buffer = XLSX.write(workbook, { bookType: 'csv', type: 'buffer' })
    const name = `Student-Record-${new Date().getTime()}.csv`

    const exportPath = '/exports'

    const dir = path.join(__dirname, `../../../../..${exportPath}`)

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }

    const s = path.join(dir, name)
    fs.writeFileSync(s, buffer)
    return `${process.env.API_BASE_URL}${exportPath}/${name}`
  }

  async addFieldsToStudentRecord({
    userId,
    userAliasId,
    institutionId,
    newFields,
  }: {
    userId: number
    userAliasId: number
    institutionId: number
    newFields: StudentFormMetadata[]
  }): Promise<StudentForm[]> {
    const updatedForms = newFields.map((field) => {
      const fieldId = `applicant.0.${field.id}`
      return this.studentFormRepository.create({
        userId,
        userAliasId,
        institutionId,
        fieldId: field.id,
        formFieldId: fieldId,
        formFieldQuestion: field.question,
        formFieldType: field.type,
        formFieldValue: typeof field.value === 'string' ? field.value : JSON.stringify(field.value),
        formFieldIsDefault: field.isDefault,
        formFieldOrder: field.order,
        formFieldColumnMapping: field.columnMapping,
        metadata: {
          ...field,
          id: fieldId,
        },
      })
    })
    return this.studentFormRepository.save(updatedForms)
  }

  async deleteFieldFromStudentRecord(payload: {
    userId: number
    userAliasId?: number
    institutionId: number
    fieldId: string
    invoiceId?: number
  }): Promise<boolean> {
    const { userId, userAliasId, institutionId, fieldId, invoiceId } = payload

    let result
    if (userAliasId) {
      result = await this.studentFormRepository.find({
        where: { userAliasId, institutionId },
      })
    } else {
      result = await this.studentFormRepository.find({
        where: { userId, institutionId },
      })
    }

    const correctResult = result
      .filter((o) => typeof o.formFieldId === 'string' && o.formFieldId.split('.').length === 3)
      .filter((o) => Number(o.formFieldId.split('.')[2]) === Number(fieldId))

    if (invoiceId) {
      try {
        const invoice = await this.invoiceRepository.findOne({
          where: { id: invoiceId },
          relations: { enrollCourses: true },
        })
        if (invoice && invoice.enrollCourses && invoice.enrollCourses.length > 0) {
          const enroll = invoice.enrollCourses[0]
          if (enroll) {
            const registrationForm = enroll.registrationForm.filter((o) => {
              if (!o.id?.toString()?.includes('.')) return true
              const id = o.id.split('.')[2]
              if (Number(id) !== Number(fieldId)) return true
              return false
            })
            await this.enrollCourseRepository.update({ id: enroll.id }, { registrationForm })
          }
        }
      } catch (error) {
        console.error(error)
      }
    }

    if (correctResult.length === 0) {
      throw new ApiError(ErrorCode.FIELD_NOT_FOUND)
    }

    await this.studentFormRepository.delete(correctResult.map((o) => o.id))

    return true
  }

  async getNotificationSetting(data: {
    userId: number
    institutionId: number
  }): Promise<StudentNotificationSettings[]> {
    const user = await this.usersService.findOne(data.userId)
    if (!user) {
      throw new ApiError(ErrorCode.USERID_NOT_FOUND)
    }
    return (await this.studentNotifSettingService.getOrCreateNotification(
      user,
      data.institutionId
    )) as unknown as StudentNotificationSettings[]
  }

  async setNotificationSetting(payload: {
    userId: number
    institutionId: number
    data: StudentNotificationSettings[]
  }): Promise<StudentNotificationSettings[]> {
    const user = await this.usersService.findOne(payload.userId)
    if (!user) {
      throw new ApiError(ErrorCode.USERID_NOT_FOUND)
    }
    return (await this.studentNotifSettingService.updateNotificationSettings(
      user,
      payload.institutionId,
      payload.data
    )) as unknown as StudentNotificationSettings[]
  }

  async checkIfIsOnlyUserAlias(userId: number): Promise<boolean> {
    const userAndAlias = await this.userAliasesRepository.findAll({
      where: { userId },
    })

    const uniqueInstitutionIds = new Set(userAndAlias.map((alias) => alias.institutionId)).size
    return uniqueInstitutionIds < 2
  }

  private async findUserAliasAndRestoreIfDeleted({
    userId,
    institutionId,
  }: {
    userId: number
    institutionId: number
  }): Promise<UserAlias | null> {
    const userAlias = await this.userAliasesRepository.findOne({
      where: { userId, institutionId },
    })

    if (userAlias) {
      return userAlias
    }

    const userAliasWithDeleted = await this.userAliasesRepository.findOne({
      where: { userId, institutionId },
      withDeleted: true,
    })

    if (userAliasWithDeleted) {
      await this.userAliasesRepository.restore(userAliasWithDeleted.id)
      return userAliasWithDeleted
    }

    return null
  }

  async getParentAccount(institutionId: number) {
    const parentAccounts = await this.userAliasesRepository.find({
      where: { institutionId, isStudentParent: true },
      relations: ['user'],
    })

    return parentAccounts.map((alias) => ({
      id: alias.id,
      userId: alias.userId,
      name: alias.name,
      email: alias.email,
      user: alias.user,
    }))
  }

  async setParentAccount(data: SetParentAccountDto) {
    const userAlias = await this.userAliasesRepository.findOne({
      where: { id: data.userAliasId, institutionId: data.institutionId },
    })

    if (!userAlias) {
      throw new ApiError(ErrorCode.PARENT_NOT_FOUND)
    }

    userAlias.isStudentParent = data.isParent

    if (data.isParent) {
      userAlias.childOfUserAliasId = null // Reset child alias if setting as parent
    }

    return await this.userAliasesRepository.save(userAlias)
  }

  async addToParentGroup(data: AddToParentGroupDto) {
    const parentAlias = await this.userAliasesRepository.findOne({
      where: { id: data.parentId, institutionId: data.institutionId, isStudentParent: true },
    })

    if (!parentAlias) {
      throw new ApiError(ErrorCode.PARENT_NOT_FOUND)
    }

    const childAlias = await this.userAliasesRepository.findOne({
      where: { id: data.userAliasId, institutionId: data.institutionId },
    })

    if (!childAlias) {
      throw new ApiError(ErrorCode.STUDENT_NOT_FOUND)
    }

    if (childAlias.isStudentParent) {
      throw new ApiError(ErrorCode.STUDENT_IS_PARENT_STUDENT)
    }

    childAlias.childOfUserAliasId = parentAlias.id
    childAlias.isStudentParent = false // Ensure child is not a parent

    const response = await this.creditManagementService.getBalance(
      childAlias.institutionId,
      childAlias.id
    )
    if (response?.balance > 0) {
      // move credit to parent
      await this.creditManagementService.moveCredit(
        childAlias.institutionId,
        childAlias.id,
        parentAlias.id,
        response.balance
      )
    }

    return await this.userAliasesRepository.save(childAlias)
  }

  async changeParentGroup(data: ChangeParentGroupDto) {
    const oldParentAlias = await this.userAliasesRepository.findOne({
      where: { id: data.oldParentId, institutionId: data.institutionId, isStudentParent: true },
    })
    if (!oldParentAlias) {
      throw new ApiError(ErrorCode.PARENT_NOT_FOUND)
    }

    const newParentAlias = await this.userAliasesRepository.findOne({
      where: { id: data.newParentId, institutionId: data.institutionId, isStudentParent: true },
    })
    if (!newParentAlias) {
      throw new ApiError(ErrorCode.PARENT_NOT_FOUND)
    }

    const childAlias = await this.userAliasesRepository.findOne({
      where: { id: data.userAliasId, institutionId: data.institutionId, isStudentParent: false },
    })
    if (!childAlias) {
      throw new ApiError(ErrorCode.STUDENT_NOT_FOUND)
    }

    if (childAlias.childOfUserAliasId !== oldParentAlias.id) {
      throw new ApiError(ErrorCode.PARENT_GROUP_MISMATCH)
    }

    childAlias.childOfUserAliasId = newParentAlias.id
    childAlias.isStudentParent = false // Ensure child is not a parent

    return await this.userAliasesRepository.save(childAlias)
  }

  async removeFromParentGroup(data: RemoveFromParentGroupDto) {
    const oldParentAlias = await this.userAliasesRepository.findOne({
      where: { id: data.oldParentId, institutionId: data.institutionId, isStudentParent: true },
    })

    if (!oldParentAlias) {
      throw new ApiError(ErrorCode.PARENT_NOT_FOUND)
    }

    const childAlias = await this.userAliasesRepository.findOne({
      where: { id: data.userAliasId, institutionId: data.institutionId },
    })

    if (!childAlias) {
      throw new ApiError(ErrorCode.STUDENT_NOT_FOUND)
    }

    if (!childAlias.isStudentParent && childAlias.childOfUserAliasId !== oldParentAlias.id) {
      throw new ApiError(ErrorCode.PARENT_GROUP_MISMATCH)
    }

    if (childAlias.isStudentParent && data.isDeleted && !data.newParentId) {
      throw new ApiError(ErrorCode.STUDENT_IS_PARENT_STUDENT)
    }

    childAlias.childOfUserAliasId = null // Remove from parent group

    if (data.newParentId) {
      const newParentAlias = await this.userAliasesRepository.findOne({
        where: { id: data.newParentId, institutionId: data.institutionId },
      })

      if (!newParentAlias) {
        throw new ApiError(ErrorCode.PARENT_NOT_FOUND)
      }

      if (childAlias.isStudentParent) {
        const allChildAliases = await this.userAliasesRepository.find({
          where: { childOfUserAliasId: childAlias.id, institutionId: data.institutionId },
        })
        if (allChildAliases.length > 0) {
          // Update all children to point to the new parent
          const ids = allChildAliases.map((alias) => alias.id)
          await this.userAliasesRepository.update(ids, { childOfUserAliasId: newParentAlias.id })
        }
        childAlias.isStudentParent = false // Ensure child is not a parent
        newParentAlias.isStudentParent = true // Ensure new parent is set as parent
        newParentAlias.childOfUserAliasId = null // Reset parent group for new parent
        await this.userAliasesRepository.save(newParentAlias) // Save new parent changes

        const response = await this.creditManagementService.getBalance(
          childAlias.institutionId,
          childAlias.id
        )
        if (response?.balance > 0) {
          // move credit to new parent
          await this.creditManagementService.moveCredit(
            childAlias.institutionId,
            childAlias.id,
            newParentAlias.id,
            response.balance
          )
        }
      }
    }

    if (data.isDeleted) {
      return await this.userAliasesRepository.softRemove(childAlias)
    }

    return await this.userAliasesRepository.save(childAlias)
  }

  async getDetailAccountGroup(userAliasId: number, institutionId: number) {
    const userAlias = await this.userAliasesRepository.findOne({
      where: { id: userAliasId, institutionId },
      relations: ['user'],
    })
    if (!userAlias) {
      throw new ApiError(ErrorCode.STUDENT_NOT_FOUND)
    }

    const studentParent = userAlias.childOfUserAliasId
      ? await this.userAliasesRepository.findOne({
          where: { id: userAlias.childOfUserAliasId, institutionId, isStudentParent: true },
          relations: ['user'],
        })
      : null

    const parentChildren = userAlias.isStudentParent
      ? await this.userAliasesRepository.find({
          where: { childOfUserAliasId: userAlias.id, institutionId, isStudentParent: false },
          relations: ['user'],
        })
      : null

    return {
      ...userAlias,
      studentParent,
      parentChildren,
    }
  }

  async getStudentsByPhone(phone: string, institutionId: number) {
    const userAliases = await this.userAliasesRepository.find({
      where: {
        institutionId,
        user: { phone },
      },
      relations: ['user'],
    })

    return userAliases.map((alias) => ({
      id: alias.id,
      userId: alias.userId,
      name: alias.name,
      email: alias.email,
      user: alias.user,
    }))
  }
}
