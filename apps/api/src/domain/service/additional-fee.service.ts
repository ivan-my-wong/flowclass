import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreateAdditionalFeeDto } from '@/application/admin/additional-fee/additional-fee.dto'
import { ErrorCode } from '@/exceptions/error-message/errors'
import { InstitutionErrorMessage } from '@/exceptions/error-message/institution'
import { SiteErrorMessage } from '@/exceptions/error-message/site'
import { AdditionalFee } from '@/models/additional-fee.entity'
import { CoursesRepository } from '@/models/courses.repository'
import { Institution } from '@/models/institutions.entity'
import { Site } from '@/models/site.entity'

@Injectable()
export class AdditionalFeeService {
  // Add your methods here
  constructor(
    @InjectRepository(AdditionalFee)
    private additionalFeeRepository: Repository<AdditionalFee>,
    @InjectRepository(Site)
    private siteRepository: Repository<Site>,
    @InjectRepository(Institution)
    private institutionRepository: Repository<Institution>,
    private readonly coursesRepository: CoursesRepository
  ) {}

  async create(createAdditionalFeeDto: CreateAdditionalFeeDto): Promise<AdditionalFee> {
    const site = await this.siteRepository.findOneBy({
      id: createAdditionalFeeDto.siteId,
    })
    const institution = await this.institutionRepository.findOneBy({
      id: createAdditionalFeeDto.institutionId,
    })

    if (!site) {
      throw new Error(SiteErrorMessage.SITE_NOT_FOUND)
    }

    if (!institution) {
      throw new Error(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
    }

    const additionalFee = this.additionalFeeRepository.create(createAdditionalFeeDto)
    return this.additionalFeeRepository.save(additionalFee)
  }

  async assignToCourse(additionalFeeId: number, courseId: number): Promise<any> {
    const additionalFee = await this.additionalFeeRepository.findOneBy({
      id: additionalFeeId,
    })
    if (!additionalFee) {
      throw new Error(ErrorCode.ADDITIONAL_FEE_NOT_FOUND)
    }

    const course = await this.coursesRepository.findOneBy({ id: courseId })
    if (!course) {
      throw new Error(ErrorCode.COURSE_NOT_FOUND)
    }

    if (!additionalFee.courseIds.includes(courseId)) {
      additionalFee.courseIds.push(courseId)
    }
    return this.additionalFeeRepository.save(additionalFee)
  }

  async unassignFromCourse(additionalFeeId: number, courseId: number): Promise<any> {
    const additionalFee = await this.additionalFeeRepository.findOneBy({
      id: additionalFeeId,
    })
    if (!additionalFee) {
      throw new Error(ErrorCode.ADDITIONAL_FEE_NOT_FOUND)
    }

    const courseIndex = additionalFee.courseIds.indexOf(courseId)
    if (courseIndex > -1) {
      additionalFee.courseIds.splice(courseIndex, 1)
    } else {
      throw new Error(ErrorCode.COURSE_NOT_FOUND)
    }

    return this.additionalFeeRepository.save(additionalFee)
  }
}
