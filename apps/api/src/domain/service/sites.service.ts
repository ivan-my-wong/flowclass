import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common'
import { plainToInstance } from 'class-transformer'
import * as crypto from 'crypto'
import { FindOptionsOrder, FindOptionsWhere, ILike, In, ObjectLiteral } from 'typeorm'

import { AssignSiteManagerDto } from '@/application/admin/sites/dto/assign-site-manager.dto'
import {
  CreateSiteDto,
  RegisterSiteResponse,
  SiteResponse,
} from '@/application/admin/sites/dto/create-site.dto'
import {
  InviteSiteMemberDto,
  InviteToInstitutionAndRoleDto,
} from '@/application/admin/sites/dto/invite-site-member.dto'
import { RegisterSiteDto } from '@/application/admin/sites/dto/register-site.dto'
import { SiteDetailDto } from '@/application/admin/sites/dto/site-detail.dto'
import { SitePageDto, SitePageOptionDto } from '@/application/admin/sites/dto/site-pagination.dto'
import { UpdateSiteDto } from '@/application/admin/sites/dto/update-site.dto'
import { StudentSiteMapDto } from '@/application/student/site/dto/site-map.dto'
import { EmailService } from '@/domain/external/email.service'
import { NotFoundErrorMessage } from '@/exceptions/error-message/not-found'
import { SiteErrorMessage } from '@/exceptions/error-message/site'
import { CoursesRepository } from '@/models/courses.repository'
import { RoleInSite } from '@/models/enums/'
import { InviteSiteMemberStatus } from '@/models/enums/status'
import { InviteMember } from '@/models/invite-member.entity'
import { InviteMembersRepository } from '@/models/invite-members.repository'
import { Site } from '@/models/site.entity'
import { SitesRepository } from '@/models/sites.repository'
import { User } from '@/models/user.entity'
import { BaseService } from '@/modules/base/base.service'
import { softRemoveWithRelation } from '@/utils/database.utils'
import { getSiteIds, isMasterAdmin, isSiteManager } from '@/utils/user-roles.utils'
import { isFlowclassDomain, validateDomain } from '@/utils/validate/validate.utils'

import { InstitutionsService } from './institutions.service'
import { UserRolesService } from './user-roles.service'
import { UsersService } from './users.service'

@Injectable()
export class SitesService extends BaseService<Site> {
  constructor(
    private sitesRepository: SitesRepository,
    private inviteSiteMembersRepository: InviteMembersRepository,
    private usersService: UsersService,
    private userRolesService: UserRolesService,
    @Inject(forwardRef(() => InstitutionsService))
    private institutionsService: InstitutionsService,
    private emailService: EmailService,
    private courseRepository: CoursesRepository
  ) {
    super(sitesRepository)
  }
  async create(storeSiteDto: CreateSiteDto, user: User): Promise<SiteResponse> {
    if (await this.existedDomainName(storeSiteDto.url)) {
      throw new BadRequestException(SiteErrorMessage.SITE_DOMAIN_NAME_ALREADY_USED)
    }
    const siteInstance = plainToInstance(Site, storeSiteDto)
    const site = await this.sitesRepository.save(siteInstance)
    const files: Array<Express.Multer.File> = []
    await this.institutionsService.create(
      {
        siteId: site.id,
        name: site.name,
        aiCredit: 0,
        aiCreditMax: 10,
      },
      files,
      user
    )
    return plainToInstance(SiteResponse, site)
  }

  async findAll(pageOptionsDto: SitePageOptionDto, user: User): Promise<SitePageDto | Site[]> {
    const userRoles = await user.userRoles
    const whereCondition: FindOptionsWhere<Site> = {}
    const orderOption: FindOptionsOrder<Site> = {}

    if (!isMasterAdmin(userRoles)) {
      const siteIds = getSiteIds(userRoles)
      whereCondition.id = In(siteIds)
    }

    if (pageOptionsDto.url) {
      whereCondition.url = ILike(`%${pageOptionsDto.url}%`)
    }

    if (pageOptionsDto.orderBy) {
      orderOption[pageOptionsDto.orderBy] = pageOptionsDto.order
    }

    return this.sitesRepository.paginationWithTransform(
      pageOptionsDto,
      SiteDetailDto,
      whereCondition,
      orderOption
    )
  }

