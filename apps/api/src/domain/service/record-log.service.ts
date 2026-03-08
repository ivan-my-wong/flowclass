import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as _ from 'lodash'
import { Not, Repository } from 'typeorm'

import { CreateRecordLogDto } from '@/application/admin/record-log/dto/create-record-log.dto'
import {
  GetRecordLogByContactDto,
  StudentActivitiesDto,
} from '@/application/admin/record-log/dto/get-list-record-log.dto'
import { RecordLogType } from '@/models/enums/'
import { RecordLog } from '@/models/record-log.entity'

interface LogCouponHistory {
  detail: object
  types: RecordLogType[]
  institutionId: number
}

@Injectable()
export class RecordLogService {
  constructor(
    @InjectRepository(RecordLog)
    private recordLogRepository: Repository<RecordLog>
  ) {}

  async create(createRecordLog: CreateRecordLogDto[]): Promise<RecordLog[]> {
    const recordLogs = this.recordLogRepository.create(createRecordLog)
    return this.recordLogRepository.save(recordLogs)
  }

  async getCouponHistory(cond: LogCouponHistory) {
    const histories = await this.recordLogRepository
      .createQueryBuilder('rl')
      .where('rl.institutionId = :institutionId', {
        institutionId: cond.institutionId,
      })
      .andWhere('rl.type IN (:...types)', { types: cond.types })
      .andWhere('rl.detail @> :detail', { detail: JSON.stringify(cond.detail) })
      .andWhere('rl.userId IS NULL')
      .orderBy('rl.createdAt', 'DESC')
      .getRawMany()

    return _.map(histories, (item) => {
      return {
        id: item.rl_id,
        type: item.rl_type,
        detail: item.rl_detail,
        createdAt: item.rl_created_at,
      }
    })
  }

  async getStudentActivities(params: StudentActivitiesDto) {
    return await this.recordLogRepository.find({
      where: {
        userId: params.userId,
        type: Not(RecordLogType.DELETE_COUPON),
      },
      order: {
        createdAt: 'DESC',
      },
      take: params.limit,
      skip: (params.page - 1) * params.limit,
    })
  }

  async getRecordLogByContact(params: GetRecordLogByContactDto): Promise<RecordLog[]> {
    const { institutionId, email, phone } = params
    if (!email && !phone) {
      throw new BadRequestException('Either email or phone must be provided')
    }
    let query = this.recordLogRepository
      .createQueryBuilder('rl')
      .where('rl.institutionId = :institutionId', { institutionId })

    if (email) {
      query = query.andWhere(`rl.email ILIKE :email`, {
        email: `%${email}%`,
      })
    }
    if (phone) {
      query = query.andWhere(`rl.phone ILIKE :phone`, {
        phone: `%${phone}%`,
      })
    }

    query = query.orderBy('rl.createdAt', 'DESC')
    return await query.getMany()
  }
}
