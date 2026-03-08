import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { createObjectCsvStringifier } from 'csv-writer'
import * as dayjs from 'dayjs'
import {
  Between,
  FindOptionsWhere,
  In,
  IsNull,
  LessThanOrEqual,
  MoreThanOrEqual,
  Not,
} from 'typeorm'

import {
  InstructorClassLessonListResponse,
  InstructorDataDto,
} from '@/application/admin/instructors/dto/instructor-data.dto'
import { UpdateInstructorRateDto } from '@/application/admin/instructors/dto/update-instructor-rate.dto'
import { UpdateRatesStatusDto } from '@/application/admin/instructors/dto/update-rates-status.dto'
import {
  InstructorLessonExportDto,
  UpComingClassesDto,
} from '@/application/admin/users/dto/user-detail.dto'
import { UserErrorMessage } from '@/exceptions/error-message/user'
import { ClassLessonRepository } from '@/models/class-lesson.repository'
import { ClassLesson } from '@/models/class-lessons.entity'
import { ClassRepository } from '@/models/classes.repository'
import { ClassTypeEnum } from '@/models/enums'
import { PaymentStatus } from '@/models/enums/status'
import { InstructorProfile, InstructorProfileRepository } from '@/models/instructor-profile.entity'
import { InstructorRate, InstructorRatesRepository } from '@/models/instructor-rates.entity'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { StudentScheduleRepository } from '@/models/student-schedule.repository'
import { UserRolesRepository } from '@/models/user-roles.repository'
import { UsersRepository } from '@/models/users.repository'
import { calculateBillingEndDate } from '@/utils/time.utils'

@Injectable()
export class InstructorProfilesService {
  constructor(
    private readonly instructorRatesRepository: InstructorRatesRepository,
    private readonly instructorProfileRepository: InstructorProfileRepository,
    private readonly classLessonRepository: ClassLessonRepository,
    private readonly userRolesRepository: UserRolesRepository,
    private readonly usersRepository: UsersRepository,
    private readonly studentLessonRepository: StudentLessonRepository,
    private readonly studentScheduleRepository: StudentScheduleRepository,
    private readonly classRepository: ClassRepository
  ) {}

  async getManagersAndInstructors(siteId: number, institutionId: number) {
    const userRoles = await this.userRolesRepository.find({
      where: [
        { siteId, institutionId, isInstructor: true, user: Not(IsNull()) },
        { siteId, institutionId, isSiteManager: true, user: Not(IsNull()) },
        { siteId, institutionId, isInstitutionManager: true, user: Not(IsNull()) },
      ],
      relations: {
        instructorProfile: {
          instructorRates: true,
        },
        user: true,
      },
    })

    return userRoles.filter((userRole) => !!userRole.user)
  }

  async getInstructorRatesForUI(
    userRoleId: number,
    institutionId: number
  ): Promise<{
    isEnabled: boolean
    isStudentRatesEnabled: boolean
    studentRatesConfig: { minimumStudents: number; additionalSalaryPerStudent: number } | null
    rates: InstructorRate[]
  }> {
    const userRole = await this.userRolesRepository.findOneBy({ id: userRoleId })
    if (!userRole) {
      throw new NotFoundException('User role not found')
    }

    // Get or create instructor profile for this user role
    let instructorProfile = await this.instructorProfileRepository.findOneBy({
      userRoleId,
    })

    if (!instructorProfile) {
      // If no instructor profile exists and user is an instructor, create one
      if (userRole.isInstructor) {
        instructorProfile = await this.instructorProfileRepository.save({
          userRoleId,
          isRatesEnabled: userRole.isInstructorRatesEnabled,
          isStudentRatesEnabled: false,
          studentRatesConfig: null,
          isActive: true,
        })

        // Update user role to reference the instructor profile
        await this.userRolesRepository.update(userRoleId, {
          instructorProfileId: instructorProfile.id,
        })
      } else {
        throw new NotFoundException('User role is not an instructor')
      }
    }

    if (!instructorProfile.isRatesEnabled) {
      return {
        isEnabled: false,
        isStudentRatesEnabled: instructorProfile.isStudentRatesEnabled || false,
        studentRatesConfig: instructorProfile.studentRatesConfig || null,
        rates: [],
      }
    }

    const rates = await this.instructorRatesRepository.find({
      where: {
        instructorProfileId: instructorProfile.id,
        institutionId,
      },
      relations: {
        course: {
          classes: true,
        },
      },
    })

    return {
      isEnabled: true,
      isStudentRatesEnabled: instructorProfile.isStudentRatesEnabled || false,
      studentRatesConfig: instructorProfile.studentRatesConfig || null,
      rates,
    }
  }