  async getSiteMap(): Promise<StudentSiteMapDto[]> {
    const siteMap: StudentSiteMapDto[] = []

    const sitesAndInstitutionsAndCourses = await this.sitesRepository
      .createQueryBuilder('sites')
      .leftJoinAndSelect('sites.institutions', 'institutions')
      .leftJoinAndSelect('institutions.courses', 'courses')
      .getMany()

    for (const site of sitesAndInstitutionsAndCourses) {
      if (site.url) {
        siteMap.push({
          url: `https://${site.url}/@`,
          lastmod: site.updatedAt,
        })
      }
      const tmpinstitutions = await site.institutions
      for (const institution of tmpinstitutions) {
        const tmpcourses = await institution.courses
        const institutionUrl = institution.url ?? ''

        siteMap.push({
          url: `https://${site.url}/@${institutionUrl}`,
          lastmod: institution.updatedAt,
        })

        for (const course of tmpcourses) {
          const courseUrl = course.path ?? ''

          if (site.url) {
            siteMap.push({
              url: `https://${site.url}/@${institutionUrl}/${courseUrl}`,
              lastmod: course.updatedAt,
            })
          }
        }
      }
    }

    return siteMap
  }

  async getSiteMapByDomain(domain: string): Promise<StudentSiteMapDto[]> {
    const siteMap: StudentSiteMapDto[] = []

    if (!validateDomain(domain)) {
      throw new BadRequestException(SiteErrorMessage.SITE_NOT_FOUND)
    }

    let sitesAndInstitutionsAndCourses
    let sitemapDomain = domain
    if (isFlowclassDomain(domain)) {
      // write a function to get the domain name from a domain with subdomain BUT you don't know how many . the domain has

      sitesAndInstitutionsAndCourses = await this.sitesRepository
        .createQueryBuilder('sites')
        .where('sites.url = :url', { url: domain })
        .leftJoinAndSelect('sites.institutions', 'institutions')
        .leftJoinAndSelect('institutions.courses', 'courses')
        .getMany()
    } else {
      const validSites = await this.sitesRepository.findOneBy({
        customDomain: domain,
      })

      if (validSites) {
        sitesAndInstitutionsAndCourses = await this.sitesRepository
          .createQueryBuilder('sites')
          .where('sites.customDomain = :customDomain', { customDomain: domain })
          .leftJoinAndSelect('sites.institutions', 'institutions')
          .leftJoinAndSelect('institutions.courses', 'courses')
          .getMany()
      } else {
        const lastDomain = domain.split('.').slice(-2).join('.')

        sitesAndInstitutionsAndCourses = await this.sitesRepository
          .createQueryBuilder('sites')
          .where('sites.customDomain = :customDomain', {
            customDomain: lastDomain,
          })
          .leftJoinAndSelect('sites.institutions', 'institutions')
          .leftJoinAndSelect('institutions.courses', 'courses')
          .getMany()
      }
    }

    for (const site of sitesAndInstitutionsAndCourses) {
      if (isFlowclassDomain(domain)) {
        sitemapDomain = site.url
      }

      siteMap.push({
        url: `https://${sitemapDomain}/@`,
        lastmod: site.updatedAt,
      })

      const tmpinstitutions = await site.institutions
      for (const institution of tmpinstitutions) {
        const tmpcourses = await institution.courses
        const institutionUrl = institution.url ?? ''
        siteMap.push({
          url: `https://${sitemapDomain}/@${institutionUrl}`,
          lastmod: institution.updatedAt,
        })

        for (const course of tmpcourses) {
          const courseUrl = course.path ?? ''

          siteMap.push({
            url: `https://${sitemapDomain}/@${institutionUrl}/${courseUrl}`,
            lastmod: course.updatedAt,
          })
        }
      }
    }

    return siteMap
  }

