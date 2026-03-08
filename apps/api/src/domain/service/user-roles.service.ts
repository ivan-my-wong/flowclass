import { Injectable } from '@nestjs/common'
import { FindOptionsWhere, UpdateResult } from 'typeorm'

import { AssignSiteManagerDto } from '@/application/admin/sites/dto/assign-site-manager.dto'
import { CreateUserRoleDto } from '@/application/admin/users/dto/create-user.dto'
import { RoleInSite } from '@/models/enums/'
import { UserRole } from '@/models/user-role.entity'
import { UserRolesRepository } from '@/models/user-roles.repository'
import { UsersRepository } from '@/models/users.repository'

@Injectable()
export class UserRolesService {
  constructor(
    private userRolesRepository: UserRolesRepository,
    private userRepository: UsersRepository
  ) {}
  async getUserRoleBySiteAndInstitution(
    siteId: number,
    institutionId: number,
    userId: number
  ): Promise<UserRole | null> {
    return await this.userRolesRepository.findOneBy({ siteId, institutionId, userId })
  }
  async create(createUserRoleDto: CreateUserRoleDto): Promise<UserRole> {
    const userRole = await this.getUserRoleBySiteAndInstitution(
      createUserRoleDto.siteId,
      createUserRoleDto.institutionId,
      createUserRoleDto.userId
    )

    if (userRole) {
      await this.userRolesRepository.update(userRole.id, createUserRoleDto)
    } else {
      await this.userRolesRepository.save(this.userRolesRepository.create(createUserRoleDto))
    }
    return this.getUserRoleBySiteAndInstitution(
      createUserRoleDto.siteId,
      createUserRoleDto.institutionId,
      createUserRoleDto.userId
    )
  }

  async update(id: number, updateUserRoleDto: CreateUserRoleDto): Promise<UpdateResult> {
    return await this.userRolesRepository.update(id, updateUserRoleDto)
  }

  async findOneBySiteAndUser(siteId: number, userId: number): Promise<UserRole> {
    return await this.userRolesRepository.findOneBy({ siteId, userId })
  }

  async deleteBySiteAndUser(siteId: number, userId: number): Promise<any> {
    const whereCondition: FindOptionsWhere<UserRole> = { siteId, userId }

    return await this.userRolesRepository.delete(whereCondition)
  }

  async deleteByInstitutionAndUser(institutionId: number, userId: number): Promise<any> {
    const whereCondition: FindOptionsWhere<UserRole> = {
      institutionId,
      userId,
    }

    return await this.userRolesRepository.delete(whereCondition)
  }

  async getCurrentSiteManager(siteId: number): Promise<UserRole> {
    const whereCondition: FindOptionsWhere<UserRole> = {
      siteId,
      isSiteManager: true,
    }

    return await this.userRolesRepository.findOneBy(whereCondition)
  }

  async assignSiteManager({ siteId, assignedUserId }: AssignSiteManagerDto): Promise<boolean> {
    await this.deleteBySiteAndUser(siteId, assignedUserId)

    const currentSiteManager = await this.getCurrentSiteManager(siteId)

    if (!currentSiteManager) {
      await this.create({
        siteId,
        userId: assignedUserId,
        institutionId: 0,
        isMasterAdmin: false,
        isSiteManager: true,
        isInstitutionManager: false,
        isInstructor: false,
        isOperator: false,
        isStudent: false,
      })

      return true
    }

    await this.userRolesRepository.update(currentSiteManager.id, {
      userId: assignedUserId,
    })

    return true
  }

  async userExistsInSite(siteId: number, userId: number): Promise<boolean> {
    const number = await this.userRolesRepository.countBy({
      siteId,
      userId,
    })

    return number > 0
  }

  async findOneByInstitutionAndUser(siteId: number, institutionId: number, userId: number) {
    return await this.userRolesRepository.findOneBy({
      siteId,
      institutionId,
      userId,
    })
  }

  async findByUser(userId: number) {
    const result = {}

    const userRoles = await this.userRolesRepository.findAll({
      where: {
        userId,
      },
    })

    userRoles.forEach((data) => {
      result[data.siteId + '_' + data.institutionId + '_' + data.userId] = data
    })

    return result
  }
  async findOneBy(
    where: FindOptionsWhere<UserRole> | FindOptionsWhere<UserRole>[]
  ): Promise<UserRole | null> {
    return this.userRolesRepository.findOneBy(where)
  }

  async changeUserRole(email: string, role: RoleInSite): Promise<UserRole | null> {
    const user = await this.userRepository.findOneBy({ email })
    const userRole = await this.userRolesRepository.findOneBy({
      userId: user.id,
    })
    userRole.isSiteManager = role == RoleInSite.SITE_MANAGER
    userRole.isInstitutionManager = role == RoleInSite.INSTITUTION_MANAGER
    userRole.isInstructor = role == RoleInSite.INSTRUCTOR
    userRole.isOperator = role == RoleInSite.OPERATOR
    return await this.userRolesRepository.save(userRole)
  }

  async findAllBy(
    where: FindOptionsWhere<UserRole> | FindOptionsWhere<UserRole>[]
  ): Promise<UserRole[]> {
    return this.userRolesRepository.findBy(where)
  }
}
