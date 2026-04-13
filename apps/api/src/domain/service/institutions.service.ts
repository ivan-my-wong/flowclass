import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common'
import { instanceToPlain, plainToInstance } from 'class-transformer'
import * as crypto from 'crypto'
import { pick } from 'lodash'
import * as path from 'path'
import { FindOptionsOrder, FindOptionsWhere, ILike, In, ObjectLiteral } from 'typeorm'
import { Transactional } from 'typeorm-transactional'

import { CopyInstitutionDto } from '@/application/admin/institutions/dto/copy-institution.dto'
import {
  CreateInstitutionDto,
  InviteInstitutionMemberDto,
  UpdateInstitutionDto,
} from '@/application/admin/institutions/dto/institution.dto'
import {
  InstitutionDetailDto,
  PublicInstitutionDetailDto,
} from '@/application/admin/institutions/dto/institution-detail.dto'
import {
  InstitutionPageDtoContent,
  InstitutionPageOptionDto,
} from '@/application/admin/institutions/dto/institution-pagination.dto'
import { UpdateGalleryDto } from '@/application/admin/institutions/dto/update-gallery.dto'
import { UploadGalleryDto } from '@/application/admin/institutions/dto/upload-gallery.dto'
import { WorkflowDto } from '@/application/admin/institutions/dto/workflow.dto'
import { ApiError } from '@/common/api-formats/api-error'
import { PageDto } from '@/common/pagination/page.dto'
import { ErrorCode } from '@/exceptions/error-message/errors'
import { InstitutionErrorMessage } from '@/exceptions/error-message/institution'
import { NotFoundErrorMessage } from '@/exceptions/error-message/not-found'
import { SiteErrorMessage } from '@/exceptions/error-message/site'
import { UserErrorMessage } from '@/exceptions/error-message/user'
import { ClassRepository } from '@/models/classes.repository'
import { RecurringSchedulesRepository } from '@/models/course-recurring-schedules.entity'
import { RegularPeriodsRepository } from '@/models/course-regular-periods.entity'
import { LongDescription } from '@/models/courses.entity'
import { CoursesRepository } from '@/models/courses.repository'
import { RoleInInstitution } from '@/models/enums/'
import { InviteSiteMemberStatus } from '@/models/enums/status'
import { InstitutionGalleryRepository } from '@/models/institution-gallery.repository'
import { Institution, InstitutionWithSettingsDTO } from '@/models/institutions.entity'
import { InstitutionsRepository } from '@/models/institutions.repository'
import { InviteMembersRepository } from '@/models/invite-members.repository'
import { Media } from '@/models/media.entity'
import { MediaRepository } from '@/models/media.repository'
import { PeriodLessonsRepository } from '@/models/period-lessons.entity'
import { SettingNotificationsRepository } from '@/models/setting-notifications.entity'
import { SettingWebpageInstitutionRepository } from '@/models/setting-webpage-institutions.repository'
import { Site } from '@/models/site.entity'
import { SitesRepository } from '@/models/sites.repository'
import { User } from '@/models/user.entity'
import { UserAliasesRepository } from '@/models/user-aliases.repository'
import { UsersRepository } from '@/models/users.repository'
import { BaseService } from '@/modules/base/base.service'
import { MediaDetailDto } from '@/modules/media/dto/media.dto'
import { softRemoveWithRelation } from '@/utils/database.utils'
import { isMasterAdmin, isSiteManager } from '@/utils/user-roles.utils'

import { StripeConnectService } from '../external/stripe-connect.service'

import { CustomMessageService } from './custom-message.service'
import { UserRolesService } from './user-roles.service'
import { UsersService } from './users.service'

@Injectable()
export class InstitutionsService extends BaseService<Institution> {
  private readonly logger: Logger
  constructor(
    private institutionsRepository: InstitutionsRepository,
    private stripeConnectService: StripeConnectService,
    private usersService: UsersService,
    private inviteMembersRepository: InviteMembersRepository,
    private userRolesService: UserRolesService,
    private mediaRepository: MediaRepository,
    private sitesRepository: SitesRepository,
    private readonly institutionGalleryRepository: InstitutionGalleryRepository,
    private readonly settingWebpageInstitutionRepository: SettingWebpageInstitutionRepository,
    private readonly userRepository: UsersRepository,
    private readonly userAliasesRepository: UserAliasesRepository,
    private readonly courseRepository: CoursesRepository,
    private readonly classRepository: ClassRepository,
    private readonly recurringSchedulesRepository: RecurringSchedulesRepository,
    private readonly regularPeriodsRepository: RegularPeriodsRepository,
    private readonly periodLessonsRepository: PeriodLessonsRepository,
    private readonly settingNotificationsRepository: SettingNotificationsRepository,
    private readonly customMessageService: CustomMessageService
  ) {
    super(institutionsRepository)
    this.logger = new Logger(InstitutionsService.name)
  }

