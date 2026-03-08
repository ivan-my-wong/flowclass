import { BadRequestException, Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import { FindOptionsOrder, FindOptionsWhere, In } from 'typeorm'

import {
  TrialLessonDto,
  TrialLessonObject,
  TrialLessonsPageOptionDto,
  ValidClassTrialLessonResult,
} from '@/application/admin/promotions/dto/trial-lesson.dto'
import { StudentCheckIsValidTrialLesson } from '@/application/student/enroll-courses/dto/enroll-course-pagination.dto'
import { StudentCheckAvailableTrialLessonDto } from '@/application/student/promotions/dto/trial-lesson.dto'
import { PromotionErrorMessage } from '@/exceptions/error-message/promotion'
import { ClassPriceOptionRepository } from '@/models/class-price-options.repository'
import { ClassRepository } from '@/models/classes.repository'
import { CoursesRepository } from '@/models/courses.repository'
import { EnrollCourseRepository } from '@/models/enroll-courses.repository'
import { ClassTrialLesson, TrialLesson } from '@/models/trial-lesson.entity'
import { ClassTrialLessonRepository, TrialLessonRepository } from '@/models/trial-lesson.repository'
import { BaseService } from '@/modules/base/base.service'

@Injectable()
export class TrialLessonService extends BaseService<TrialLesson> {
  constructor(
    private readonly courseRepository: CoursesRepository,
    private readonly classRepository: ClassRepository,
    private readonly trialLessonRepository: TrialLessonRepository,
    private readonly classTrialLessonRepository: ClassTrialLessonRepository,
    private readonly enrollCourseRepository: EnrollCourseRepository,
    private readonly classPriceOptionRepository: ClassPriceOptionRepository
  ) {
    super(trialLessonRepository)
  }

  async findAll(dto: TrialLessonsPageOptionDto) {
    const whereCondition: FindOptionsWhere<TrialLesson> = {}
    if (dto.institutionId) {
      whereCondition.institutionId = dto.institutionId
    }

    if (dto.siteId) {
      whereCondition.siteId = dto.siteId
    }

    const orderOption: FindOptionsOrder<TrialLesson> = {}
    if (dto.orderBy) {
      orderOption[dto.orderBy] = dto.order
    }

    const trialLessons = await this.trialLessonRepository.pagination(
      dto,
      whereCondition,
      orderOption,
      {
        classes: {
          classEntity: true,
        },
      }
    )
    return trialLessons
  }

  async countAllTrialLessons(siteId: number, institutionId: number): Promise<number> {
    return this.trialLessonRepository.count({
      where: {
        institutionId,
        siteId,
      },
    })
  }

  async findById(id: number): Promise<TrialLesson> {
    const trialLesson = await this.trialLessonRepository.findOne({
      where: { id },
      relations: {
        classes: {
          classEntity: true,
        },
      },
    })
    if (!trialLesson) {
      throw new BadRequestException(PromotionErrorMessage.TRIAL_LESSON_NOT_FOUND)
    }
    return trialLesson
  }

  async findDuplicateTrialLesson(
    courseIds: number[],
    classIds: number[],
    existingId?: number
  ): Promise<void> {
    const targetBundleCourse = await this.trialLessonRepository.findOne({
      where: {
        // courseIds: Raw((alias) => `${alias} && ARRAY[:...courseIds]::int[]`, { courseIds }),
        classes: {
          classId: In(classIds),
        },
      },
      relations: {
        classes: true,
      },
    })
    if (targetBundleCourse && (!existingId || targetBundleCourse.id !== existingId)) {
      throw new BadRequestException(PromotionErrorMessage.TRIAL_LESSON_ALREADY_EXIST)
    }
  }

  async create({
    dto,
    siteId,
    institutionId,
  }: {
    dto: TrialLessonDto
    siteId: number
    institutionId: number
  }): Promise<TrialLesson> {
    const { courseIds, useOriginalPrice, price, classes: classesDto, ...other } = dto
    const classIds = classesDto.map((d) => d.classId)
    await this.findDuplicateTrialLesson(courseIds, classIds)
    const newTrialLesson = this.trialLessonRepository.create({
      ...other,
      siteId,
      institutionId,
      courseIds,
      useOriginalPrice,
      price,
    })
    const classes = await this.classRepository.find({
      where: {
        id: In(classIds),
      },
      relations: ['priceOptions'],
    })
    const resultTrialLesson = await this.trialLessonRepository.save(newTrialLesson)

    const trialLessonClasses = await Promise.all(
      classes.map(async (classEntity) => {
        let classPrice = price != null ? +price : 0

        if (useOriginalPrice) {
          if (classEntity.priceOptions && classEntity.priceOptions.length > 0) {
            const sortedPriceOptions = classEntity.priceOptions.sort((a, b) => a.id - b.id)
            const priceOption = sortedPriceOptions[0]
            classPrice = +priceOption.amount / (priceOption.numberOfLessons || 1)
          } else {
            const priceOption = await this.classPriceOptionRepository.findOne({
              where: { classId: classEntity.id },
              order: { id: 'ASC' },
            })

            if (priceOption) {
              classPrice = +priceOption.amount / (priceOption.numberOfLessons || 1)
            }
          }
        } else if (price == null) {
          throw new BadRequestException('price is required when useOriginalPrice is false')
        }

        return {
          trialLessonId: resultTrialLesson.id,
          price: classPrice,
          classId: classEntity.id,
          classEntity,
        } as ClassTrialLesson
      })
    )
    if (dto.useOriginalPrice) {
      resultTrialLesson.price = trialLessonClasses[0].price
      await this.trialLessonRepository.save(resultTrialLesson)
    }
    const resultClassTrialLesson = await this.classTrialLessonRepository.save(trialLessonClasses)
    return {
      ...resultTrialLesson,
      classes: resultClassTrialLesson,
    }
  }

  async update(id: number, dto: TrialLessonDto): Promise<TrialLessonObject> {
    const classIds = dto.classes.map((d) => d.classId)
    const trialLesson = await this.findById(id)

    if (dto.courseIds) {
      const courses = await this.courseRepository.findBy({
        id: In(dto.courseIds),
      })

      if (courses.length !== dto.courseIds.length) {
        throw new BadRequestException(PromotionErrorMessage.COURSE_NOT_FOUND)
      }
      await this.findDuplicateTrialLesson(dto.courseIds, classIds, id)
    }
    trialLesson.useOriginalPrice = dto.useOriginalPrice
    trialLesson.price = dto.price
    trialLesson.enabled = dto.enabled
    await this.findRemovedClasses(trialLesson.classes, classIds)

    const trialLessonUpdated = await this.trialLessonRepository.save(trialLesson)

    // Fetch all classes at once to avoid N+1 query problem
    const allClasses = await this.classRepository.find({
      where: { id: In(classIds) },
      relations: ['priceOptions'],
    })
    const classesById = new Map(allClasses.map((cls) => [cls.id, cls]))

    trialLessonUpdated.classes = await Promise.all(
      classIds.map(async (classId) => {
        const currentTrialLessonClass = await this.classTrialLessonRepository.findOne({
          where: {
            classId,
            trialLessonId: trialLesson.id,
          },
          relations: {
            classEntity: true,
          },
        })
        const classEntity = classesById.get(classId)
        if (!classEntity) {
          throw new BadRequestException(`Class with id ${classId} not found`)
        }

        const newTrialClass =
          currentTrialLessonClass ||
          this.classTrialLessonRepository.create({
            classId,
            trialLessonId: trialLesson.id,
          })

        let classPrice = dto.price != null ? +dto.price : 0
        if (
          dto.useOriginalPrice &&
          classEntity.priceOptions &&
          classEntity.priceOptions.length > 0
        ) {
          // Sort by id for deterministic pricing
          const sortedPriceOptions = classEntity.priceOptions.sort((a, b) => a.id - b.id)
          classPrice = +sortedPriceOptions[0].amount
        } else if (!dto.useOriginalPrice && dto.price == null) {
          throw new BadRequestException('price is required when useOriginalPrice is false')
        }
        newTrialClass.price = dto.useOriginalPrice ? classPrice : dto.price

        const newTrialLesson = await this.trialLessonRepository.findOne({
          where: {
            id: newTrialClass.trialLessonId,
          },
        })

        newTrialLesson.courseIds = [...new Set([...newTrialLesson.courseIds, classEntity.courseId])]
        await this.trialLessonRepository.save(newTrialLesson)

        return this.classTrialLessonRepository.save(newTrialClass)
      })
    )
    const firstItem = trialLessonUpdated.classes[0]
    await this.trialLessonRepository.update(id, {
      price: dto.useOriginalPrice ? firstItem.price : dto.price,
    })
    return plainToInstance(TrialLessonObject, trialLessonUpdated)
  }

  async findRemovedClasses(
    classTrialLesson: ClassTrialLesson[],
    classTrialLessonDto: number[]
  ): Promise<ClassTrialLesson[]> {
    if (classTrialLessonDto.length <= 0) return classTrialLesson
    const removedClasses = classTrialLesson.filter(
      (lesson) => !classTrialLessonDto.includes(lesson.classId)
    )
    for (const removedClass of removedClasses) {
      await this.classTrialLessonRepository.delete({ id: removedClass.id })
    }
    return classTrialLesson.filter((d) => classTrialLessonDto.includes(d.id))
  }

  async remove(id: number): Promise<TrialLessonObject> {
    const trialLesson = await this.findById(id)
    if (!trialLesson) {
      throw new BadRequestException(PromotionErrorMessage.TRIAL_LESSON_NOT_FOUND)
    }
    const bundleRemoved = await this.trialLessonRepository.softRemove(trialLesson)
    for (const classItem of trialLesson.classes) {
      await this.classTrialLessonRepository.delete({ id: classItem.id })
    }
    return plainToInstance(TrialLessonObject, bundleRemoved)
  }

  async getAvailableTrialLesson(dto: StudentCheckAvailableTrialLessonDto) {
    return this.classTrialLessonRepository.findOne({
      where: {
        trialLesson: {
          enabled: true,
          institutionId: dto.institutionId,
          // courseIds: Raw((alias) => `:value = ANY(${alias})`, { value: dto.courseId }),
        },
        classId: In(dto.classIds),
      },
      relations: {
        trialLesson: true,
        classEntity: true,
      },
    })
  }

  async validateTrialLesson(
    dto: StudentCheckIsValidTrialLesson
  ): Promise<ValidClassTrialLessonResult> {
    const trialLessonExists = await this.getAvailableTrialLesson(dto)
    if (!trialLessonExists) {
      return {
        isValid: false,
        classTrialLesson: null,
      }
    }

    const applicantEmails = dto.applicants.map((d) => d.email)
    const applicantPhones = dto.applicants.map((d) => d.phone)

    const isEnrollCourseExists = await this.enrollCourseRepository.exist({
      where: {
        courseId: dto.courseId,
        institutionId: dto.institutionId,
        studentSchedule: {
          studentLessons: {
            user: {
              email: In(applicantEmails),
              aliases: {
                user: {
                  phone: In(applicantPhones),
                },
              },
            },
          },
        },
      },
      relations: {
        studentSchedule: {
          studentLessons: {
            user: {
              aliases: {
                user: true,
              },
            },
          },
        },
      },
    })
    return {
      isValid: !isEnrollCourseExists,
      classTrialLesson: trialLessonExists,
    }
  }
}
