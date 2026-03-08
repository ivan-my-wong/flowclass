import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { utcToZonedTime } from 'date-fns-tz'
import { Repository } from 'typeorm'

import { CreateBlockTimeDto } from '@/application/admin/setting-block-time/dto/create-block-time.dto'
import { GetListBlockTimeDto } from '@/application/admin/setting-block-time/dto/list-block-time.dto'
import { UpdateBlockTimeDto } from '@/application/admin/setting-block-time/dto/update-block-time.dto'
import { ApiError } from '@/common/api-formats/api-error'
import { SettingSiteService } from '@/domain/service/setting-site.service'
import { ErrorCode } from '@/exceptions/error-message/errors'
import { RegularPeriodsRepository } from '@/models/course-regular-periods.entity'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { SettingBlockTime } from '@/models/setting-block-time.entity'

import { ClassLessonService } from './class-lesson.service'
@Injectable()
export class SetingBlockTimeService {
  constructor(
    @InjectRepository(SettingBlockTime)
    private readonly settingBlockTimeRepository: Repository<SettingBlockTime>,
    private readonly institutionRepository: InstitutionsRepository,
    private readonly settingSiteService: SettingSiteService,
    private readonly regularPeriodsRepository: RegularPeriodsRepository,
    private readonly classLessonService: ClassLessonService
  ) {}

  async create(data: CreateBlockTimeDto) {
    const institution = await this.institutionRepository.findOneById(data.institutionId)
    const timeZone = await this.settingSiteService.getTimeZone(institution.siteId)

    const startTime = utcToZonedTime(data.startTime, timeZone)
    const endTime = utcToZonedTime(data.endTime, timeZone)

    const blockTimeExist = await this.settingBlockTimeRepository.findOneBy({
      startTime,
      endTime,
    })
    if (blockTimeExist) throw new ApiError(ErrorCode.BLOCK_TIME_ALREADY_EXIST)

    const isHaveClassLessonRepeat = await this.classLessonService.checkClassLessonNotAuto(
      data.institutionId,
      startTime,
      endTime
    )

    const blockTime = await this.settingBlockTimeRepository.save(
      this.settingBlockTimeRepository.create(data)
    )

    return {
      blockTime,
      isHaveClassLessonRepeat,
    }
  }

  async getList(data: GetListBlockTimeDto) {
    return this.settingBlockTimeRepository.find({
      where: { institutionId: data.institutionId },
      order: { createdAt: 'DESC' },
    })
  }

  async getBlockTimeArray(data: GetListBlockTimeDto) {
    const blockTime = await this.settingBlockTimeRepository.find({
      where: { institutionId: data.institutionId },
      order: { createdAt: 'DESC' },
    })

    return blockTime.map((item) => `${item.startTime.toISOString()} ${item.endTime.toISOString()}`)
  }

  async delete(id: number) {
    const blockTime = await this.settingBlockTimeRepository.findOne({
      where: { id },
    })
    if (!blockTime) throw new ApiError(ErrorCode.BLOCK_TIME_NOT_FOUND)

    return this.settingBlockTimeRepository.softRemove(blockTime)
  }

  async getDetail(id: number) {
    const blockTime = await this.settingBlockTimeRepository.findOne({
      where: { id },
    })
    if (!blockTime) throw new ApiError(ErrorCode.BLOCK_TIME_NOT_FOUND)

    return blockTime
  }

  async update(id: number, body: UpdateBlockTimeDto) {
    const blockTime = await this.settingBlockTimeRepository.findOne({
      where: { id },
    })

    if (!blockTime) throw new ApiError(ErrorCode.BLOCK_TIME_NOT_FOUND)

    const blockTimeWithSameTime = await this.settingBlockTimeRepository.findOne({
      where: {
        startTime: body.startTime,
        endTime: body.endTime,
        institutionId: blockTime.institutionId,
      },
    })

    if (blockTimeWithSameTime) throw new ApiError(ErrorCode.BLOCK_TIME_ALREADY_EXIST)

    return this.settingBlockTimeRepository.save({ ...blockTime, ...body })
  }
}
