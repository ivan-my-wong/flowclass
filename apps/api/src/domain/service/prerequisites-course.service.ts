import { Injectable } from '@nestjs/common'

import {
  CheckPrerequisitesConditionDto,
  ValidatePrerequisitesDto,
} from '@/application/admin/courses/dto/prerequesites.dto'
import { ClassEntity } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import { Course } from '@/models/courses.entity'
import { CoursesRepository } from '@/models/courses.repository'
import {
  IPrerequisite,
  IPrerequisiteCondition,
  PrerequisiteGroupsResult,
} from '@/models/custom-types/prerequisites'
import { EnrollCourseRepository } from '@/models/enroll-courses.repository'
import { PaymentStatus } from '@/models/enums/status'
import { InvoiceRepository } from '@/models/invoice.repository'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { StudentScheduleRepository } from '@/models/student-schedule.repository'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { UserRolesRepository } from '@/models/user-roles.repository'
import { BaseService } from '@/modules/base/base.service'

import { CoursesService } from './courses.service'
import { UsersService } from './users.service'
@Injectable()
export class PrerequisitesCoursesService extends BaseService<Course> {
  constructor(
    private courseRepository: CoursesRepository,
    private courseService: CoursesService,
    private invoiceRepository: InvoiceRepository,
    private enrollCourseRepository: EnrollCourseRepository,
    private studentLessonRepository: StudentLessonRepository,
    private userRolesRepository: UserRolesRepository,
    private userAliasesRepository: UserAliasesRepository,
    private classRepository: ClassRepository,
    private studentScheduleRepository: StudentScheduleRepository,
    private userService: UsersService
  ) {
    super(courseRepository)
  }

  async getAllPrerequisites(courseId: number, institutionId: number): Promise<IPrerequisite> {
    const course = await this.courseService.getCourseByIdAndInstitution(courseId, institutionId)
    return course.prerequisites
  }

  async updateOrCreateCoursePrerequisites(
    courseId: number,
    institutionId: number,
    dto: ValidatePrerequisitesDto
  ) {
    const course = await this.courseService.getCourseByIdAndInstitution(courseId, institutionId)
    course.prerequisites = dto
    const result = await this.courseRepository.save(course)
    return result.prerequisites
  }
  async removeCoursePrerequisites(courseId: number, institutionId: number) {
    const course = await this.courseService.getCourseByIdAndInstitution(courseId, institutionId)
    course.prerequisites = {}
    const result = await this.courseRepository.save(course)
    return result.prerequisites
  }

  async checkPrerequisitesCourse(payload: CheckPrerequisitesConditionDto, institutionId: number) {
    const { courseId, email, phone } = payload

    const result = []

    const course = await this.courseService.getCourseByIdAndInstitution(courseId, institutionId)

    if (!course?.prerequisites?.groups) return result

    const userAlias = await this.userAliasesRepository.findOne({
      where: {
        institutionId,
        user: {
          email,
          phone,
        },
      },
      relations: {
        user: true,
      },
    })

    let student = await this.userService.findOneBy({ id: userAlias?.userId })

    if (!student) {
      student = await this.userService.findOneBy({ email, phone })
    }

    const getData = await Promise.allSettled(
      course.prerequisites?.groups?.map(async (group) => {
        // if the course have no conditions
        if (!group?.conditions?.length) {
          return {
            groupOperator: group.groupOperator,
            result: [],
          }
        }

        // Now we use Promise.all to handle the conditions in parallel
        const result = await Promise.all(
          group.conditions.map(async (condition) => {
            const check = await this.collectInvoice(institutionId, condition, student?.id)

            return { ...check, operator: condition.operator }
          })
        )

        return {
          groupOperator: group.groupOperator,
          result,
        }
      })
    )

    const successfulGetData = getData
      .filter((data) => data.status === 'fulfilled')
      // eslint-disable-next-line no-undef
      .map((data: PromiseFulfilledResult<any>) => data.value)

    const checkValidation = this.checkGroups(successfulGetData)
    if (checkValidation) return result

    successfulGetData.forEach((data) => {
      data.result.forEach((res: PrerequisiteGroupsResult['result']['0']) => {
        // check duplicate class
        const checkExist = result.some((r) => r.class?.id === res.class?.id)
        if (!checkExist && res.class?.id) result.push(res)
      })
    })

    return result
  }

  checkGroups(groups: PrerequisiteGroupsResult[]): boolean {
    // for now, all operator in the conditions is OR
    // and all groupOperator in the groups is AND
    return groups.every((group) => group.result.some((res) => res.status === true))

    // return groups.every((group) => {
    //   if (group.groupOperator === 'AND') {
    //     // Untuk operator AND, semua status harus true
    //     return group.result.every((res) => res.status === true && res.operator === 'AND')
    //   } else if (group.groupOperator === 'OR') {
    //     // Untuk operator OR, minimal satu status harus true
    //     return group.result.some((res) => res.status === true && res.operator === 'AND')
    //   }
    //   return false // Jika groupOperator tidak valid
    // })
  }

  async collectInvoice(
    institutionId: number,
    condition: IPrerequisiteCondition,
    userId?: number
  ): Promise<PrerequisiteGroupsResult['result']['0']> {
    const courseData = await this.courseRepository.findOne({
      where: {
        id: condition.courseId,
        institutionId,
      },
    })

    const classData = await this.classRepository.findOne({
      where: {
        id: condition.classId,
        institutionId,
      },
    })

    if (!classData || !courseData) return { status: true }

    const defaultData = {
      course: {
        id: courseData.id,
        name: courseData.name,
        path: courseData.path,
      } as Course,
      class: {
        id: classData.id,
        name: classData.name,
      } as ClassEntity,
    }

    if (!userId) return { status: false, ...defaultData }

    // We need to check for subscription classes too, because it does not have student lesson

    const studentLesson = await this.studentLessonRepository.findOne({
      where: {
        courseId: condition.courseId,
        classId: condition.classId,
        institutionId,
        userId,
      },
    })

    if (studentLesson?.id) {
      return { status: true, ...defaultData }
    }

    // If no student lesson, we need to check for invoice

    const invoice = await this.invoiceRepository.findOne({
      where: {
        courseId: condition.courseId,
        paymentState: PaymentStatus.PAID,
        userId,
      },
    })

    if (!invoice) return { status: false, ...defaultData }

    const studentSchedule = await this.studentScheduleRepository.findOne({
      where: {
        classId: condition.classId,
        invoiceId: invoice.id,
      },
    })

    if (studentSchedule.id) {
      return { status: true, ...defaultData }
    }

    return {
      ...defaultData,
      status: false,
    }
  }
}