  @Transactional()
  async create(
    createInstitutionDto: CreateInstitutionDto,
    files: Array<Express.Multer.File>,
    user: User
  ): Promise<InstitutionDetailDto> {
    const institutionInstance = plainToInstance(Institution, createInstitutionDto)
    const institution = await this.institutionsRepository.save(institutionInstance)
    await this.stripeConnectService.createCustomerAccount(institutionInstance)
    const medias: Media[] = []

    if (files) {
      for (const file of files) {
        let media = this.mediaRepository.create({
          siteId: institution.siteId,
          institutionId: institution.id,
          fileName: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        })

        const name = path.parse(media.fileName).name
        const ext = path.parse(media.originalName).ext.replace('.', '')

        media = {
          ...media,
          url: `${process.env.API_BASE_URL}/media/get/${name}/${ext}`,
          type: 'Institution',
        }

        medias.push(media)
      }

      await this.mediaRepository.save(medias)
      await this.customMessageService.createDefaultTemplates(institution.id)
    }

    await this.userRolesService.create({
      siteId: institution.siteId,
      institutionId: institution.id,
      userId: user.id,
      isMasterAdmin: false,
      isSiteManager: true,
      isInstitutionManager: true,
      isInstructor: false,
      isOperator: false,
      isStudent: false,
    })

    const institutionWithSite = await this.institutionsRepository.findOne({
      where: { id: institution.id },
      relations: ['site'],
    })

    if (!institutionWithSite) {
      throw new Error('Failed to find institution after creation')
    }

    // ✅ Remove workflow creation logic from institution creation
    // This prevents multiple workflow creation for the same institution
    return {
      ...plainToInstance(InstitutionDetailDto, institutionInstance),
      medias,
    }
  }

  async findAll(filter: { siteId?: number }): Promise<Institution[]> {
    // implementation for pagination
    const whereCondition: FindOptionsWhere<Institution> = {}
    if (filter.siteId) {
      whereCondition.siteId = filter.siteId
    }

    const pageData = await this.institutionsRepository.find({
      where: whereCondition,
    })

    return pageData
  }

  async findAccessibleSchools(
    pageOptionsDto: InstitutionPageOptionDto,
    currentUser: User
  ): Promise<PageDto<InstitutionPageDtoContent>> {
    const userRoles = await currentUser.userRoles
    const isMasterAdmin = userRoles.some((role) => role.isMasterAdmin)

    const whereCondition: FindOptionsWhere<Institution> = {}
    if (pageOptionsDto.siteId) {
      whereCondition.siteId = pageOptionsDto.siteId
    }

    if (!isMasterAdmin) {
      const currentUserRoles = userRoles.filter((role) => role.siteId === pageOptionsDto.siteId)

      const listOfInstitutions = currentUserRoles
        .map((role) => role.institutionId)
        .filter((id) => id !== 0)

      if (currentUserRoles.length === 0) return

      if (listOfInstitutions.length > 0) {
        whereCondition.id = In(listOfInstitutions)
      }
    }

    const orderOption: FindOptionsOrder<Institution> = {}
    if (pageOptionsDto.orderBy) {
      orderOption[pageOptionsDto.orderBy] = pageOptionsDto.order
    }
    const pageData = await this.institutionsRepository.paginationWithTransform(
      pageOptionsDto,
      InstitutionDetailDto,
      whereCondition,
      orderOption
    )

    const site = await this.sitesRepository.findOneBy({
      id: pageOptionsDto.siteId,
    })

    const siteSetting = await site.siteSettings

    const newPageContent = pageData.content.map((x) => {
      return plainToInstance(InstitutionPageDtoContent, {
        ...instanceToPlain(x),
        siteSetting,
      })
    })

    return new PageDto(newPageContent, pageData.meta)
  }