  async createOrUpdateRates(
    userRoleId: number,
    institutionId: number,
    rates: UpdateInstructorRateDto[]
  ): Promise<InstructorRate[]> {
    const updatedRates: InstructorRate[] = []

    // There must be at least and only ONE default rate
    const defaultRate = rates.filter((rate) => rate.isDefaultRate)

    if (!defaultRate || defaultRate.length !== 1) {
      throw new BadRequestException('There must be at least and only ONE default rate')
    }

    const userRole = await this.userRolesRepository.findOneBy({ id: userRoleId })
    if (!userRole) {
      throw new NotFoundException('User role not found')
    }

    // Get or create instructor profile
    let instructorProfile = await this.instructorProfileRepository.findOneBy({
      userRoleId,
    })

    if (!instructorProfile) {
      if (userRole.isInstructor) {
        instructorProfile = await this.instructorProfileRepository.save({
          userRoleId,
          isRatesEnabled: true, // Enable rates when creating/updating rates
          isActive: true,
        })

        // Update user role to reference the instructor profile
        await this.userRolesRepository.update(userRoleId, {
          instructorProfileId: instructorProfile.id,
        })
      } else {
        throw new BadRequestException('User role is not an instructor')
      }
    }

    // Enable rates if not already enabled
    if (!instructorProfile.isRatesEnabled) {
      await this.instructorProfileRepository.update(instructorProfile.id, {
        isRatesEnabled: true,
      })
    }

    // Get all existing rates for this instructor profile
    const existingRates = await this.instructorRatesRepository.find({
      where: {
        instructorProfileId: instructorProfile.id,
        institutionId,
      },
    })

    // Collect IDs of rates that are being submitted (for updates)
    const submittedRateIds = rates.filter((rate) => rate.id).map((rate) => rate.id as number)

    // Find rates that exist in database but are NOT in the submitted list
    const ratesToDelete = existingRates.filter(
      (existingRate) => !submittedRateIds.includes(existingRate.id)
    )

    // Delete rates that are no longer in the submitted list
    if (ratesToDelete.length > 0) {
      await this.instructorRatesRepository.delete(ratesToDelete.map((rate) => rate.id))
    }

    for (const rateData of rates) {
      if (rateData.id) {
        // Update existing rate
        const updatedRate = await this.instructorRatesRepository.update(rateData.id, rateData)
        updatedRates.push(updatedRate.raw)
      } else {
        // Create new rate
        const newRate = await this.instructorRatesRepository.save({
          ...rateData,
          userRoleId,
          institutionId,
          instructorProfileId: instructorProfile.id,
        })
        updatedRates.push(newRate)
      }
    }

    return updatedRates
  }

  async updateInstructorRatesEnabled(userRoleId: number, isInstructorRatesEnabled: boolean) {
    const instructorProfile = await this.instructorProfileRepository.findOneBy({
      userRoleId,
    })

    if (!instructorProfile) {
      throw new BadRequestException('User role not found')
    }
    instructorProfile.isRatesEnabled = isInstructorRatesEnabled
    return await this.instructorProfileRepository.save(instructorProfile)
  }

