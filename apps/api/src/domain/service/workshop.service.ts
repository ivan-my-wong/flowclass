import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { FindOptionsOrder, FindOptionsRelations, FindOptionsWhere, ObjectLiteral } from 'typeorm'

import {
  SessionPageDTO,
  SessionPageOptionsDto,
  UpdateWorkshopSessionDTO,
  WorkshopPageOptionDTO,
} from '@/application/admin/courses/dto/create-or-update-course.dto'
import { UpdatePeriodLessonsDto } from '@/application/admin/courses/dto/create-or-update-regular-periods.dto'
import { CourseErrorMessage } from '@/exceptions/error-message/course'
import { ClassEntity } from '@/models/classes.entity'
import { ClassRepository } from '@/models/classes.repository'
import { Course } from '@/models/courses.entity'
import { CoursesRepository } from '@/models/courses.repository'
import { User } from '@/models/user.entity'
import { BaseService } from '@/modules/base/base.service'
import { softRemoveWithRelation } from '@/utils/database.utils'
import { sortByCriterias, trimAllExcept } from '@/utils/response.utils'

import { PeriodLessonsService } from './period-lessons.service'

@Injectable()
export class WorkshopService extends BaseService<ClassEntity> {
  constructor(
    private courseRepository: CoursesRepository,
    private classesRepository: ClassRepository,
    private periodLessonsService: PeriodLessonsService
  ) {
    super(classesRepository)
  }

  async getAllWorkshopWithSession(dto: WorkshopPageOptionDTO): Promise<Course[]> {
    const whereCondition: FindOptionsWhere<Course> = {}
    if (dto.institutionId) {
      whereCondition.institutionId = dto.institutionId
    }

    const orderOption: FindOptionsOrder<Course> = {}
    if (dto.orderBy) {
      orderOption[dto.orderBy] = dto.order
    }

    const relations: FindOptionsRelations<Course> = {
      classes: true,
    }

    const courses = await this.courseRepository.pagination(
      dto,
      whereCondition,
      orderOption,
      relations
    )
    return courses.content
  }

  async getAllSessionWithDate(dto: SessionPageOptionsDto): Promise<SessionPageDTO | ClassEntity[]> {
    const whereCondition: FindOptionsWhere<ClassEntity> = {}
    if (dto.courseId) {
      whereCondition.courseId = dto.courseId
    }

    const orderOption: FindOptionsOrder<ClassEntity> = {}
    if (dto.orderBy) {
      orderOption[dto.orderBy] = dto.order
    }

    const relations: FindOptionsRelations<ClassEntity> = {
      regularPeriods: true,
    }

    const pageData = await this.classesRepository.pagination(
      dto,
      whereCondition,
      orderOption,
      relations
    )
    if (pageData?.content?.length > 0) {
      for (let i = 0; i < pageData?.content?.length; i++) {
        const sessionData = pageData?.content[i]
        sortByCriterias(sessionData, 'regularPeriods', 'ASC', 'startTime', null, 'date')
      }
    }
    return pageData
  }

  async getDetailSession(id: number) {
    const found = await this.classesRepository.findOne({
      where: { id },
      relations: { regularPeriods: true },
    })

    if (!found) {
      throw new NotFoundException(CourseErrorMessage.SESSION_NOT_FOUND)
    }
    sortByCriterias(found, 'regularPeriods', 'ASC', 'startTime', null, 'date')
    for (let i = 0; i < found.regularPeriods.length; i++) {
      const ssDate = found.regularPeriods[i]
      trimAllExcept(['id', 'periodId', 'startTime', 'endTime'], ssDate)
    }
    return found
  }

  async remove(id: number) {
    const session = await this.classesRepository.findOneBy({ id })
    if (!session) {
      throw new BadRequestException('Can not found session')
    }

    const whereDeleteObject: FindOptionsWhere<ObjectLiteral> = {
      id,
    }

    const whereDeleteRelationObject: FindOptionsWhere<ObjectLiteral> = {
      sessionId: id,
    }

    await softRemoveWithRelation(
      this.classesRepository.manager,
      'WKSession',
      whereDeleteObject,
      whereDeleteRelationObject
    )
    return session
  }
  //no longer used
  async updateWorkshopSession(id: number, dto: UpdateWorkshopSessionDTO, user?: User) {
    await this.classesRepository.update(id, {
      name: dto.name,
      quota: dto.quota,
      // tuition: dto.totalFee,
      locality: dto.location,
      updatedBy: user?.id,
    })
    const sessionDates: UpdatePeriodLessonsDto[] = dto.sessionDates
    await this.periodLessonsService.upsertMany(sessionDates, id)

    return this.getDetailSession(id)
  }
}