  async findOne(id: number): Promise<SiteDetailDto> {
    const site = await this.sitesRepository.findOneBy({ id })
    if (!site) {
      throw new BadRequestException(SiteErrorMessage.SITE_NOT_FOUND)
    }
    return plainToInstance(SiteDetailDto, site)
  }

  async findOneByDomain(domain: string): Promise<SiteDetailDto> {
    const site =
      (await this.sitesRepository.findOneBy({ url: domain })) ??
      (await this.sitesRepository.findOne({ where: {}, order: { id: 'ASC' } }))
    if (!site) {
      throw new BadRequestException(SiteErrorMessage.SITE_NOT_FOUND)
    }
    return plainToInstance(SiteDetailDto, site)
  }

  async findOneByCustomDomain(domain: string): Promise<SiteDetailDto> {
    const site = await this.sitesRepository.findOneBy({ customDomain: domain })
    if (!site) {
      throw new BadRequestException(SiteErrorMessage.SITE_NOT_FOUND)
    }
    return plainToInstance(SiteDetailDto, site)
  }

  async update(id: number, updateSiteDto: UpdateSiteDto): Promise<SiteDetailDto> {
    if (updateSiteDto.url && (await this.existedDomainName(updateSiteDto.url))) {
      throw new BadRequestException(SiteErrorMessage.SITE_DOMAIN_NAME_ALREADY_USED)
    }
    const site = await this.sitesRepository.findOneBy({ id })
    if (!site) {
      throw new BadRequestException(SiteErrorMessage.SITE_NOT_FOUND)
    }
    const siteInstance = plainToInstance(Site, { ...site, ...updateSiteDto })
    const siteUpdated = await this.sitesRepository.save(siteInstance)
    return plainToInstance(SiteDetailDto, siteUpdated)
  }

  async remove(id: number): Promise<SiteDetailDto> {
    const site = await this.sitesRepository.findOneBy({ id })
    if (!site) {
      throw new BadRequestException(SiteErrorMessage.SITE_NOT_FOUND)
    }

    const whereDeleteObject: FindOptionsWhere<ObjectLiteral> = {
      id,
    }

    const whereDeleteRelationObject: FindOptionsWhere<ObjectLiteral> = {
      siteId: id,
    }

    await softRemoveWithRelation(
      this.sitesRepository.manager,
      'Site',
      whereDeleteObject,
      whereDeleteRelationObject
    )

    return plainToInstance(SiteDetailDto, site)
  }

  async assignSiteManager({ siteId, assignedUserId }: AssignSiteManagerDto): Promise<boolean> {
    const site = await this.findOne(+siteId)

    if (!site) {
      throw new BadRequestException(
        NotFoundErrorMessage.MESSAGE.replace('{#1}', 'SITE').replace('{#2}', siteId.toString())
      )
    }

    if (!this.userBelongOfSite) {
      throw new BadRequestException(SiteErrorMessage.USER_NOT_FOUND_IN_SITE)
    }

    const user = await this.usersService.findOne(+assignedUserId)

    if (!user) {
      throw new BadRequestException(
        NotFoundErrorMessage.MESSAGE.replace('{#1}', 'USER').replace(
          '{#2}',
          assignedUserId.toString()
        )
      )
    }

    return this.userRolesService.assignSiteManager({ siteId, assignedUserId })
  }