  async updateRatesStatus(
    userRoleId: number,
    updateDto: UpdateRatesStatusDto
  ): Promise<InstructorProfile> {
    const instructorProfile = await this.instructorProfileRepository.findOneBy({ userRoleId })

    if (!instructorProfile) {
      throw new BadRequestException('Instructor profile not found')
    }

    // must enable hourly rates before enabling student rates
    if (
      updateDto.isStudentRatesEnabled &&
      !instructorProfile.isRatesEnabled &&
      !updateDto.isInstructorRatesEnabled
    ) {
      throw new BadRequestException('Must enable hourly rates before enabling student rates')
    }

    // if disable hourly rates, disable student rates
    if (updateDto.isInstructorRatesEnabled === false) {
      instructorProfile.isRatesEnabled = false
      instructorProfile.isStudentRatesEnabled = false
      instructorProfile.studentRatesConfig = null
    } else {
      if (updateDto.isInstructorRatesEnabled !== undefined) {
        instructorProfile.isRatesEnabled = updateDto.isInstructorRatesEnabled
      }

      if (updateDto.isStudentRatesEnabled === true) {
        if (!updateDto.studentRatesConfig && !instructorProfile.studentRatesConfig) {
          throw new BadRequestException('studentRatesConfig is required to enable student rates')
        }
      }

      if (updateDto.isStudentRatesEnabled !== undefined) {
        instructorProfile.isStudentRatesEnabled = updateDto.isStudentRatesEnabled
      }

      if (updateDto.studentRatesConfig !== undefined) {
        instructorProfile.studentRatesConfig = updateDto.studentRatesConfig
      }
    }

    return await this.instructorProfileRepository.save(instructorProfile)
  }

  async delete(id: number): Promise<void> {
    const rate = await this.instructorRatesRepository.findOne({
      where: { id, deletedAt: null },
    })

    if (!rate) {
      throw new NotFoundException(`Instructor rate with ID ${id} not found`)
    }

    await this.instructorRatesRepository.softDelete(id)
  }

  /**
   * @param instructorDataDto
   *
   * @returns
   */

  async getInstructorAnalytics(instructorDataDto: InstructorDataDto) {
    const instructor = await this.usersRepository.findOneBy({ id: instructorDataDto.instructorId })
    if (!instructor) {
      throw new BadRequestException(UserErrorMessage.USER_NOT_FOUND)
    }

    const userRole = await this.userRolesRepository.findOne({
      where: {
        userId: instructorDataDto.instructorId,
        institutionId: instructorDataDto.institutionId,
      },
      relations: {
        instructorProfile: true,
      },
    })

    if (!userRole) {
      throw new BadRequestException(UserErrorMessage.USER_NOT_FOUND)
    }

    const instructorProfile = userRole.instructorProfile

    // const assignedClasses = await this.classAnalytics(instructorDataDto)

    const numberOfLessons = await this.classLessonsCount(instructorDataDto)
    const numberOfStudents = await this.studentLessonsCount(instructorDataDto)

    if (!instructorProfile.isRatesEnabled) {
      const totalHours = await this.calculateInstructorTotalHours(userRole.id, instructorDataDto)
      return {
        numberOfLessons,
        numberOfStudents,
        totalHours,
      }
    }

    const totalSalary = await this.calculateInstructorTotalSalary(userRole.id, instructorDataDto)

    return {
      numberOfLessons,
      numberOfStudents,
      totalSalary,
    }
  }

  async classLessonsCount(instructorDataDto: InstructorDataDto) {
    const whereCondition: Record<string, any> = this.getWhereCondition(instructorDataDto)

    return await this.classLessonRepository.count({
      where: whereCondition,
    })
  }

  async studentLessonsCount(instructorDataDto: InstructorDataDto) {
    const whereCondition: Record<string, any> = {
      institutionId: instructorDataDto.institutionId,
      startTime: this.getStartTimeFromPotentiallyUndefinedDate(
        instructorDataDto.startDate,
        instructorDataDto.endDate
      ),
      classLesson: {
        instructorId: instructorDataDto.instructorId,
      },
      studentSchedule: {
        invoice: {
          paymentState: PaymentStatus.PAID,
        },
      },
    }

    if (instructorDataDto.locationIds && instructorDataDto.locationIds.length > 0) {
      whereCondition.classLesson.locationId = In(instructorDataDto.locationIds.map(Number))
    }

    if (instructorDataDto.classIds && instructorDataDto.classIds.length > 0) {
      whereCondition.classLesson.classId = In(instructorDataDto.classIds.map(Number))
    }

    if (instructorDataDto.courseIds && instructorDataDto.courseIds.length > 0) {
      whereCondition.classLesson.courseId = In(instructorDataDto.courseIds.map(Number))
    }

    const studentLessons = await this.studentLessonRepository.findByEffectiveStartTimeAndEndTime(
      instructorDataDto.startDate?.toISOString() || undefined,
      instructorDataDto.endDate?.toISOString() || undefined,
      {
        where: whereCondition,
        relations: {
          classLesson: true,
          studentSchedule: {
            invoice: true,
          },
        },
      }
    )

    const uniqueClassLessons = new Set<number>()
    studentLessons.forEach((studentLesson) => {
      uniqueClassLessons.add(studentLesson.userId)
    })

    return uniqueClassLessons.size
  }

