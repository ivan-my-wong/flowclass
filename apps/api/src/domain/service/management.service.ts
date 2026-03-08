import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as _ from 'lodash'
import { Repository } from 'typeorm'

import {
  AssignManagementDto,
  GetInstitutionDto,
  SearchUserManagementDto,
} from '@/application/admin/master-admin/dtos/master-admin.dto'
import { ApiError } from '@/common/api-formats/api-error'
import { ErrorCode } from '@/exceptions/error-message/errors'
import { Institution } from '@/models/institutions.entity'
import { User } from '@/models/user.entity'
import { UserRole } from '@/models/user-role.entity'
import { toCamelCase } from '@/utils/response.utils'

@Injectable()
export class ManagementService {
  constructor(
    @InjectRepository(Institution)
    private readonly institutionRepo: Repository<Institution>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(UserRole)
    private readonly userRoleRepository: Repository<UserRole>
  ) {}

  async getInstitutions(params: GetInstitutionDto) {
    const institutions = await this.institutionRepo
      .createQueryBuilder('i')
      .leftJoinAndSelect(
        UserRole,
        'ur',
        'ur.institution_id = i.id AND ur.is_institution_manager = true'
      )
      .leftJoinAndSelect(User, 'u', 'u.id = ur.user_id')
      .select(
        `
        i.*,
        jsonb_agg(json_build_object('name', u.first_name, 'email', u.email, 'id', u.id)) as admins
      `
      )
      .where('i.site_id = :siteId', { siteId: params.siteId })
      .groupBy('i.id')
      .orderBy('i.name')
      .limit(params.limit)
      .offset((params.page - 1) * params.limit)
      .getRawMany()

    return _.map(institutions, (i) => toCamelCase(i))
  }

  async searchUser(params: SearchUserManagementDto) {
    return await this.userRepo
      .createQueryBuilder('u')
      .select('u.id, u.first_name as name, u.email')
      .where('u.first_name ILIKE :keyword', {
        keyword: `%${params.keyword}%`,
      })
      .orWhere('u.email ILIKE :keyword', {
        keyword: `%${params.keyword}%`,
      })
      .orderBy('u.first_name')
      .limit(10)
      .getRawMany()
  }

  async assignManagementForIns(params: AssignManagementDto) {
    let userRole = await this.userRoleRepository.findOneBy({
      institutionId: params.institutionId,
      userId: params.userId,
    })

    if (userRole && userRole.isInstitutionManager)
      throw new ApiError(ErrorCode.USER_ALREADY_MANAGER_OF_INSTITUTION)

    if (!userRole) {
      userRole = this.userRoleRepository.create({
        ...params,
      })
    }

    userRole.isInstitutionManager = true

    return await this.userRoleRepository.save(userRole)
  }

  async removeAssignManagement(params: AssignManagementDto) {
    const userRole = await this.userRoleRepository.findOneBy({
      institutionId: params.institutionId,
      userId: params.userId,
      isInstitutionManager: true,
    })

    if (!userRole) throw new ApiError(ErrorCode.USER_NOT_ALREADY_MANAGER_OF_INSTITUTION)

    userRole.isInstitutionManager = false

    return await this.userRoleRepository.save(userRole)
  }
}