  async findOne(id: number): Promise<InstitutionWithSettingsDTO> {
    const institution = await this.institutionsRepository.findOne({
      where: { id },
    })

    if (!institution) {
      throw new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
    }

    const site = await this.sitesRepository.findOneBy({
      id: institution.siteId,
    })

    const media = await this.mediaRepository.find({
      where: {
        institutionId: institution.id,
        type: 'Institution',
      },
    })

    const listMedia = mediaSerializer(media)

    const userAliases = await this.userAliasesRepository.find({
      where: {
        institutionId: institution.id,
      },
    })

    return {
      ...plainToInstance(InstitutionDetailDto, institution),
      siteSetting: await site.siteSettings,
      medias: listMedia,
      studentMemo: userAliases,
    }
  }

  async findOneByUrl(domain: string, url?: string) {
    const site =
      (await this.sitesRepository.findOneBy({ url: domain })) ??
      (await this.sitesRepository.findOne({ where: {}, order: { id: 'ASC' } }))

    if (!site) {
      throw new BadRequestException(SiteErrorMessage.SITE_NOT_FOUND)
    }

    let institution

    if (!url && site.defaultInstitutionId && site.defaultInstitutionId !== null) {
      institution = await this.institutionsRepository.findOneBy({
        id: site.defaultInstitutionId,
      })
    } else {
      const institutionList = await this.institutionsRepository.findBy({ siteId: site.id })

      if (!(typeof institutionList === 'object')) {
        throw new InternalServerErrorException(SiteErrorMessage.SITE_INSTITUTION_LIST_FORMAT_ERROR)
      }

      if (institutionList.length <= 0) {
        throw new InternalServerErrorException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
      }

      if (url && url !== '') {
        // Fall back to the first institution if the URL doesn't match any school
        institution = institutionList.find((school) => school.url === url) ?? institutionList[0]
      } else {
        // Return the default institution of the site by taking the first one that is created
        institution = institutionList[0]
      }
    }

    if (!institution) {
      throw new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
    }

    const institutionSetting = await this.settingWebpageInstitutionRepository.findOneBy({
      institutionId: institution.id,
    })

    const media = await this.mediaRepository.find({
      where: {
        institutionId: institution.id,
        type: 'Institution',
      },
    })

    const galleries = await this.institutionGalleryRepository.findBy({
      institutionId: institution.id,
    })

    const medias = mediaSerializer(media)

    return {
      ...plainToInstance(PublicInstitutionDetailDto, institution),
      siteSetting: await site.siteSettings,
      institutionSetting,
      medias,
      galleries,
    }
  }

  async update(
    id: number,
    updateInstitutionDto: UpdateInstitutionDto,
    files: Array<Express.Multer.File>
  ): Promise<InstitutionDetailDto> {
    const institution = await this.institutionsRepository.findOneBy({ id })
    if (!institution) {
      throw new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
    }

    const institutionInstance = plainToInstance(Institution, {
      ...institution,
      ...updateInstitutionDto,
    })
    const institutionUpdated = await this.institutionsRepository.save(institutionInstance)

    if (files) {
      const medias: Media[] = []

      for (const file of files) {
        let media = this.mediaRepository.create({
          siteId: institution.siteId,
          institutionId: institution.id,
          fileName: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
        })

        const name = path.parse(media.fileName).name
        const ext = path.parse(media.originalName).ext.replace('.', '')

        media = {
          ...media,
          url: `${process.env.API_BASE_URL}/media/get/${name}/${ext}`,
          type: 'Institution',
        }

        medias.push(media)
      }

      await this.mediaRepository.save(medias)
    }

    if (updateInstitutionDto.deleteFiles) {
      const deleteMedia = await this.mediaRepository.findBy({
        id: In(updateInstitutionDto.listFileDelete),
        institutionId: institution.id,
      })

      await this.mediaRepository.remove(deleteMedia)
    }

    const media = await this.mediaRepository.find({
      where: {
        institutionId: institution.id,
        type: 'Institution',
      },
    })

    const medias = mediaSerializer(media)

    const galleries = await this.institutionGalleryRepository.findBy({
      institutionId: institution.id,
    })

    return {
      ...plainToInstance(InstitutionDetailDto, institutionUpdated),
      galleries,
    }
  }

  async remove(id: number): Promise<InstitutionDetailDto> {
    const institution = await this.institutionsRepository.findOneBy({ id })
    if (!institution) {
      throw new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
    }

    const whereDeleteObject: FindOptionsWhere<ObjectLiteral> = {
      id,
    }

    const whereDeleteRelationObject: FindOptionsWhere<ObjectLiteral> = {
      institutionId: id,
    }

    await softRemoveWithRelation(
      this.institutionsRepository.manager,
      'Institution',
      whereDeleteObject,
      whereDeleteRelationObject
    )

    return plainToInstance(InstitutionDetailDto, institution)
  }