  async revenueAnalytics(instructorDataDto: InstructorDataDto) {
    const studentLessons = await this.studentLessonRepository.findAll({
      where: {
        institutionId: instructorDataDto.institutionId,
        startTime: this.getStartTimeFromPotentiallyUndefinedDate(
          instructorDataDto.startDate,
          instructorDataDto.endDate
        ),
        studentSchedule: {
          invoice: {
            paymentState: PaymentStatus.PAID,
          },
        },
        classLesson: {
          instructorId: instructorDataDto.instructorId,
        },
      },
      relations: {
        classLesson: true,
        studentSchedule: {
          invoice: true,
        },
      },
    })

    const revenue = studentLessons.reduce((acc, studentLesson) => {
      return acc + Number(studentLesson?.studentSchedule?.invoice.feePerLesson)
    }, 0)

    // Get revenue from memberships or subscriptions
    const memberships = await this.studentScheduleRepository.findAll({
      where: {
        class: {
          type: ClassTypeEnum.SUBSCRIPTION,
        },
        invoice: {
          paymentState: PaymentStatus.PAID,
        },
        createdAt: this.getStartTimeFromPotentiallyUndefinedDate(
          instructorDataDto.startDate,
          instructorDataDto.endDate
        ),
      },
      relations: {
        invoice: true,
      },
    })

    const membershipRevenue = memberships.reduce((acc, membership) => {
      return acc + Number(membership?.invoice.payAmount)
    }, 0)

    return Number(revenue) + Number(membershipRevenue)
  }

  async classAnalytics(instructorDataDto: InstructorDataDto) {
    const whereCondition: Record<string, any> = {
      instructorId: instructorDataDto.instructorId,
      siteId: instructorDataDto.siteId,
      institutionId: instructorDataDto.institutionId,
    }

    if (instructorDataDto.locationIds && instructorDataDto.locationIds.length > 0) {
      whereCondition.locationId = In(instructorDataDto.locationIds.map(Number))
    }

    if (instructorDataDto.classIds && instructorDataDto.classIds.length > 0) {
      whereCondition.id = In(instructorDataDto.classIds.map(Number))
    }

    return await this.classRepository.count({
      where: whereCondition,
    })
  }

  getWhereCondition(instructorDataDto: UpComingClassesDto) {
    const whereCondition: FindOptionsWhere<ClassLesson> = {
      instructorId: instructorDataDto.instructorId,
      institutionId: instructorDataDto.institutionId,
      startTime: this.getStartTimeFromPotentiallyUndefinedDate(
        instructorDataDto.startDate,
        instructorDataDto.endDate
      ),
    }
    if (instructorDataDto.courseIds && instructorDataDto.courseIds.length > 0) {
      whereCondition.course = {
        id: In(instructorDataDto.courseIds.map(Number)),
      }
    }

    if (instructorDataDto.locationIds && instructorDataDto.locationIds.length > 0) {
      whereCondition.locationRoom = {
        id: In(instructorDataDto.locationIds.map(Number)),
      }
    }

    if (instructorDataDto.classIds && instructorDataDto.classIds.length > 0) {
      whereCondition.class = {
        id: In(instructorDataDto.classIds.map(Number)),
      }
    }

    return whereCondition
  }

