/* eslint-disable simple-import-sort/imports */
import { ChangeAliasPasswordDto } from '@/application/admin/users/dto/change-alias-password.dto'
import {
  ChangePasswordDto,
  ChangeUserPasswordDto,
} from '@/application/admin/users/dto/change-password.dto'
import { ChangeProfileDto } from '@/application/admin/users/dto/change-profile.dto'
import { CreateUserDto } from '@/application/admin/users/dto/create-user.dto'
import {
  UpdateUserPermissionDto,
  UpdateUserProfileDto,
} from '@/application/admin/users/dto/update-user.dto'
import { UserDetailDto } from '@/application/admin/users/dto/user-detail.dto'
import { UserPageDto, UserPageOptionDto } from '@/application/admin/users/dto/user-pagination.dto'
import { UserRoleResponse } from '@/application/admin/users/dto/user-role.dto'
import { StudentErrorMessage, UserErrorMessage } from '@/exceptions/error-message/user'
import { InviteSiteMemberStatus } from '@/models/enums/status'
import { Institution } from '@/models/institutions.entity'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { InviteMembersRepository } from '@/models/invite-members.repository'
import { Site } from '@/models/site.entity'
import { SitesRepository } from '@/models/sites.repository'
import { UserRole } from '@/models/user-role.entity'
import { UserRolesRepository } from '@/models/user-roles.repository'
import { User } from '@/models/user.entity'
import { UsersRepository } from '@/models/users.repository'
import { BaseService } from '@/modules/base/base.service'
import { softRemoveWithRelation } from '@/utils/database.utils'
import { permissionsOfUser } from '@/utils/user-roles.utils'

import { UserRolesService } from './user-roles.service'

import { BaseRegisterDto } from '@/application/admin/auth/dto/base-register.dto'
import { InviteUserResponse } from '@/application/admin/users/dto/invite-user.dto'
import { StudentRegisterDto } from '@/application/student/auth/dto/student-register.dto'
import { ClassLessonRepository } from '@/models/class-lesson.repository'
import { ClassRepository } from '@/models/classes.repository'
import { StudentPrimaryIdentifier } from '@/models/enums'
import { InvoiceRepository } from '@/models/invoice.repository'
import { StudentLessonRepository } from '@/models/student-lesson.repository'
import { StudentScheduleRepository } from '@/models/student-schedule.repository'
import { UserAlias } from '@/models/user-aliases.entity'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { transformEmail, transformPhone } from '@/utils/string.utils'
import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { plainToInstance } from 'class-transformer'
import * as dayjs from 'dayjs'
import {
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  ILike,
  IsNull,
  Not,
  ObjectLiteral,
  QueryFailedError,
} from 'typeorm'

@Injectable()
export class UsersService extends BaseService<User> {
  constructor(
    private usersRepository: UsersRepository,
    private inviteMembersRepository: InviteMembersRepository,
    private userRolesService: UserRolesService,
    private sitesRepository: SitesRepository,
    private institutionsRepository: InstitutionsRepository,
    private readonly userRolesRepository: UserRolesRepository,
    private readonly userAliasesRepository: UserAliasesRepository,
    private readonly classLessonRepository: ClassLessonRepository,
    private readonly studentLessonRepository: StudentLessonRepository,
    private readonly invoiceRepository: InvoiceRepository,
    private readonly classRepository: ClassRepository,
    private readonly studentScheduleRepository: StudentScheduleRepository
  ) {
    super(usersRepository)
  }

