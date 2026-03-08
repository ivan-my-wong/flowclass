import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { instanceToInstance, plainToInstance } from 'class-transformer'
import { FindOptionsWhere, In, MoreThanOrEqual, ObjectLiteral } from 'typeorm'

import { PeriodLessonDto } from '@/application/admin/courses/dto/create-or-update-lessons.dto'
import {
  CreateRegularPeriodsDto,
  UpdateRegularPeriodsDto,
} from '@/application/admin/courses/dto/create-or-update-regular-periods.dto'
import { RegularPeriods, RegularPeriodsRepository } from '@/models/course-regular-periods.entity'
import { PeriodLessons, PeriodLessonsRepository } from '@/models/period-lessons.entity'
import { RepeatFormats, RepeatFormatsRepository } from '@/models/repeat-formats.entity'
import { User } from '@/models/user.entity'
import { BaseService } from '@/modules/base/base.service'
import { softRemoveWithRelation } from '@/utils/database.utils'
import { lessonObjectToString } from '@/utils/string.utils'
import { getCurrentTimeStamp, sortASC } from '@/utils/time.utils'

@Injectable()
export class RegularPeriodsService extends BaseService<RegularPeriods> {
  constructor(
    private regularPeriodsRepository: RegularPeriodsRepository,
    private readonly periodLessonsRepository: PeriodLessonsRepository,
    private readonly repeatFormatsRepository: RepeatFormatsRepository
  ) {
    super(regularPeriodsRepository)
  }

  async getAll(classId: number) {
    const lessons = await this.regularPeriodsRepository.findAll({
      where: { classId },
      order: {
        orderIndex: 'ASC',
        id: 'ASC',
      },
      relations: ['lessons', 'repeatFormat'],
    })
    return Promise.all(
      lessons.map(async (lesson) => {
        return {
          ...instanceToInstance(lesson, {
            excludePrefixes: ['__'],
          }),
          lessons: await lesson.lessons,
          repeatFormat: await lesson.repeatFormat,
        }
      })
    )
  }

  async createOrUpdateLessonFromPeriodObject(
    period: RegularPeriods,
    lessons: PeriodLessonDto[],
    classId: number
  ) {
    if (!period || !lessons) {
      throw new BadRequestException('Period or lessons is not valid')
    }

    // Case where all the lessons are deleted
    if (lessons.length === 0 && period.id && period.id !== 0) {
      await this.periodLessonsRepository.delete({ periodId: period.id })
      return []
    }

    const unchangedLessons: PeriodLessons[] = []

    const originalLessons = await this.periodLessonsRepository.findBy({
      periodId: period.id,
    })

    if (!originalLessons || originalLessons.length === 0) {
      const finishedLessons = lessons.map((singleLesson) => {
        const lesson = {
          classId,
          periodId: period.id,
          startTime: singleLesson.startTime,
          endTime: singleLesson.endTime,
        }

        return plainToInstance(PeriodLessons, lesson)
      })

      return await this.periodLessonsRepository.save(finishedLessons)
    } else {
      if (lessons.length < originalLessons.length) {
        const extraOriginalLessons = originalLessons.slice(lessons.length - 1)

        const idArray = extraOriginalLessons.map((l) => l.id)
        await this.periodLessonsRepository.softDelete({ id: In(idArray) })
      }

      const finishedLessons = lessons.map((singleLesson, lessonIndex) => {
        if (!singleLesson) {
          return
        }

        if (lessonIndex < originalLessons.length) {
          // The case when the lesson is changed
          if (
            singleLesson.startTime !== originalLessons[lessonIndex].startTime ||
            singleLesson.endTime !== originalLessons[lessonIndex].endTime
          ) {
            const lesson = {
              id: originalLessons[lessonIndex].id,
              classId,
              periodId: period.id,
              startTime: singleLesson.startTime,
              endTime: singleLesson.endTime,
            }

            return lesson
          } else {
            unchangedLessons.push(originalLessons[lessonIndex])
          }
        } else {
          // Case when length of new lesson array is greater than original array = must insert new lesson
          const newLesson = {
            classId,
            periodId: period.id,
            startTime: singleLesson.startTime,
            endTime: singleLesson.endTime,
          }
          return newLesson
        }
      })
      const lessonsToBeSaved = finishedLessons.filter((lesson) => lesson !== undefined)
      const savedLessons = await this.periodLessonsRepository.save(lessonsToBeSaved)

      // Combine saved lessons and unchanged original lessons. This is written by ChatGPT so IDK if it works or not
      const allLessons = [...unchangedLessons, ...savedLessons]

      return allLessons
    }
  }

  async create(dto: CreateRegularPeriodsDto, user?: User) {
    if (user) {
      dto.createdBy = user.id
      dto.updatedBy = user.id
    }

    const originalPeriodInstance = plainToInstance(RegularPeriods, dto)
    let regularPeriodResponse: RegularPeriods
    let repeatFormatInsert: any

    if (dto.repeatFormat) {
      repeatFormatInsert = await this.repeatFormatsRepository.save({
        every: dto.repeatFormat.every,
        unit: dto.repeatFormat.unit,
        times: dto.repeatFormat.times,
        institutionId: dto.institutionId,
      })

      if (repeatFormatInsert) {
        originalPeriodInstance.repeatFormat = repeatFormatInsert
      }
    }

    const returnOriginalPeriod = await this.regularPeriodsRepository.save(originalPeriodInstance)

    if (dto && returnOriginalPeriod) {
      regularPeriodResponse = returnOriginalPeriod
      regularPeriodResponse.repeatFormat = repeatFormatInsert

      regularPeriodResponse.lessons = await this.createOrUpdateLessonFromPeriodObject(
        returnOriginalPeriod,
        dto.lessons,
        dto.classId
      )
    }

    return regularPeriodResponse
  }