  async getClassLessonsOfInstructor(
    upComingClassesDto: UpComingClassesDto
  ): Promise<InstructorClassLessonListResponse[]> {
    // Get instructor profile to check if rates are enabled
    const userRole = await this.userRolesRepository.findOne({
      where: {
        userId: upComingClassesDto.instructorId,
        institutionId: upComingClassesDto.institutionId,
      },
      relations: { instructorProfile: true },
    })

    const hasRatesEnabled = userRole?.instructorProfile?.isRatesEnabled || false

    const whereCondition: FindOptionsWhere<ClassLesson> = this.getWhereCondition(upComingClassesDto)

    const classLessons = await this.classLessonRepository.findAll({
      where: whereCondition,

      relations: {
        class: {
          priceOptions: true,
        },
        course: true,
        locationRoom: true,
      },

      select: {
        id: true,
        instructorId: true,
        locationId: true,
        startTime: true,
        endTime: true,
        course: {
          id: true,
          name: true,
        },
        class: {
          id: true,
          type: true,
          name: true,
        },
        locationRoom: {
          id: true,
          address: true,
          name: true,
        },
      },
    })

    const qualifyingStudentLessonIds =
      await this.studentLessonRepository.findByEffectiveClassLessonId(
        classLessons.map((classLesson) => classLesson.id),
        {
          where: {
            studentSchedule: {
              invoice: {
                paymentState: PaymentStatus.PAID,
              },
            },
          },
        }
      )

    const qualifyingStudentLessons = await this.studentLessonRepository.findAll({
      where: {
        id: In(qualifyingStudentLessonIds.map((studentLesson) => studentLesson.id)),
      },
      select: {
        id: true,
        attendance: true,
        classLessonId: true,
        changeClassLessonId: true,
        studentSchedule: {
          id: true,
          invoice: {
            id: true,
            feePerLesson: true,
            numOfLesson: true,
          },

          regularPeriod: {
            id: true,
            lessons: true,
          },
          class: {
            id: true,
            type: true,
            priceType: true,
          },
        },
      },
      relations: {
        studentSchedule: {
          invoice: true,
          class: {
            recurringFormat: true,
            priceOptions: true,
          },
          regularPeriod: {
            lessons: true,
          },
        },
      },
    })

    const membershipWhereCondition = {
      class: {
        type: ClassTypeEnum.SUBSCRIPTION,
        instructorId: upComingClassesDto.instructorId,
        locationId: undefined,
      },
      invoice: {
        paymentState: PaymentStatus.PAID,
      },
      createdAt: this.getStartTimeFromPotentiallyUndefinedDate(
        upComingClassesDto.startDate,
        upComingClassesDto.endDate
      ),
    }

    if (upComingClassesDto.locationIds) {
      membershipWhereCondition.class.locationId = In(upComingClassesDto.locationIds.map(Number))
    }

    // We need to add membership or subscription to the studentLessons
    const listOfMemberships = await this.studentScheduleRepository.findAll({
      where: membershipWhereCondition,
      relations: {
        class: {
          recurringFormat: true,
          course: true,
        },
        invoice: true,
      },
    })

    const allInstructorRates = await this.instructorRatesRepository.find({
      where: {
        instructorProfileId: userRole?.instructorProfile?.id,
        institutionId: upComingClassesDto.institutionId,
      },
    })

    const classLessonToBeReturned = await Promise.all(
      classLessons.map(async (classLesson) => {
        const correctStudentLessons = qualifyingStudentLessons.filter(
          (studentLesson) =>
            this.studentLessonRepository.getEffectiveClassLessonId(studentLesson) === classLesson.id
        )

        let hourlyRate: number | undefined
        let finalHourlySalary: number | undefined
        let totalSalary: number | undefined

        const classId = classLesson?.class?.id
        const courseId = classLesson?.course?.id
        const numberOfStudents = correctStudentLessons.length

        // if (
        //   correctStudentLessons &&
        //   correctStudentLessons.length > 0 &&
        //   firstStudentLesson.studentSchedule
        // ) {
        //   classPrice = calculateSingleLessonPrice({
        //     priceType: firstStudentLesson.studentSchedule?.class?.priceType,
        //     classType: firstStudentLesson.studentSchedule?.class?.type,
        //     regularPeriod: firstStudentLesson.studentSchedule?.regularPeriod,
        //     recurringFormat: firstStudentLesson.studentSchedule?.class?.recurringFormat,
        //     priceOptions: firstStudentLesson.studentSchedule?.class?.priceOptions,
        //   })
        // }

        // Calculate duration in hours
        const duration = dayjs(this.classLessonRepository.getEffectiveEndTime(classLesson)).diff(
          dayjs(this.classLessonRepository.getEffectiveStartTime(classLesson)),
          'hour',
          true
        )

        // Get hourly rate if rates are enabled
        if (hasRatesEnabled && userRole?.instructorProfile) {
          const classSpecificRate = this.getClassSpecificRate({
            rates: allInstructorRates,
            classId,
            courseId,
          })
          const baseRate = classSpecificRate?.hourlyRate || 0

          if (baseRate > 0) {
            hourlyRate = Number(baseRate)

            finalHourlySalary = this.calculateFinalHourlySalary(
              hourlyRate,
              numberOfStudents,
              userRole.instructorProfile,
              classSpecificRate
            )
            totalSalary = finalHourlySalary * duration
          }
        }

        // The problem is that the invoice pays for the entire class, not for the single lesson
        const totalRevenue = correctStudentLessons.reduce(
          (acc, studentLesson) =>
            acc + Number(studentLesson?.studentSchedule?.invoice.feePerLesson),
          0
        )

        return {
          ...classLesson,
          studentLessons: correctStudentLessons,
          numberOfStudents, // Changed from studentsCount
          hourlyRate, // New field for frontend
          finalHourlySalary,
          duration, // New field for duration in hours
          lessonSalary: totalSalary, // Total amount based on hourly rate
          isPast: dayjs(classLesson.endTime).isBefore(dayjs()), // For status determination
        }
      })
    )

    const mappedMemberships = listOfMemberships.map((membership) => {
      const invoice = membership.invoice
      const thisClass = membership.class
      const endTime = calculateBillingEndDate(membership.createdAt, thisClass.recurringFormat)

      return {
        institutionId: invoice.institutionId,
        courseId: invoice.courseId,
        instructorId: thisClass.instructorId,
        startTime: membership.createdAt,
        endTime,
        course: {
          id: invoice.courseId,
          name: thisClass.course.name,
        },
        class: {
          id: thisClass.id,
          name: thisClass.name,
          type: thisClass.type,
        },
        studentLessons: [],
        numberOfStudents: 1,
        // classPrice: invoice.feePerLesson,

        duration: 0,
        hourlyRate: 0,
        lessonSalary: invoice.feePerLesson,
        totalRevenue: invoice.payAmount,
        isPast: dayjs(endTime).isBefore(dayjs()),
      }
    })

    return [...classLessonToBeReturned, ...mappedMemberships]
  }

