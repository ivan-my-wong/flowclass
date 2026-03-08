import { Injectable } from '@nestjs/common'
import { In } from 'typeorm'

import { StudentSchedule } from '@/models/student-schedule.entity'
import { StudentScheduleRepository } from '@/models/student-schedule.repository'
import { BaseService } from '@/modules/base/base.service'

@Injectable()
export class StudentScheduleService extends BaseService<StudentSchedule> {
  constructor(private studentScheduleRepository: StudentScheduleRepository) {
    super(studentScheduleRepository)
  }

  async findAllByEnrollCourseId(enrollCourseId: number, options?: any) {
    return this.studentScheduleRepository.findAll({
      where: { enrollCourseId },
      ...options,
    })
  }

  async findAllByEnrollCourseIds(enrollCourseIds: number[], options?: any) {
    return this.studentScheduleRepository.findAll({
      where: { enrollCourseId: In(enrollCourseIds) },
      ...options,
    })
  }
}