  async inviteSiteMember(
    { email, name, phone, institutions }: InviteSiteMemberDto,
    user: User
  ): Promise<InviteMember[]> {
    // Prevent users from inviting themselves
    if (email.toLowerCase() === user.email.toLowerCase()) {
      throw new BadRequestException(SiteErrorMessage.CANNOT_INVITE_YOURSELF)
    }
    let result = []
    const userRoles = await user.userRoles

    // Get the list of institutions to invite
    const institutionBySites: Record<string, InviteToInstitutionAndRoleDto[]> = institutions.reduce(
      (group, institution) => {
        const { siteId } = institution
        group[siteId] = group[siteId] ?? []
        group[siteId].push(institution)
        return group
      },
      {}
    )

    const siteIds = Object.keys(institutionBySites)

    const institutionInSite = await this.institutionsService.getBySites(siteIds)

    Object.values(institutionBySites).forEach((institutions) => {
      Object.values(institutions).forEach((data: InviteToInstitutionAndRoleDto) => {
        this.validateInstitutionBelongOfSite(userRoles, institutionInSite, data)
      })
    })

    const userInvite = await this.usersService.findOneByEmail(email)

    const sites = await this.sitesRepository.findAll({
      where: {
        id: In(siteIds),
      },
      select: {
        id: true,
        name: true,
        url: true,
      },
    })

    let inviterName = user.firstName
    if (!user.firstName || user.firstName === '') {
      inviterName = user.email
    }
    for (const site of sites) {
      const res = await this.inviteNewMember(
        email,
        name,
        phone,
        site,
        institutionBySites[site.id],
        inviterName
      )

      result = result.concat(res)
    }
    return result
  }

  async userBelongOfSite(siteId: number, userId: number): Promise<boolean> {
    return await this.userRolesService.userExistsInSite(siteId, userId)
  }

  async registerSite(registerSiteDto: RegisterSiteDto, user: User) {
    // We allow duplicate site name
    // if (await this.existedSiteName(registerSiteDto.name)) {
    //   throw new BadRequestException(SiteErrorMessage.SITE_NAME_ALREADY_USED);
    // }

    if (await this.existedDomainName(registerSiteDto.url)) {
      throw new BadRequestException(SiteErrorMessage.SITE_DOMAIN_NAME_ALREADY_USED)
    }

    const siteInstance = await this.sitesRepository.create(registerSiteDto)
    siteInstance.siteAdmin = user.id
    siteInstance.email = user.email
    const site = await this.sitesRepository.save(siteInstance)

    const siteDetail = await this.findOneBy({ id: siteInstance.id })
    const files: Array<Express.Multer.File> = []

    const institution = await this.institutionsService.create(
      {
        siteId: site.id,
        name: site.name,
        aiCredit: 0,
        aiCreditMax: 10,
        email: user.email,
      },
      files,
      user
    )

    // set default institutionId to site
    siteDetail.defaultInstitutionId = institution.id
    await this.sitesRepository.update({ id: site.id }, { defaultInstitutionId: institution.id })

    const registerSiteInstance: RegisterSiteResponse = {
      ...siteDetail,
      institution,
    }

    // keep this code for future use
    // await this.userRolesService.create({
    //   siteId: site.id,
    //   institutionId: institution.id,
    //   userId: user.id,
    //   isMasterAdmin: false,
    //   isSiteManager: true,
    //   isInstitutionManager: true,
    //   isInstructor: false,
    //   isOperator: false,
    //   isStudent: false,
    // });

    return plainToInstance(RegisterSiteResponse, registerSiteInstance)
  }

  async existedSiteName(name: string) {
    return await this.sitesRepository.existedBy({ name })
  }

  async existedDomainName(url: string) {
    return await this.sitesRepository.existedBy({ url })
  }

  validateInstitutionBelongOfSite(userRoles, institutions, data: InviteToInstitutionAndRoleDto) {
    if (!isMasterAdmin(userRoles) && !isSiteManager(userRoles, data.siteId)) {
      throw new BadRequestException(
        SiteErrorMessage.DO_NOT_HAVE_PERMISSION.replace('{#1}', data.siteId.toString())
      )
    }

    if (this.notfoundInstitutionInSite(institutions, data)) {
      throw new BadRequestException(
        NotFoundErrorMessage.INSTITUTION_IN_SITE.replace(
          '{#1}',
          data.institutionId.toString()
        ).replace('{#2}', data.siteId.toString())
      )
    }

    if (data.role == RoleInSite.SITE_MANAGER && data.institutionId != 0) {
      throw new BadRequestException(
        SiteErrorMessage.WHEN_ROLE_IS_SITE_MANAGER_INSTITUTION_ID_MUST_0
      )
    }
  }

