import { Injectable } from '@nestjs/common'
import { FindOptionsOrder, FindOptionsWhere } from 'typeorm'

import { CourseActivitiesOrderDetailReponse } from '@/application/admin/course-activities-order/dto/course-activities-order.dto'
import {
  CourseActivitiesOrderPageDto,
  CourseActivitiesOrderPageOptionDto,
} from '@/application/admin/course-activities-order/dto/course-activities-order-pagination.dto'
import { UpgradeCourseActivitiesOrderDto } from '@/application/admin/course-activities-order/dto/update-course-activities-order.dto'
import { CourseActivitiesOrderEntity } from '@/models/course-activities-order.entity'
import { CourseActivitiesOrderRepository } from '@/models/course-activities-order.entity'

@Injectable()
export class CourseActivitiesOrderService {
  constructor(private readonly courseActivitiesOrderRepository: CourseActivitiesOrderRepository) {}
  async findAll(
    pageOptionsDto: CourseActivitiesOrderPageOptionDto
  ): Promise<CourseActivitiesOrderPageDto> {
    const whereCondition: FindOptionsWhere<CourseActivitiesOrderEntity> = {}
    const orderOption: FindOptionsOrder<CourseActivitiesOrderEntity> = {}

    if (pageOptionsDto.orderBy) {
      orderOption[pageOptionsDto.orderBy] = pageOptionsDto.order
    }

    return this.courseActivitiesOrderRepository.paginationWithTransform(
      pageOptionsDto,
      CourseActivitiesOrderDetailReponse,
      whereCondition,
      orderOption
    )
  }

  async updateOrder(
    dto: UpgradeCourseActivitiesOrderDto
  ): Promise<CourseActivitiesOrderDetailReponse> {
    let courseActivitiesOrder = await this.courseActivitiesOrderRepository.findOneBy({
      courseId: dto.courseId,
    })

    if (!courseActivitiesOrder) {
      courseActivitiesOrder = this.courseActivitiesOrderRepository.create(dto)
    }

    courseActivitiesOrder.activityOrder = dto.order

    const updatedData = await this.courseActivitiesOrderRepository.save(courseActivitiesOrder)

    return updatedData
  }
}
