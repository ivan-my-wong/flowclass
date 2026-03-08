import { Injectable } from '@nestjs/common'

import { UpdatePeriodLessonsDto } from '@/application/admin/courses/dto/create-or-update-regular-periods.dto'
import { PeriodLessons } from '@/models/period-lessons.entity'
import { PeriodLessonsRepository } from '@/models/period-lessons.entity'

@Injectable()
export class PeriodLessonsService {
  constructor(private periodLessonsRepository: PeriodLessonsRepository) {}

  async getAll(sessionId: number) {
    const all = await this.periodLessonsRepository.find({
      select: ['id', 'startTime', 'endTime'],
      where: { periodId: sessionId },
    })
    return all
  }

  async upsertMany(
    sessionDates: UpdatePeriodLessonsDto[],
    sessionId?: number
  ): Promise<PeriodLessons[]> {
    const results = []
    for (let i = 0; i < sessionDates.length; i++) {
      const date = sessionDates[i]
      date.classId = sessionId
      const updated = await this.upsert(date)
      results.push(updated)
    }
    return results
  }

  async upsert(date: UpdatePeriodLessonsDto): Promise<PeriodLessons> {
    const found = await this.periodLessonsRepository.findOne({
      where: { id: date.id | 0, periodId: date.classId | 0 },
    })
    if (found) {
      if (date.deleted) {
        await this.periodLessonsRepository.softDelete({ id: date.id })
        found.deletedAt = new Date()
        return found
      } else {
        const updated = await this.periodLessonsRepository.save({
          ...found,
          startTime: date.startTime,
          endTime: date.endTime,
        })
        return updated
      }
    } else {
      delete date.id
      const createdDate = this.periodLessonsRepository.create(date)
      const saved = await this.periodLessonsRepository.save(createdDate)
      return saved
    }
  }
}