  async inviteNewMember(
    email: string,
    name: string,
    phone: string,
    site: Site,
    institutionInviteData: InviteToInstitutionAndRoleDto[],
    inviterName: string
  ): Promise<InviteMember[]> {
    const inviteList: InviteMember[] = []

    await Promise.all(
      institutionInviteData.map(async (institution) => {
        const res = await this.createInviteSiteMember(email, name, phone, institution)
        const resWithLink = {
          ...res,
          inviteLink: `${(process.env.NEXT_PUBLIC_WEB_BASE_URL || '').replace(
            /\/+$/,
            ''
          )}/invite-institution?token=${res.token}`,
        }
        inviteList.push(resWithLink)
      })
    )

    this.sendEmailToUser(email, site, institutionInviteData, [], inviterName)

    return inviteList
  }

  async inviteMember(
    userInvite: User,
    site: Site,
    institutions: InviteToInstitutionAndRoleDto[],
    inviterName
  ) {
    const institutionInvited = []
    const institutionChangeRole = []

    const memberOfInstitutions = await this.userRolesService.findByUser(userInvite.id)
    for (const institution of institutions) {
      const userBelongOfInstitution =
        memberOfInstitutions[
          institution.siteId + '_' + institution.institutionId + '_' + userInvite.id
        ]

      if (!userBelongOfInstitution) {
        const res = await this.createInviteSiteMember(
          userInvite.email,
          userInvite.firstName,
          userInvite.phone,
          institution
        )
        const resWithLink = {
          ...res,
          inviteLink: `${(process.env.NEXT_PUBLIC_WEB_BASE_URL || '').replace(
            /\/+$/,
            ''
          )}/invite-institution?token=${res.token}`,
        }
        institutionInvited.push(resWithLink)
      } else {
        // institutionChangeRole.push(institution);
        const res = await this.userRolesService.create({
          siteId: userBelongOfInstitution.siteId,
          userId: userBelongOfInstitution.userId,
          institutionId: userBelongOfInstitution.institutionId,
          isMasterAdmin: false,
          isSiteManager: institution.role == RoleInSite.SITE_MANAGER,
          isInstitutionManager: institution.role == RoleInSite.INSTITUTION_MANAGER,
          isInstructor: institution.role == RoleInSite.INSTRUCTOR,
          isOperator: institution.role == RoleInSite.OPERATOR,
          isStudent: false,
        })
        institutionInvited.push(res)
      }
    }

    this.sendEmailToUser(
      userInvite.email,
      site,
      institutionInvited,
      institutionChangeRole,
      inviterName
    )
    return institutionInvited
  }

  async createInviteSiteMember(
    email: string,
    name: string,
    phone: string,
    institution: InviteToInstitutionAndRoleDto
  ): Promise<InviteMember> {
    let invite = await this.inviteSiteMembersRepository.findByCondition({
      email,
      phone,
      siteId: institution.siteId,
      institutionId: institution.institutionId,
    })

    if (!invite) {
      invite = await this.inviteSiteMembersRepository.create({
        email,
        name,
        phone,
        siteId: institution.siteId,
        institutionId: institution.institutionId,
      })
    }

    invite.token = crypto.randomBytes(20).toString('hex')
    invite.status = InviteSiteMemberStatus.INVITING

    invite.isSiteManager = institution.role === RoleInSite.SITE_MANAGER
    invite.isInstitutionManager = institution.role === RoleInSite.INSTITUTION_MANAGER
    invite.isInstructor = institution.role === RoleInSite.INSTRUCTOR
    invite.isOperator = institution.role === RoleInSite.OPERATOR

    return await this.inviteSiteMembersRepository.save(invite)
  }