  async findAll(
    pageOptionsDto: UserPageOptionDto,
    currentUser?: User,
    withCurrentUser = true
  ): Promise<UserPageDto | User[]> {
    // implementation for pagination
    const whereCondition: FindOptionsWhere<User> = {}
    if (pageOptionsDto.email) {
      whereCondition.email = ILike(`%${pageOptionsDto.email}%`)
    }
    if (!withCurrentUser) {
      whereCondition.id = Not(currentUser.id)
    }
    if (pageOptionsDto.firstName) {
      whereCondition.firstName = ILike(`%${pageOptionsDto.firstName}%`)
    }
    if (pageOptionsDto.lastName) {
      whereCondition.lastName = ILike(`%${pageOptionsDto.lastName}%`)
    }
    const orderOption: FindOptionsOrder<User> = {}
    if (pageOptionsDto.orderBy) {
      orderOption[pageOptionsDto.orderBy] = pageOptionsDto.order
    }

    const relations: FindOptionsRelations<User> = {
      userRoles: true,
    }
    // Fetch only user role that is not student
    const userRoleWhereOptions: FindOptionsWhere<UserRole>[] = []
    const roleConditions = [
      { isInstructor: true },
      { isInstitutionManager: true },
      { isSiteManager: true },
      { isOperator: true },
    ]
    for (const roleCond of roleConditions) {
      const cond: FindOptionsWhere<UserRole> = { ...roleCond }
      if (pageOptionsDto.siteId) {
        cond.siteId = +pageOptionsDto.siteId
      }
      if (pageOptionsDto.institutionId) {
        cond.institutionId = +pageOptionsDto.institutionId
      }
      userRoleWhereOptions.push(cond)
    }

    if (userRoleWhereOptions.length > 0) {
      whereCondition.userRoles = userRoleWhereOptions
    }

    return this.usersRepository.paginationWithTransform(
      pageOptionsDto,
      UserDetailDto,
      whereCondition,
      orderOption,
      relations
    )
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id })
    if (!user) {
      throw new BadRequestException(UserErrorMessage.USER_NOT_FOUND)
    }

    if (user.deletedAt) {
      throw new BadRequestException(UserErrorMessage.USER_NOT_FOUND)
    }

    return user
  }

  async updateUserProfile(id: number, institutionId: number, updateUserDto: UpdateUserProfileDto) {
    const user = await this.usersRepository.findOneBy({ id })
    if (!user) {
      throw new BadRequestException(UserErrorMessage.USER_NOT_FOUND)
    }

    const { user: userData, permissions } = updateUserDto

    const userRole = await this.userRolesRepository.findOne({
      where: {
        userId: id,
        institutionId,
      },
    })

    if (!userRole) {
      throw new BadRequestException(UserErrorMessage.USER_NOT_FOUND)
    }

    if (userRole.isStudent) {
      const userAlias = await this.userAliasesRepository.findOne({
        where: {
          userId: id,
          institutionId,
        },
      })

      if (!userAlias) {
        throw new BadRequestException(StudentErrorMessage.STUDENT_NOT_FOUND)
      }

      await this.userAliasesRepository.update(userAlias.id, {
        name: userData.firstName,
        email: userData.email,
      })
    }

    const userInstance = plainToInstance(User, { ...user, ...userData })
    const userUpdated = await this.usersRepository.save(userInstance)
    return plainToInstance(UserDetailDto, userUpdated)
  }

  async updatePermission(id: number, updateUserDto: UpdateUserPermissionDto) {
    const user = await this.usersRepository.findOneBy({ id })
    if (!user) {
      throw new BadRequestException(UserErrorMessage.USER_NOT_FOUND)
    }
    const { permissions } = updateUserDto

    // We need to ban instructors from updating his own permission
    for (const permission of permissions) {
      await this.userRolesService.create(permission)
    }
    const userRole = await this.userRolesRepository.findOne({
      where: {
        userId: id,
        siteId: permissions[0].siteId,
        institutionId: permissions[0].institutionId,
      },
      relations: {
        user: true,
      },
    })
    return userRole
  }

  async updatePasswordUser(id: number, updateUserDto: ChangeUserPasswordDto) {
    const user = await this.usersRepository.findOneBy({ id })
    return this.changePassword(user, updateUserDto, true)
  }

  async remove(id: number, CurrentUser: User, siteId: number): Promise<UserDetailDto> {
    const user = await this.usersRepository.findOneBy({ id })
    if (!user) {
      throw new BadRequestException(UserErrorMessage.USER_NOT_FOUND)
    }
    if (user.id === CurrentUser.id) {
      throw new BadRequestException(UserErrorMessage.CANNOT_DELETE_SELF)
    }
    await this.userRolesService.deleteBySiteAndUser(siteId, user.id)
    return plainToInstance(UserDetailDto, user)
  }

  async removeSelf(user: User, id: number): Promise<UserDetailDto> {
    const toBeDeletedUser = await this.usersRepository.findOneBy({ id })

    if (!user || user.id !== id) {
      throw new ForbiddenException(UserErrorMessage.NO_PERMISSION)
    }

    if (!toBeDeletedUser) {
      throw new BadRequestException(UserErrorMessage.USER_NOT_FOUND)
    }

    const toBeDeletedSite = await this.sitesRepository.findOneBy({
      siteAdmin: id,
    })

    if (toBeDeletedSite) {
      // One more condition: It should check if there are no more site managers left
      const remainingSiteManagers = await this.userRolesRepository.findAll({
        where: {
          siteId: toBeDeletedSite.id,
          isSiteManager: true,
          userId: Not(id),
        },
      })

      if (remainingSiteManagers.length > 0) {
        const newAdminId = remainingSiteManagers[0].userId

        await this.sitesRepository.update(
          { id: toBeDeletedSite.id },
          {
            siteAdmin: newAdminId,
          }
        )
      } else {
        const whereSiteDeleteObject: FindOptionsWhere<ObjectLiteral> = {
          id: toBeDeletedSite.id,
        }

        const whereSiteDeleteRelationObject: FindOptionsWhere<ObjectLiteral> = {
          siteId: toBeDeletedSite.id,
        }

        await softRemoveWithRelation(
          this.sitesRepository.manager,
          'Site',
          whereSiteDeleteObject,
          whereSiteDeleteRelationObject
        )
      }

      // Hard delete everything related to site
    }

    // Hard delete userAlias
    const whereDeleteUserAliasObject: FindOptionsWhere<ObjectLiteral> = {
      userId: id,
    }

    await this.userAliasesRepository.delete(whereDeleteUserAliasObject)

    // Hard delete user
    const whereDeleteObject: FindOptionsWhere<ObjectLiteral> = {
      id,
    }

    const whereDeleteRelationObject: FindOptionsWhere<ObjectLiteral> = {
      siteAdmin: id,
    }

    const userRemoved = await softRemoveWithRelation(
      this.usersRepository.manager,
      'User',
      whereDeleteObject,
      whereDeleteRelationObject
    )

    return plainToInstance(UserDetailDto, userRemoved)
  }

  // @Deprecated
  async create(createAccountDto: CreateUserDto): Promise<User> {
    createAccountDto.password = await bcrypt.hash(createAccountDto.password, 12)

    const userInDb = await this.usersRepository.findOneBy({
      phone: ILike(transformPhone(createAccountDto.phone)),
    })

    if (userInDb) {
      throw new BadRequestException(UserErrorMessage.USER_ALREADY_EXISTS)
    }

    return await this.usersRepository.save(this.usersRepository.create(createAccountDto))
  }

  async createAccount(registerAccountDto: BaseRegisterDto, passExistCheck = false): Promise<User> {
    console.log('[DEBUG] createAccount received:', registerAccountDto)

    // ✅ Validate firstName dengan null check yang proper
    if (
      !registerAccountDto.firstName ||
      typeof registerAccountDto.firstName !== 'string' ||
      registerAccountDto.firstName.trim() === ''
    ) {
      console.log('[DEBUG] firstName is invalid, setting default value')
      registerAccountDto.firstName = 'Imported User'
    } else {
      registerAccountDto.firstName = registerAccountDto.firstName.trim()
    }

    // ✅ Validate email
    if (!registerAccountDto.email || typeof registerAccountDto.email !== 'string') {
      registerAccountDto.email = ''
    }

    // ✅ Validate phone
    if (!registerAccountDto.phone || typeof registerAccountDto.phone !== 'string') {
      registerAccountDto.phone = ''
    }

    console.log('[DEBUG] Validated registerAccountDto:', {
      firstName: registerAccountDto.firstName,
      email: registerAccountDto.email,
      phone: registerAccountDto.phone,
    })

    registerAccountDto.password = await bcrypt.hash(registerAccountDto.password, 12)

    const userInDb = await this.usersRepository.findOneBy({
      phone: ILike(transformPhone(registerAccountDto.phone)),
    })

    const isSameName =
      userInDb?.firstName?.trim().toLowerCase() ===
      registerAccountDto.firstName.trim().toLowerCase()

    // If passExistCheck is true, the function will not check if the user exists
    // This happens when the existing user is invited to register and become a member of some site
    if (!passExistCheck && userInDb && isSameName) {
      throw new BadRequestException(UserErrorMessage.USER_ALREADY_EXISTS)
    }
    if (passExistCheck && userInDb) {
      return userInDb
    }

    if (userInDb && !isSameName) {
      const listUser = await this.usersRepository.find({
        where: {
          email: ILike(transformEmail(registerAccountDto.email)),
          phone: ILike(transformPhone(registerAccountDto.phone)),
        },
      })

      const sameName = listUser.find(
        (user) =>
          user.firstName.trim().toLowerCase() === registerAccountDto.firstName.trim().toLowerCase()
      )

      if (sameName) return sameName

      let emailPrefix = userInDb.email.split('@')[0]
      if (emailPrefix.includes('+')) {
        emailPrefix = emailPrefix.split('+')[0]
      }

      const emailDomain = userInDb.email.split('@')[1]
      let increment = 1
      let newEmail = `${emailPrefix}+${increment}@${emailDomain}`

      while (await this.findOneByEmail(newEmail)) {
        increment += 1
        newEmail = `${emailPrefix}+${increment}@${emailDomain}`
      }

      registerAccountDto.email = newEmail
    }

    try {
      return await this.usersRepository.save(this.usersRepository.create(registerAccountDto))
    } catch (err) {
      if (err instanceof QueryFailedError && (err as any).code === '23505') {
        const existing = await this.usersRepository.findOneBy({
          phone: ILike(transformPhone(registerAccountDto.phone)),
        })
        if (existing) return existing
      }
      throw err
    }
  }

  async createStudentRelatedEntitiesWithExistingUser(
    registerDto: {
      firstName: string
      email: string
      phone: string
    },
    baseUserToBeCreatedUserRole: User,
    studentPrimaryIdentifier: StudentPrimaryIdentifier,
    institutionId: number,
    siteId: number
  ): Promise<User> {
    if (
      !baseUserToBeCreatedUserRole ||
      !(await this.usersRepository.findOneBy({ id: baseUserToBeCreatedUserRole.id }))
    ) {
      throw new BadRequestException('User not found')
    }

    await this.userAliasesRepository.manager.transaction(async (transactionalEntityManager) => {
      const studentRole = await transactionalEntityManager.findOne(UserRole, {
        where: {
          userId: baseUserToBeCreatedUserRole.id,
          institutionId,
        },
      })

      if (!studentRole) {
        await transactionalEntityManager.save(UserRole, {
          userId: baseUserToBeCreatedUserRole.id,
          institutionId,
          siteId,
          isStudent: true,
          isInstructor: false,
          isInstitutionManager: false,
          isSiteManager: false,
          isOperator: false,
          isMasterAdmin: false,
        })
      } else if (!studentRole.isStudent) {
        await transactionalEntityManager.update(
          UserRole,
          {
            id: studentRole.id,
          },
          {
            isStudent: true,
          }
        )
      }

      let studentAlias: UserAlias | null = null
      studentAlias = await transactionalEntityManager.findOne(UserAlias, {
        where: {
          userId: baseUserToBeCreatedUserRole.id,
          institutionId,
          name: ILike(registerDto.firstName),
        },
      })

      if (!studentAlias) {
        const aliasPassword = await bcrypt.hash(registerDto.phone, 12)
        const studentParentAlias = await transactionalEntityManager.findOne(UserAlias, {
          where: {
            userId: baseUserToBeCreatedUserRole.id,
            institutionId,
          },
        })

        const parentAliasId: number | null = null

        // If student parent alias exists, we need to update it
        // But if studentParentAlias is child of another alias, we don't update it
        // if (studentParentAlias && !studentParentAlias.childOfUserAliasId) {
        // studentParentAlias.isStudentParent = true // Ensure parent is set as student parent
        // update parent alias to ensure it is set as student parent
        // await transactionalEntityManager.save(UserAlias, studentParentAlias)
        // parentAliasId = studentParentAlias.id
        // } else if (studentParentAlias) {
        // parentAliasId = studentParentAlias.childOfUserAliasId
        // }

        await transactionalEntityManager.save(UserAlias, {
          userId: baseUserToBeCreatedUserRole.id,
          refUserId: baseUserToBeCreatedUserRole.id,
          institutionId,
          name: registerDto.firstName,
          email: registerDto.email,
          childOfUserAliasId: parentAliasId,
          aliasPassword,
          // phone: params.phone,
        })
      }
    })

    return baseUserToBeCreatedUserRole
  }

  async createStudentAccount(
    registerDto: StudentRegisterDto,
    institutionId: number,
    siteId: number
  ): Promise<User> {
    const institution = await this.institutionsRepository.findOneBy({ id: institutionId })
    if (!institution) {
      throw new BadRequestException('Institution not found')
    }

    const normalizedPhone = transformPhone(registerDto.phone)

    let baseUserToBeCreatedUserRole: User

    if (!registerDto.phone) {
      throw new BadRequestException('Phone number is required for students')
    }

    const existingStudentByPhone = await this.findUserByPhoneAndRestoreIfDeleted(normalizedPhone)
    baseUserToBeCreatedUserRole = existingStudentByPhone
    // // Occasion 1: Student primary identifier is phone
    // try {
    //   if (!existingStudentByPhone) {
    //     if (institution.studentPrimaryIdentifier === StudentPrimaryIdentifier.PHONE) {
    //       const existingStudentByPhoneAndName = await this.findUserByPhoneAndNameInInstitution(
    //         normalizedPhone,
    //         normalizedFirstName,
    //         institutionId
    //       )
    //       if (existingStudentByPhoneAndName) {
    //         baseUserToBeCreatedUserRole = existingStudentByPhoneAndName.user
    //       }
    //     } else {
    //       const existingStudentByPhoneAndEmail = await this.findUserByPhoneAndEmailInInstitution(
    //         normalizedPhone,
    //         registerDto.email,
    //         institutionId
    //       )
    //       if (existingStudentByPhoneAndEmail) {
    //         baseUserToBeCreatedUserRole = existingStudentByPhoneAndEmail.user
    //       }
    //     }

    //     // Continue if this may be a new account
    //   }
    // } catch (error) {
    //   console.log('ERROR', error)
    //   throw new InternalServerErrorException(StudentErrorMessage.STUDENT_NOT_FOUND)
    // }

    // if no email provided, generate an internal email
    // if (!registerDto.email) {
    //   registerDto.email = await this.generateInternalEmail(registerDto.phone, institutionId)
    // }

    registerDto.password = await bcrypt.hash(registerDto.password, 12)

    // Logic part 2: If user already exists, we need to add an user alias. By this point, user with same name and identifier should have been filtered out
    // If base user exists, we only need to create the user role

    if (!baseUserToBeCreatedUserRole) {
      baseUserToBeCreatedUserRole = await this.usersRepository.save(
        this.usersRepository.create(registerDto)
      )
    }

    await this.createStudentRelatedEntitiesWithExistingUser(
      {
        firstName: registerDto.firstName,
        email: registerDto.email,
        phone: registerDto.phone,
      },
      baseUserToBeCreatedUserRole,
      institution.studentPrimaryIdentifier,
      institutionId,
      siteId
    )

    return baseUserToBeCreatedUserRole
  }

  async findUserByStudentPrimaryIdentifier({
    email,
    phone,
    firstName,
    institutionId,
  }: {
    email?: string
    phone?: string
    firstName: string
    institutionId: number
  }): Promise<{
    user: User
    userAlias?: UserAlias | null
  } | null> {
    const institution = await this.institutionsRepository.findOneBy({ id: institutionId })
    if (!institution) {
      return null
    }

    if (institution.studentPrimaryIdentifier === StudentPrimaryIdentifier.PHONE) {
      return this.findUserByPhoneAndNameInInstitution(phone, firstName, institutionId)
    }

    return this.findUserByPhoneAndEmailInInstitution(phone, email, institutionId)
  }

  async findUserByStudentPrimaryIdentifierWithDeleted({
    email,
    phone,
    firstName,
    institutionId,
  }: {
    email: string
    phone: string
    firstName: string
    institutionId: number
  }): Promise<User | null> {
    // This function will restore the deleted user account if it exists
    const institution = await this.institutionsRepository.findOneBy({ id: institutionId })
    if (!institution) {
      return null
    }

    if (institution.studentPrimaryIdentifier === StudentPrimaryIdentifier.PHONE) {
      const userData = await this.findUserByPhoneAndNameInInstitution(
        phone,
        firstName,
        institutionId
      )
      if (userData?.user) {
        return userData.user
      }

      const userWithDeleted = await this.findUserByPhoneAndRestoreIfDeleted(phone)

      if (userWithDeleted) {
        await this.usersRepository.restore(userWithDeleted.id)
        return userWithDeleted
      }

      return null
    }

    const userData = await this.findUserByPhoneAndEmailInInstitution(phone, email, institutionId)
    if (userData?.user) {
      return userData.user
    }

    return null
  }

  private async findUserByPhoneAndEmailInInstitution(
    phone: string,
    email: string,
    institutionId: number
  ): Promise<{ user: User; userAlias: UserAlias | null } | null> {
    if (!email || !phone) {
      return null
    }

    const normalizedPhone = transformPhone(phone)

    // Try with original email case first (exact match)
    let studentAlias = await this.userAliasesRepository.findOne({
      where: {
        institutionId,
        user: {
          phone: normalizedPhone,
        },
        email: email.trim(),
      },
      relations: {
        user: true,
        parentUserAlias: {
          user: true,
        },
      },
    })

    // If not found, try with lowercase email (case-insensitive)
    if (!studentAlias) {
      const normalizedEmail = transformEmail(email)
      studentAlias = await this.userAliasesRepository.findOne({
        where: {
          institutionId,
          user: {
            phone: normalizedPhone,
          },
          email: ILike(normalizedEmail),
        },
        relations: {
          user: true,
          parentUserAlias: {
            user: true,
          },
        },
      })
    }

    if (studentAlias) {
      return { user: studentAlias.user, userAlias: studentAlias }
    }

    return null
  }

  private async findUserByPhoneAndRestoreIfDeleted(phone: string): Promise<User | null> {
    const userWithoutDeleted = await this.usersRepository.findOne({
      where: {
        phone: transformPhone(phone),
      },
      withDeleted: true,
    })

    if (userWithoutDeleted) {
      if (userWithoutDeleted.deletedAt) {
        await this.usersRepository.restore(userWithoutDeleted.id)
      }

      return userWithoutDeleted
    }

    return null
  }

  private async findUserByPhone(phone: string): Promise<User | null> {
    const userWithoutDeleted = await this.usersRepository.findOne({
      where: {
        phone: transformPhone(phone),
      },
    })

    if (userWithoutDeleted) {
      return userWithoutDeleted
    }

    return null
  }

  private async findUserByPhoneAndNameInInstitution(
    phone: string,
    firstName: string,
    institutionId: number
  ): Promise<{
    user: User
    userAlias: UserAlias | null
  } | null> {
    const normalizedFirstName = firstName?.trim()

    if (!normalizedFirstName || !phone) {
      return null
    }

    // Try with original case first
    let studentAlias = await this.userAliasesRepository.findOne({
      where: {
        institutionId,
        user: {
          phone: transformPhone(phone),
        },
        name: normalizedFirstName,
      },
      relations: {
        user: true,
        parentUserAlias: {
          user: true,
        },
      },
    })

    // If not found, try with lowercase
    if (!studentAlias) {
      studentAlias = await this.userAliasesRepository.findOne({
        where: {
          institutionId,
          user: {
            phone: transformPhone(phone),
          },
          name: ILike(normalizedFirstName.toLowerCase()),
        },
        relations: {
          user: true,
          parentUserAlias: {
            user: true,
          },
        },
      })
    }

    if (studentAlias) {
      return {
        user: studentAlias.user,
        userAlias: studentAlias,
      }
    }

    return {
      user: null,
      userAlias: null,
    }
  }

  async generateAlternativeEmail(originalEmail: string): Promise<string> {
    let emailPrefix = originalEmail.split('@')[0]
    if (emailPrefix.includes('+')) {
      emailPrefix = emailPrefix.split('+')[0]
    }

    const emailDomain = originalEmail.split('@')[1]
    let increment = 1
    let newEmail = `${emailPrefix}+${increment}@${emailDomain}`

    while (await this.findOneByEmail(newEmail)) {
      increment += 1
      newEmail = `${emailPrefix}+${increment}@${emailDomain}`
    }

    return newEmail
  }

  async generateInternalEmail(phone: string, institutionId: number): Promise<string> {
    const cleanPhone = phone.replace(/[+\s-]/g, '')
    let baseEmail = `student_${cleanPhone}_${institutionId}@internal.flowclass.io`

    const existingUser = await this.findOneByEmail(baseEmail)
    if (existingUser) {
      baseEmail = `student_${cleanPhone}_${institutionId}_${Date.now()}@internal.flowclass.io`
    }

    return baseEmail
  }

  async changeProfile(user, changeProfileDto: ChangeProfileDto) {
    if (!user) {
      throw new BadRequestException(UserErrorMessage.USER_NOT_FOUND)
    }
    await this.userAliasesRepository.update(
      { userId: user.id },
      { name: changeProfileDto.firstName }
    )
    return await this.usersRepository.save({ ...user, ...changeProfileDto })
  }

  async changePassword(
    user,
    changePasswordDto: ChangePasswordDto | ChangeUserPasswordDto,
    skipCheckOld = false
  ) {
    // Some times we need to change password without checking the old password
    // Example: When Master Admin change password for a user
    if (!user) {
      throw new BadRequestException(UserErrorMessage.USER_NOT_FOUND)
    }

    if (!skipCheckOld) {
      const oldPassword =
        'password' in changePasswordDto ? (changePasswordDto as ChangePasswordDto).password : null

      const isPasswordMatching = await bcrypt.compare(oldPassword, user.password)
      if (!isPasswordMatching) {
        throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST)
      }
    }
    const strongPasswordRegex = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).{8,20}$/
    if (!changePasswordDto.newPassword.match(strongPasswordRegex)) {
      throw new HttpException(
        'Please enter between 8 - 20 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 special character and 1 number',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }

    const newPassword = await bcrypt.hash(changePasswordDto.newPassword, 12)
    user.password = newPassword

    await this.usersRepository.save(user)
    return true
  }

  async forgotPassword(user: User, password: string) {
    user.password = password
    await this.usersRepository.save(user)
    return true
  }

  async findOneByEmail(email: string): Promise<User> {
    const retrievedUsers = await this.usersRepository.find({
      where: {
        email: ILike(transformEmail(email)),
      },
      order: {
        updatedAt: 'DESC',
      },
    })

    if (retrievedUsers && retrievedUsers.length > 0) {
      return retrievedUsers[0]
    }

    return null
  }

  async findOneBy(where: FindOptionsWhere<User> | FindOptionsWhere<User>[]): Promise<User> {
    return this.usersRepository.findOneBy(where)
  }

  async getInvitation(email: string) {
    return await this.inviteMembersRepository.findAll({
      where: {
        email,
        status: InviteSiteMemberStatus.INVITING,
      },
    })
  }

  async getInvitationByToken(token: string): Promise<InviteUserResponse> {
    const inviteSiteMember = await this.inviteMembersRepository.findOneBy({
      token,
      status: InviteSiteMemberStatus.INVITING,
    })

    if (!inviteSiteMember) {
      throw new BadRequestException(UserErrorMessage.USER_INVITE_NOT_FOUND)
    }

    const isExistingUser = await this.userRolesRepository.findOneBy({
      institutionId: inviteSiteMember.institutionId,
      user: {
        email: inviteSiteMember.email,
      },
    })

    return { ...inviteSiteMember, isExistingUser: !!isExistingUser }
  }

  async detailWithPermission(user: User): Promise<UserRoleResponse> {
    const userRoles = await user.userRoles

    const data: UserRoleResponse = {
      ...plainToInstance(UserDetailDto, user),
      permissions: [],
    }

    data.permissions = permissionsOfUser(userRoles)

    return data
  }

  async createUser(user: User): Promise<User> {
    return this.usersRepository.save(user)
  }

  async saveLastLogin(user: User) {
    return await this.usersRepository.update(user.id, {
      lastActiveTime: dayjs(),
    })
  }

  async findUserByUserIdAndInstitutionId(userId: number, institutionId: number): Promise<UserRole> {
    return await this.userRolesRepository.findOne({
      where: {
        userId,
        institutionId,
      },
      relations: {
        user: true,
        instructorProfile: true,
      },
    })
  }

  async getUserSitesAndInstitutions(
    userId: number
  ): Promise<{ sites: Site[]; institutions: Institution[] }> {
    const sites = await this.sitesRepository
      .createQueryBuilder('site')
      .innerJoin(UserRole, 'userRole', 'site.id=userRole.site_id')
      .where('userRole.user_id = :userId', { userId })
      .getMany()

    const institutions = await this.institutionsRepository
      .createQueryBuilder('inst')
      .innerJoin(UserRole, 'userRole', 'inst.id=userRole.institution_id')
      .where('userRole.user_id = :userId', { userId })
      .getMany()

    return { sites, institutions } as any
  }

  async isNewStudent({
    email,
    phone,
    siteId,
  }: {
    email: string
    phone: string
    siteId: number
  }): Promise<boolean> {
    const userExist = await this.usersRepository.findOneBy({
      email,
      phone,
    })

    if (!userExist) return true

    const userRole = await this.userRolesService.findOneBySiteAndUser(siteId, userExist.id)
    return !userRole
  }

  async getUserOwnerOfInstitution(institutionId: number) {
    const userRoleWithInstitutionManager = await this.userRolesRepository.findOne({
      where: {
        institutionId,
        isInstitutionManager: true,
        user: {
          id: Not(IsNull()),
        },
      },
      relations: {
        user: true,
      },
    })

    if (!userRoleWithInstitutionManager) {
      const userRoleWithSiteManager = await this.userRolesRepository.findOne({
        where: {
          institutionId,
          isSiteManager: true,
          user: {
            id: Not(IsNull()),
          },
        },
        relations: {
          user: true,
        },
      })

      if (userRoleWithSiteManager) {
        return userRoleWithSiteManager.user
      }
    }

    return userRoleWithInstitutionManager?.user
  }

  async changeAliasPassword(changeAliasPasswordDto: ChangeAliasPasswordDto): Promise<boolean> {
    // Find the user alias with relations to get more context
    const userAlias = await this.userAliasesRepository.findOne({
      where: { id: changeAliasPasswordDto.userAliasId },
      relations: ['user', 'institution'],
    })

    if (!userAlias) {
      throw new BadRequestException('User alias not found')
    }

    // Validate password strength (same as regular password change)
    const strongPasswordRegex = /^(?![.\n]).{8,20}$/
    if (!changeAliasPasswordDto.newAliasPassword.match(strongPasswordRegex)) {
      throw new HttpException(
        'Please enter between 8 - 20 characters,cannot start with a dot or new line',
        HttpStatus.UNPROCESSABLE_ENTITY
      )
    }

    // Hash the new alias password using bcrypt
    const hashedAliasPassword = await bcrypt.hash(changeAliasPasswordDto.newAliasPassword, 12)

    // Update the user alias with the new hashed password
    userAlias.aliasPassword = hashedAliasPassword

    await this.userAliasesRepository.save(userAlias)

    return true
  }
}