  async softRemove(institutions: Institution[]): Promise<Institution[]> {
    return this.institutionsRepository.softRemove(institutions)
  }

  async getIdBySite(siteId: number) {
    const institutions = await this.institutionsRepository.find({
      where: {
        siteId,
      },
      select: ['id'],
    })

    return institutions.map((institution) => institution.id)
  }

  async getBySites(sideId: any) {
    const institutions = await this.institutionsRepository.findBy({
      siteId: In(sideId),
    })

    return institutions.map((institution) => ({
      institutionId: institution.id,
      siteId: institution.siteId,
    }))
  }

  async findOneBy(
    where: FindOptionsWhere<Institution> | FindOptionsWhere<Institution>[]
  ): Promise<Institution | null> {
    return this.institutionsRepository.findOneBy(where)
  }

  async inviteInstitutionMember(
    dto: InviteInstitutionMemberDto,
    user: User,
    site: Site,
    institution: Institution
  ) {
    const siteId = site.id
    const institutionId = institution.id

    const RoleName = {
      'institution-manager': 'Institution Manager',
      instructor: 'Instructor',
      operator: 'Operator',
    }

    if (site.id != institution.siteId) {
      throw new BadRequestException(
        NotFoundErrorMessage.INSTITUTION_IN_SITE.replace('{#1}', institutionId.toString()).replace(
          '{#2}',
          siteId.toString()
        )
      )
    }

    const userInvite = await this.usersService.findOneByEmail(dto.email)

    if (!userInvite) {
      await this.createInviteSiteMember(dto, siteId, institutionId)
      return true
    }

    const userRoles = await userInvite.userRoles
    if (
      isMasterAdmin(userRoles) ||
      isSiteManager(userRoles, siteId) ||
      userInvite.email === user.email
    ) {
      throw new BadRequestException('Email invalid')
    }

    const changeRole = userRoles.filter(
      (user) => user.institutionId === institutionId && user.siteId === siteId
    )

    if (changeRole.length > 0) {
      await this.userRolesService.create({
        siteId,
        userId: userInvite.id,
        institutionId,
        isMasterAdmin: false,
        isSiteManager: false,
        isInstitutionManager: dto.role == RoleInInstitution.INSTITUTION_MANAGER,
        isInstructor: dto.role == RoleInInstitution.INSTRUCTOR,
        isOperator: dto.role == RoleInInstitution.OPERATOR,
        isStudent: false,
      })
      return true
    }

    await this.createInviteSiteMember(dto, siteId, institutionId)
    return true
  }

  async createInviteSiteMember(dto: InviteInstitutionMemberDto, siteId, institutionId) {
    let invite = await this.inviteMembersRepository.findByCondition({
      email: dto.email,
      siteId,
      institutionId,
    })

    if (!invite) {
      invite = await this.inviteMembersRepository.create({
        email: dto.email,
        siteId,
        institutionId,
      })
    }

    invite.token = crypto.randomBytes(20).toString('hex')
    invite.status = InviteSiteMemberStatus.INVITING
    invite.isSiteManager = false
    invite.isInstitutionManager = dto.role == RoleInInstitution.INSTITUTION_MANAGER
    invite.isInstructor = dto.role == RoleInInstitution.INSTRUCTOR
    invite.isOperator = dto.role == RoleInInstitution.OPERATOR

    return await this.inviteMembersRepository.save(invite)
  }

  async removeInstitutionMember(site: Site, institution: Institution, userId: number) {
    await this.userRolesService.deleteByInstitutionAndUser(institution.id, userId)
    return true
  }

  async uploadGallery(
    uploadGalleryDto: UploadGalleryDto,
    file: Express.Multer.File & { key: string },
    currentInstitution: Institution
  ) {
    const institutionGalleryInstance = this.institutionGalleryRepository.create({
      siteId: currentInstitution.siteId,
      institutionId: currentInstitution.id,
      caption: uploadGalleryDto.caption,
      // index: uploadGalleryDto.index,
      tags: uploadGalleryDto.tags,
      imageUrl: file.key,
    })
    const institutionGallery = await this.institutionGalleryRepository.save(
      institutionGalleryInstance
    )
    return institutionGallery
  }

  async updateGallery(updateGalleryDto: UpdateGalleryDto, currentInstitution: Institution) {
    const institutionGallery = await this.institutionGalleryRepository.findOneById(
      updateGalleryDto.id
    )
    if (!institutionGallery) {
      throw new BadRequestException(InstitutionErrorMessage.GALLERY_NOT_FOUND)
    }
    institutionGallery.caption = updateGalleryDto.caption
    institutionGallery.tags = updateGalleryDto.tags

    return await this.institutionGalleryRepository.save(institutionGallery)
  }