  async update(dto: UpdateRegularPeriodsDto, user?: User) {
    if (user) {
      dto.updatedBy = user.id
    }

    const originalPeriod: RegularPeriods = await this.regularPeriodsRepository.findOne({
      where: { id: dto.id },
    })

    if (!originalPeriod) {
      throw new NotFoundException('Can not find any lesson with id: ' + dto.id)
    }

    const regularPeriodResponse = await this.regularPeriodsRepository.save({
      ...originalPeriod,
      duration: dto.duration,
      name: dto.name,
    })

    if (originalPeriod.repeatFormat && dto.repeatFormat) {
      const repeatFormatInsert = await this.repeatFormatsRepository.update(
        { id: originalPeriod.repeatFormat.id },
        {
          every: dto.repeatFormat.every,
          unit: dto.repeatFormat.unit,
          times: dto.repeatFormat.times,
        }
      )

      if (repeatFormatInsert.raw && repeatFormatInsert.raw.length > 0) {
        regularPeriodResponse.repeatFormat = plainToInstance(
          RepeatFormats,
          repeatFormatInsert.raw[0]
        )
      }
    }

    if (dto && dto.lessons) {
      regularPeriodResponse.lessons = await this.createOrUpdateLessonFromPeriodObject(
        regularPeriodResponse,
        dto.lessons,
        dto.classId
      )
    }

    return regularPeriodResponse
  }

  async delete(id: number) {
    const found = await this.regularPeriodsRepository.findOneBy({ id })
    if (!found) {
      throw new BadRequestException('Can not find any lesson with id: ' + id)
    }

    const whereDeleteObject: FindOptionsWhere<ObjectLiteral> = {
      id,
    }

    const whereDeleteRelationObject: FindOptionsWhere<ObjectLiteral> = {
      lessonId: id,
    }

    await softRemoveWithRelation(
      this.regularPeriodsRepository.manager,
      'RegularPeriods',
      whereDeleteObject,
      whereDeleteRelationObject
    )
    return found
  }

  async deleteBy(lessonId: number, classId: number) {
    const found = await this.regularPeriodsRepository.findOne({
      where: { id: lessonId | 0, classId: classId | 0 },
    })
    if (found) {
      return await this.regularPeriodsRepository.save({
        ...found,
        deletedAt: getCurrentTimeStamp(),
      })
    }
  }

  async getOne(lessonId: number) {
    const lesson = await this.regularPeriodsRepository.findOne({
      where: { id: lessonId },
    })
    if (!lesson) {
      throw new NotFoundException('Can not found any lesson with id = ' + lessonId)
    }

    return lesson
  }

  async getNextPeriod(id: number, classId: number): Promise<RegularPeriods | null> {
    // all period
    const allPeriods = await this.regularPeriodsRepository.find({
      where: { classId },
    })

    const current = allPeriods.find((p) => p.id === id)
    if (!current) {
      throw new NotFoundException('Can not found any lesson with id = ' + id)
    }
    const lessons = lessonObjectToString(current.lessons)
    sortASC(lessons)
    const lastLesson = lessons[lessons.length - 1]
    const otherPeriods = allPeriods.filter((p) => p.id !== current.id)
    if (otherPeriods.length === 0) {
      return null
    }
    const candidatePeriod: { data: RegularPeriods; diff: number }[] = []
    for (let i = 0; i < otherPeriods.length; i++) {
      const item = otherPeriods[i]
      sortASC(lessonObjectToString(item.lessons))
      const first = lessonObjectToString(item.lessons)[0]
      if (lastLesson.isBefore(first)) {
        const diff = first.getStartDate().getTime() - lastLesson.getStartDate().getTime()
        candidatePeriod.push({ data: item, diff })
      }
    }
    if (candidatePeriod.length === 0) {
      return null
    }
    candidatePeriod.sort((e1, e2) => (e1.diff > e2.diff ? 1 : -1))
    return candidatePeriod[0].data
  }

  async getManyPeriods(firstPeriodId: number, limit: number): Promise<RegularPeriods[]> {
    const current = await this.findOneBy({ id: firstPeriodId })
    if (!current) {
      return []
    }
    const list: RegularPeriods[] = await this.regularPeriodsRepository
      .createQueryBuilder('lessons')
      .where({
        classId: current.classId,
        orderIndex: MoreThanOrEqual(current.orderIndex),
        // get the specific period for now, vietnam hardcoded the limit to 1 casuing bug,
        // remove id condition to get all period later when needed
        id: firstPeriodId,
      })
      .orderBy('lessons.orderIndex', 'ASC')
      .addOrderBy('lessons.createdAt', 'ASC')
      .limit(limit)
      .getMany()
    return list
  }

  findOneWithRelations(
    where: FindOptionsWhere<RegularPeriods> | FindOptionsWhere<RegularPeriods>[]
  ) {
    return this.regularPeriodsRepository.findOne({
      where,
      relations: {
        lessons: true,
        repeatFormat: true,
      },
    })
  }
}