  async getHourOfLessonsOfClassId(classId: number, startTime: Date, endTime: Date) {
    const classLessons = await this.classLessonRepository.find({
      where: {
        classId,
        startTime: MoreThanOrEqual(startTime),
        endTime: LessThanOrEqual(endTime),
      },
    })

    const totalHours = classLessons.reduce((acc, classLesson) => {
      const duration = dayjs(this.classLessonRepository.getEffectiveEndTime(classLesson)).diff(
        dayjs(this.classLessonRepository.getEffectiveStartTime(classLesson)),
        'hour'
      )
      return acc + duration
    }, 0)
    return totalHours
  }

  getClassSpecificRate({
    rates,
    classId,
    courseId,
  }: {
    rates: InstructorRate[]
    classId: number
    courseId: number
  }): InstructorRate | undefined {
    // Priority 1: Find class-specific rate (most specific)
    const classSpecificRate = rates.find((rate) => classId && rate.classIds?.includes(classId))

    if (classSpecificRate) {
      return classSpecificRate
    }

    // Priority 2: Find course-specific rate (without class restrictions)
    const courseSpecificRate = rates.find(
      (rate) => rate.courseId === courseId && (!rate.classIds || rate.classIds.length === 0)
    )

    if (courseSpecificRate) {
      return courseSpecificRate
    }

    // Priority 3: Find default rate (least specific)
    const defaultRate = rates.find((rate) => rate.isDefaultRate)

    return defaultRate
  }