  async removeGallery(id: number) {
    const image = await this.institutionGalleryRepository.findOneBy({ id })
    if (!image) {
      throw new BadRequestException(InstitutionErrorMessage.GALLERY_NOT_FOUND)
    }
    await this.institutionGalleryRepository.softDelete(id)
    return image
  }

  parseJSONData(dto: UpdateInstitutionDto | CreateInstitutionDto) {
    if (dto.description) {
      let descriptions: LongDescription[] = null
      try {
        descriptions = JSON.parse(JSON.stringify(dto.description).replace(/\\r\\n/g, ''))

        if (!(descriptions instanceof Array)) {
          throw new BadRequestException(`JSON_FORMAT_ERROR: description.items must be a json array`)
        }
        for (let i = 0; i < descriptions.length; i++) {
          const element = descriptions[i]
          if (!(typeof element === 'object')) {
            throw new BadRequestException(
              `JSON_FORMAT_ERROR: description: element ${i} is not a valid object`
            )
          }
          if (!element.content) {
            throw new BadRequestException(
              `JSON_FORMAT_ERROR: description[${i}] must contains "content" with string value. Found: [${Object.keys(
                element
              ).join(', ')}]`
            )
          }
          if (!element.sectionTitle) {
            throw new BadRequestException(
              `JSON_FORMAT_ERROR: description[${i}] must contains "sectionTitle" with string value. Found: [${Object.keys(
                element
              ).join(', ')}]`
            )
          }
        }
      } catch (e) {
        throw new BadRequestException('JSON_FORMAT_ERROR: description:' + e.message)
      }
      dto.description = descriptions
    }
    if (dto.address) {
      try {
        dto.address = JSON.parse(JSON.stringify(dto.address).replace(/\\r\\n/g, ''))
      } catch (e) {
        throw new BadRequestException('JSON_FORMAT_ERROR: address:' + e.message)
      }
    }
  }

  async getListCourseAndStudent(id: number) {
    const institutionExist = await this.institutionsRepository.findOneBy({
      id,
      deletedAt: null,
    })
    if (!institutionExist) throw new ApiError(ErrorCode.INSTITUTION_NOT_FOUND)

    const [listStudent, listCourse] = await Promise.all([
      this.getListStudent(id),
      this.getListCourse(id),
    ])
    return {
      listStudent,
      listCourse,
    }
  }

  async getListStudent(
    institutionId: number,
    params?: { limit: string; page: string; search: string }
  ) {
    const { limit, page, search } = params || {}
    const usersResult = await this.userRepository.find({
      where: {
        userRoles: {
          institutionId,
          isStudent: true,
        },
        deletedAt: null,
        ...(search ? { firstName: ILike(`%${search}%`) } : {}),
      },
      relations: {
        userRoles: true,
      },
      select: ['id', 'firstName', 'lastName', 'email', 'phone'],
      take: limit ? Number(limit) : undefined,
      skip: page ? (Number(page) - 1) * (limit ? Number(limit) : 10) : undefined,
    })

    const users = await Promise.all(
      usersResult.map(async (user) => {
        const userRoles = await user.userRoles
        return {
          ...user,
          checked: false,
          userRoles,
        }
      })
    )
    return users
  }

  async getListCourse(institutionId: number) {
    const listCourse = await this.courseRepository.find({
      where: {
        institutionId,
        deletedAt: null,
      },
      relations: {
        classes: {
          recurringFormat: true,
          studentSchedules: true,
          classLessons: true,
          recurringSchedules: true,
          regularPeriods: {
            lessons: true,
          },
        },
      },
      select: ['id', 'name', 'previewImageUrl', 'previewVideoUrl'],
    })
    const finalResult = listCourse.map((item) => ({
      ...pick(item, ['id', 'name', 'type', 'previewImageUrl', 'previewVideoUrl']),
      checked: false,
      classes: item.classes.map((item) => {
        return {
          ...item,
          checked: false,
        }
      }),
    }))

    return finalResult
  }

  async getDemoSchool(email: string) {
    return await this.institutionsRepository.find({ where: { email } })
  }