  notfoundInstitutionInSite(institutions, data) {
    const index = institutions.findIndex(
      (institution) =>
        institution.siteId == data.siteId && institution.institutionId == data.institutionId
    )
    return index == -1 && data.institutionId != 0
  }

  async sendEmailToUser(
    email: string,
    site: Site,
    institutionInvited,
    institutionChangeRole,
    inviterName
  ) {
    const institutionOfSites = await site.institutions

    const institutionOfSitesWithName = institutionOfSites.reduce((group, institution) => {
      group[institution.id] = institution.name
      return group
    }, {})

    const RoleName = {
      'site-manager': 'Site Manager',
      'institution-manager': 'Institution Manager',
      instructor: 'Instructor',
      operator: 'Operator',
    }

    if (institutionInvited.length > 0) {
      return await this.sendEmailWhenInvite(
        email,
        site,
        institutionInvited,
        institutionOfSitesWithName,
        inviterName,
        RoleName
      )
    }

    if (institutionChangeRole.length > 0) {
      this.sendEmailWhenChangeRole(
        email,
        site,
        institutionChangeRole,
        institutionOfSitesWithName,
        inviterName,
        RoleName
      )
    }
  }

  async sendEmailWhenInvite(
    email: string,
    site: Site,
    institutionInvited,
    institutionOfSitesWithName,
    inviterName,
    RoleName
  ) {
    const tokenInvite = await this.inviteSiteMembersRepository.findAll({
      where: {
        siteId: site.id,
        email,
        status: InviteSiteMemberStatus.INVITING,
      },
      select: ['institutionId', 'token'],
    })

    const institutionWithTokens = tokenInvite.reduce((group, invite) => {
      const { institutionId } = invite
      group[institutionId] = group[institutionId] ?? []
      group[institutionId].push(invite.token)
      return group
    }, {})

    const inviteContent = []
    institutionInvited.forEach((institution) => {
      inviteContent.push({
        institutionId: institution.institutionId,
        institutionName:
          institution.role == 'site-manager'
            ? site.name
            : institutionOfSitesWithName[institution.institutionId],
        inviterName,
        inviteLink: `${(process.env.NEXT_PUBLIC_WEB_BASE_URL || '').replace(
          /\/+$/,
          ''
        )}/invite-institution?token=${institutionWithTokens[institution.institutionId]}`,
        roleName: RoleName[institution.role],
        siteBaseUrl: process.env.NEXT_PUBLIC_WEB_BASE_URL || '',
      })
    })

    if (inviteContent.length > 0) {
      for (const i in inviteContent) {
        await this.emailService.sendAdminInvitationEmail(
          -1,
          inviteContent[i].institutionId,
          site.id,
          {
            siteDomain: site.url,
            inviteLink: inviteContent[i].inviteLink,
            inviterName: inviteContent[i].inviterName,
            userRole: inviteContent[i].roleName,
            invitedUserEmail: email,
          }
        )
      }
    }
    return inviteContent
  }

  async sendEmailWhenChangeRole(
    email: string,
    site: Site,
    institutionChangeRole,
    institutionOfSitesWithName,
    inviterName,
    RoleName
  ) {
    const changeRoleContent = []
    institutionChangeRole.forEach((institution) => {
      changeRoleContent.push({
        institutionName:
          institution.role == 'site-manager'
            ? site.name
            : institutionOfSitesWithName[institution.institutionId],
        inviterName,
        newRoleName: RoleName[institution.role],
        siteBaseUrl: `https://${site.url}/`,
      })
    })
  }

  async findOneBy(where: FindOptionsWhere<Site> | FindOptionsWhere<Site>[]): Promise<Site | null> {
    return this.sitesRepository.findOne({ where, relations: { siteSettings: true } })
  }
}