  async calculateInstructorTotalHours(
    userRoleId: number,
    filter: InstructorDataDto
  ): Promise<number> {
    const userRole = await this.userRolesRepository.findOneBy({ id: userRoleId })
    if (!userRole) {
      throw new NotFoundException('User role not found')
    }

    // Build where conditions for repository find
    const whereConditions = this.getWhereCondition(filter)

    // Get lessons using repository method
    const lessons = await this.classLessonRepository.find({
      where: whereConditions,
    })

    // Calculate individual hours for each lesson and sum them up
    const totalHours = lessons.reduce((sum, lesson) => {
      const lessonHours = dayjs(this.classLessonRepository.getEffectiveEndTime(lesson)).diff(
        dayjs(this.classLessonRepository.getEffectiveStartTime(lesson)),
        'hour',
        true
      ) // true for floating point precision
      return sum + lessonHours
    }, 0)

    return totalHours
  }

  private calculateFinalHourlySalary(
    baseHourlyRate: number,
    numberOfStudents: number,
    instructorProfile: InstructorProfile,
    classSpecificRate?: InstructorRate
  ): number {
    let finalSalary = Number(baseHourlyRate)

    if (
      classSpecificRate?.minimumStudents !== null &&
      classSpecificRate?.minimumStudents !== undefined &&
      classSpecificRate?.additionalSalaryPerStudent !== null &&
      classSpecificRate?.additionalSalaryPerStudent !== undefined
    ) {
      const minimumStudents = classSpecificRate.minimumStudents
      const additionalSalaryPerStudent = classSpecificRate.additionalSalaryPerStudent

      if (numberOfStudents > minimumStudents) {
        const extraStudents = numberOfStudents - minimumStudents
        finalSalary += extraStudents * additionalSalaryPerStudent
      }
    } else if (instructorProfile.isStudentRatesEnabled && instructorProfile.studentRatesConfig) {
      const { minimumStudents, additionalSalaryPerStudent } = instructorProfile.studentRatesConfig

      if (numberOfStudents > minimumStudents) {
        const extraStudents = numberOfStudents - minimumStudents
        finalSalary += extraStudents * additionalSalaryPerStudent
      }
    }

    return finalSalary
  }

  async calculateInstructorTotalSalary(
    userRoleId: number,
    instructorDataDto: InstructorDataDto
  ): Promise<number> {
    const userRole = await this.userRolesRepository.findOne({
      where: { id: userRoleId, institutionId: instructorDataDto.institutionId },
      relations: { instructorProfile: true },
    })
    if (!userRole) {
      throw new NotFoundException('User role not found')
    }

    // Build where conditions for repository find
    const whereConditions: FindOptionsWhere<ClassLesson> = this.getWhereCondition(instructorDataDto)

    // Get lessons using repository method
    const classLessons = await this.classLessonRepository.find({
      where: whereConditions,
    })

    const qualifyingStudentLessonIds =
      await this.studentLessonRepository.findByEffectiveClassLessonId(
        classLessons.map((classLesson) => classLesson.id),
        {
          where: {
            studentSchedule: {
              invoice: {
                paymentState: PaymentStatus.PAID,
              },
            },
          },
        }
      )

    const qualifyingStudentLessons = await this.studentLessonRepository.findAll({
      where: {
        id: In(qualifyingStudentLessonIds.map((studentLesson) => studentLesson.id)),
      },
      select: {
        id: true,
        classLessonId: true,
        changeClassLessonId: true,
      },
    })

    const allInstructorRates = await this.instructorRatesRepository.find({
      where: {
        instructorProfileId: userRole?.instructorProfile?.id,
        institutionId: instructorDataDto.institutionId,
      },
    })

    const totalSalary = await Promise.all(
      classLessons.map(async (classLesson) => {
        const classLessonHours = dayjs(
          this.classLessonRepository.getEffectiveEndTime(classLesson)
        ).diff(dayjs(this.classLessonRepository.getEffectiveStartTime(classLesson)), 'hour', true)

        const classSpecificRate = this.getClassSpecificRate({
          rates: allInstructorRates,
          classId: classLesson.classId,
          courseId: classLesson.courseId,
        })

        const baseHourlyRate = classSpecificRate?.hourlyRate || 0

        const correctStudentLessons = qualifyingStudentLessons.filter(
          (studentLesson) =>
            this.studentLessonRepository.getEffectiveClassLessonId(studentLesson) === classLesson.id
        )
        const numberOfStudents = correctStudentLessons.length

        const finalHourlySalary = this.calculateFinalHourlySalary(
          baseHourlyRate,
          numberOfStudents,
          userRole.instructorProfile,
          classSpecificRate
        )

        return classLessonHours * finalHourlySalary
      })
    )

    return totalSalary.reduce((sum, salary) => sum + salary, 0)
  }