  async copyInstitution({ email, institutionId }: CopyInstitutionDto) {
    const institution = await this.institutionsRepository.findOneBy({ id: institutionId })
    if (!institution) {
      throw new BadRequestException(InstitutionErrorMessage.INSTITUTION_NOT_FOUND)
    }

    const user = await this.usersService.findOneByEmail(email)
    if (!user) {
      throw new BadRequestException(UserErrorMessage.USER_NOT_FOUND)
    }

    const site = await this.sitesRepository.findOneBy({ email })
    if (!site) {
      throw new BadRequestException(SiteErrorMessage.SITE_NOT_FOUND)
    }

    const newInstitution = await this.institutionsRepository.save({
      ...institution,
      siteId: site.id,
      email: user.email,
      phone: user.phone,
      name: `${institution.name} - Copy`,
      id: undefined,
    })

    await this.sitesRepository.save({ ...site, defaultInstitutionId: newInstitution.id })

    const courses = await this.courseRepository.find({
      where: { institutionId },
    })

    const courseIds = courses.map((course) => course.id)
    const classes = await this.classRepository.find({
      where: { courseId: In(courseIds) },
    })
    const classesIds = classes.map((cls) => cls.id)
    const recurringSchedules = await this.recurringSchedulesRepository.find({
      where: { classId: In(classesIds) },
    })
    const regularPeriods = await this.regularPeriodsRepository.find({
      where: { classId: In(classesIds) },
    })
    const periodLessons = await this.periodLessonsRepository.find({
      where: { classId: In(classesIds) },
    })

    for (const course of courses) {
      const newCourse = await this.courseRepository.save({
        ...course,
        institutionId: newInstitution.id,
        siteId: site.id,
        id: undefined,
      })

      const newClasses = classes.filter((cls) => cls.courseId === course.id)
      for (const cls of newClasses) {
        const newClass = await this.classRepository.save({
          ...cls,
          courseId: newCourse.id,
          siteId: site.id,
          institutionId: newInstitution.id,
          id: undefined,
        })

        const newRecurringSchedules = recurringSchedules.filter(
          (recurringSchedule) => recurringSchedule.classId === cls.id
        )
        for (const recurringSchedule of newRecurringSchedules) {
          await this.recurringSchedulesRepository.save({
            ...recurringSchedule,
            classId: newClass.id,
            id: undefined,
          })
        }

        const newRegularPeriods = regularPeriods.filter(
          (regularPeriod) => regularPeriod.classId === cls.id
        )
        for (const regularPeriod of newRegularPeriods) {
          const newRegularPeriod = await this.regularPeriodsRepository.save({
            ...regularPeriod,
            classId: newClass.id,
            courseId: newCourse.id,
            siteId: site.id,
            institutionId: newInstitution.id,
            id: undefined,
          })

          const newPeriodLessons = periodLessons.filter(
            (periodLesson) => periodLesson.periodId === regularPeriod.id
          )
          for (const lesson of newPeriodLessons) {
            await this.periodLessonsRepository.save({
              ...lesson,
              periodId: newRegularPeriod.id,
              classId: newClass.id,
              id: undefined,
            })
          }
        }
      }
    }

    // Add the list of courses to the course order
    await this.institutionsRepository.update(newInstitution.id, {
      courseOrder: courseIds,
    })

    const settingNotifications = await this.settingNotificationsRepository.findOneBy({
      institutionId,
    })
    if (settingNotifications) {
      await this.settingNotificationsRepository.save({
        ...settingNotifications,
        institutionId: newInstitution.id,
        siteId: site.id,
        id: undefined,
      })
    }

    await this.userRolesService.create({
      siteId: site.id,
      institutionId: newInstitution.id,
      userId: user.id,
      isMasterAdmin: false,
      isSiteManager: true,
      isInstitutionManager: true,
      isInstructor: false,
      isOperator: false,
      isStudent: false,
    })
    return [newInstitution]
  }

  async getWorkflow(_institutionId: number) {
    throw new BadRequestException('Automation workflow is disabled')
  }

  async updateWorkflow(_institutionId: number, _payload: WorkflowDto) {
    throw new BadRequestException('Automation workflow is disabled')
  }
}

export const mediaSerializer = (medias: Media[]): MediaDetailDto[] => {
  const data: MediaDetailDto[] = []
  medias.forEach((media) => {
    const mediaDto: MediaDetailDto = {
      id: media.id,
      siteId: media.siteId,
      institutionId: media.institutionId,
      fileName: media.fileName,
      originalName: media.originalName,
      mimeType: media.mimeType,
      size: media.size,
      url: media.url,
    }

    data.push(mediaDto)
  })

  return data
}