  getStartTimeFromPotentiallyUndefinedDate(
    startDate: Date,
    endDate: Date
  ): FindOptionsWhere<any>['startTime'] {
    if (startDate && endDate) {
      return Between(startDate, endDate)
    }
    if (startDate) {
      return MoreThanOrEqual(startDate)
    }
    if (endDate) {
      return LessThanOrEqual(endDate)
    }
    return undefined
  }

  async exportLessonsToCsv(instructorDataDto: InstructorLessonExportDto): Promise<{
    csvString: string
    fileName: string
  }> {
    const lessons = await this.getClassLessonsOfInstructor({
      institutionId: instructorDataDto.institutionId,
      instructorId: instructorDataDto.instructorId,
      classIds: instructorDataDto.classIds,
      courseIds: instructorDataDto.courseIds,
      locationIds: instructorDataDto.locationIds,
      siteId: instructorDataDto.siteId,
    })

    // Check if instructor has rates enabled by getting their profile
    const userRole = await this.userRolesRepository.findOne({
      where: { userId: instructorDataDto.instructorId },
      relations: { instructorProfile: true },
    })

    const hasRatesEnabled = userRole?.instructorProfile?.isRatesEnabled || false

    // Base headers that are always included
    const baseHeaders = [
      { id: 'startTime', title: 'Start Time' },
      { id: 'endTime', title: 'End Time' },
      { id: 'courseName', title: 'Course' },
      { id: 'className', title: 'Class' },
      { id: 'classType', title: 'Type' },
      { id: 'location', title: 'Location' },
      { id: 'numberOfStudents', title: 'Number of Students' },
      { id: 'duration', title: 'Duration (Hours)' },
    ]

    // Conditional headers based on rates
    const rateHeaders = hasRatesEnabled
      ? [
          { id: 'hourlyRate', title: 'Hourly Rate' },
          { id: 'totalAmount', title: 'Total Amount' },
        ]
      : []

    const revenueHeaders = [{ id: 'totalRevenue', title: 'Total Revenue' }]

    const csvHeaders = [...baseHeaders, ...rateHeaders, ...revenueHeaders]

    const csvData = lessons.map((lesson) => {
      const baseData = {
        startTime: lesson.startTime.toISOString(),
        endTime: lesson.endTime.toISOString(),
        courseName: lesson.course?.name || '',
        className: lesson.class?.name || '',
        classType: lesson.class?.type || '',
        location: lesson.locationRoom?.name || '',
        numberOfStudents: lesson.numberOfStudents,
        duration: lesson.duration?.toFixed(2) || '0',
      }

      // Add rate-specific data only if rates are enabled
      if (hasRatesEnabled) {
        return {
          ...baseData,
          hourlyRate: lesson.hourlyRate,
          lessonSalary: lesson.lessonSalary,
        }
      }

      return baseData
    })

    const fileName = `instructor_lessons_${instructorDataDto.instructorId}_${dayjs().format(
      'YYYYMMDD_HHmmss'
    )}.csv`
    const createCsvWriter = createObjectCsvStringifier({
      header: csvHeaders,
    })

    const csvString = createCsvWriter.getHeaderString() + createCsvWriter.stringifyRecords(csvData)

    return { csvString, fileName }
  }
}
