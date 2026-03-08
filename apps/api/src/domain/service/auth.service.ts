import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { JwtService, JwtSignOptions } from '@nestjs/jwt'
import * as bcrypt from 'bcryptjs'
import { plainToInstance } from 'class-transformer'
import { ILike } from 'typeorm'

import { BaseRegisterDto } from '@/application/admin/auth/dto/base-register.dto'
import { ForgotPasswordDto } from '@/application/admin/auth/dto/forgot-password.dto'
import {
  CreateLoginTokenDto,
  LoginDto,
  LoginResponse,
  LoginWithTokenDto,
  ValidateTokenDto,
} from '@/application/admin/auth/dto/login.dto'
import { ParamForgotPasswordDto } from '@/application/admin/auth/dto/param-forgot-password.dto'
import {
  ChangeOtherUserPasswordDto,
  ResetPasswordDto,
} from '@/application/admin/auth/dto/reset-password.dto'
import { ResponseUserDto } from '@/application/admin/auth/dto/response-user.dto'
import { AcceptInviteSiteMemberDto } from '@/application/admin/sites/dto/accept-invite-site-member.dto'
import { UserDetailDto } from '@/application/admin/users/dto/user-detail.dto'
import { CloudWatchLoggerProvider } from '@/config/loggers/cloudwatch-nestjs.provider'
import { EmailService } from '@/domain/external/email.service'
import { AuthorizationException } from '@/exceptions/authorization.exception'
import { UserErrorMessage } from '@/exceptions/error-message/user'
import { InviteSiteMemberStatus } from '@/models/enums/status'
import { InstructorProfileRepository } from '@/models/instructor-profile.entity'
import { InviteMembersRepository } from '@/models/invite-members.repository'
import { User } from '@/models/user.entity'
import { UserRolesRepository } from '@/models/user-roles.repository'
import { UsersRepository } from '@/models/users.repository'
import { shallow } from '@/utils/shallow.utils'
import { sitesOfUser } from '@/utils/sites.utils'
import { transformPhone } from '@/utils/string.utils'
import { permissionsOfUser } from '@/utils/user-roles.utils'

import { PasswordResetTokenService } from './password-reset-token.service'
import { UsersService } from './users.service'

@Injectable()
export class AuthService {
  private readonly jwtOption: JwtSignOptions = {}

  constructor(
    private usersService: UsersService,
    private readonly usersRepository: UsersRepository,
    private readonly jwtService: JwtService,
    private readonly passwordResetTokenService: PasswordResetTokenService,
    private readonly emailService: EmailService,
    private readonly logger: CloudWatchLoggerProvider,
    private readonly inviteMembersRepository: InviteMembersRepository,
    private readonly userRolesRepository: UserRolesRepository,
    private readonly instructorProfileRepository: InstructorProfileRepository
  ) {
    this.jwtOption = {
      secret: process.env.JWT_SECRET,
      expiresIn: '1d',
    }
  }

  get jwtAdminOption() {
    return {
      secret: process.env.JWT_SECRET,
      expiresIn: process.env.JWT_EXPIRES_IN,
    }
  }

  async hasUsers(): Promise<{ hasUsers: boolean }> {
    const count = await this.usersRepository.count()
    return { hasUsers: count > 0 }
  }

  async registerAdminAccount(
    registerAccountDto: BaseRegisterDto,
    passExistCheck = false
  ): Promise<LoginResponse> {
    // Check if student exist with current phone
    let user = await this.usersService.findOneBy({
      phone: ILike(transformPhone(registerAccountDto.phone)),
    })

    if (!user) {
      // If passExistCheck is true, the function will not check if the user exists
      // This happens when the existing user is invited to register and become a member of some site
      user = await this.usersService.createAccount(registerAccountDto, passExistCheck)
    } else {
      throw new BadRequestException(UserErrorMessage.USER_ALREADY_EXISTS)
    }

    // The above function already checks if the user exists
    // If the user exists, it will throw an error and the following code will not be executed

    const accessToken = await this.createToken(user)
    const refreshToken = await this.createRefreshToken(user)

    await this.usersService.saveLastLogin(user)

    const data = await this.getResponseUserDto(user)

    return {
      user: data,
      accessToken,
      refreshToken,
    }
  }

  async findSuitableUserFromEmail(email: string): Promise<User[]> {
    const users = await this.usersRepository.find({
      where: { email },
      relations: {
        userRoles: true,
      },
    })

    if (!users || users.length === 0) {
      throw AuthorizationException.unauthorizedException()
    }

    const suitableUsers: User[] = []

    for (const user of users) {
      // 1. filter the user that is not existing
      if (user.deletedAt) {
        continue
      }

      const userRoles = await user.userRoles

      // We also need a case when the user does not have user Roles, this mean the user is a new user and have not craeted a site yet.
      if (!userRoles || userRoles.length === 0) {
        suitableUsers.push(user)
        continue
      }

      // 2. filter the user that does not have a non-student role
      const hasManagerRole = userRoles.some(
        (userRole) =>
          userRole.isSiteManager ||
          userRole.isInstitutionManager ||
          userRole.isInstructor ||
          userRole.isOperator
      )

      if (!hasManagerRole) {
        continue
      }

      suitableUsers.push(user)
    }

    return suitableUsers.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  async findByLogin({ email, password }: LoginDto): Promise<LoginResponse> {
    let authenticatedUser: User | null = null
    const suitableUsers = await this.findSuitableUserFromEmail(email)

    for (const user of suitableUsers) {
      if (!user.password) {
        continue
      }

      if (await bcrypt.compare(password, user.password)) {
        authenticatedUser = user
        break
      }
    }

    if (!authenticatedUser) {
      throw AuthorizationException.unauthorizedException()
    }

    const accessToken = await this.createToken(authenticatedUser)
    const refreshToken = await this.createRefreshToken(authenticatedUser)

    await this.usersService.saveLastLogin(authenticatedUser)

    const data = await this.getResponseUserDto(authenticatedUser)

    return {
      user: data,
      accessToken,
      refreshToken,
    }
  }

  async refreshAccessToken({ refreshToken }: { refreshToken: string }) {
    let payload

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      })
    } catch (e) {
      if ((e.message as string).includes('expired')) {
        throw AuthorizationException.tokenExpiredException()
      }
    }

    if (!payload) {
      throw AuthorizationException.tokenExpiredException()
    }

    const user = await this.usersService.findOneByEmail(payload.email)

    if (!user) {
      throw AuthorizationException.unauthorizedException()
    }

    const accessToken = await this.createToken(user)

    await this.usersService.saveLastLogin(user)

    const data = await this.getResponseUserDto(user)

    return {
      user: data,
      accessToken,
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const users = await this.findSuitableUserFromEmail(resetPasswordDto.email)

    const user = users[0]

    if (!user || user.deletedAt) {
      throw AuthorizationException.unauthorizedException()
    }

    const token = this.jwtService.sign(
      {
        email: user.email,
      },
      this.jwtOption
    )
    const expired = new Date(+new Date() + 60000 * 15)

    await this.passwordResetTokenService.create({
      email: user.email,
      token,
      expired,
    })

    const resetLink = encodeURI(
      process.env.NEXT_PUBLIC_WEB_BASE_URL +
        '/login/reset-password?email=' +
        user.email +
        '&token=' +
        encodeURIComponent(token)
    )

    this.emailService.sendForgetPasswordEmail({
      userId: user.id,
      emailAddress: user.email,
      resetLink,
    })

    return true
  }

  async forgotPassword(
    paramForgotPasswordDto: ParamForgotPasswordDto,
    forgotPasswordDto: ForgotPasswordDto
  ) {
    const passwordResetToken = await this.passwordResetTokenService.findOneByToken(
      paramForgotPasswordDto.token
    )
    if (!passwordResetToken) {
      throw AuthorizationException.tokenDoesNotExistException()
    }
    try {
      await this.jwtService.verify(passwordResetToken.token, {
        ...this.jwtOption,
      })
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw AuthorizationException.tokenExpiredException()
      }

      throw AuthorizationException.tokenInvalidException(error.message)
    }

    const user = await this.usersService.findOneByEmail(paramForgotPasswordDto.email)
    if (!user) {
      throw AuthorizationException.unauthorizedException()
    }

    if (forgotPasswordDto.password != forgotPasswordDto.passwordConfirm) {
      throw new HttpException('Wrong credentials provided', HttpStatus.BAD_REQUEST)
    }

    const password = await bcrypt.hash(forgotPasswordDto.password, 12)

    this.emailService.resetPasswordSuccess({
      userId: user.id,
      emailAddress: paramForgotPasswordDto.email,
    })

    return await this.usersService.forgotPassword(user, password)
  }

  async changeOtherUserPassword(changeOtherUserPasswordDto: ChangeOtherUserPasswordDto) {
    const user = await this.usersService.findOneByEmail(changeOtherUserPasswordDto.email)
    if (!user) {
      throw AuthorizationException.unauthorizedException()
    }

    await this.usersService.updatePasswordUser(user.id, {
      newPassword: changeOtherUserPasswordDto.password,
    })

    return true
  }

  async validateUser(id: number): Promise<User> {
    const user = await this.usersService.findOneBy({ id })

    if (!user) {
      throw AuthorizationException.unauthorizedException()
    }

    return user
  }

  async createLoginToken({ email }: CreateLoginTokenDto): Promise<string> {
    const user = await this.usersService.findOneByEmail(email)

    if (!user) {
      throw AuthorizationException.unauthorizedException()
    }

    const accessToken = await this.jwtService.signAsync(
      { email: user.email },
      {
        secret: process.env.JWT_TOKEN_LOGIN_TOKEN_SECRET_KEY,
        expiresIn: process.env.JWT_TOKEN_LOGIN_TOKEN_EXPRIED,
      }
    )

    return accessToken
  }

  async generateToken(user: User) {
    const accessToken = await this.createToken(user)
    const refreshToken = await this.createRefreshToken(user)

    return { accessToken, refreshToken }
  }

  async loginWithToken({ token }: LoginWithTokenDto): Promise<LoginResponse> {
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_TOKEN_LOGIN_TOKEN_SECRET_KEY,
      })

      const user = await this.usersService.findOneByEmail(payload.email)

      if (!user || user.deletedAt) {
        throw AuthorizationException.unauthorizedException()
      }

      const { accessToken, refreshToken } = await this.generateToken(user)

      await this.usersService.saveLastLogin(user)

      const data = await this.getResponseUserDto(user)

      return {
        user: data,
        accessToken,
        refreshToken,
      }
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  async validateToken(data: ValidateTokenDto): Promise<{ user: User; isValid: boolean }> {
    try {
      const payload = this.jwtService.verify(data.token, {
        secret: process.env.JWT_SECRET,
      })

      const user = await this.usersService.findOneByEmail(payload.email)
      if (!user) {
        throw AuthorizationException.unauthorizedException()
      }
      return {
        user: shallow({
          source: user,
          fields: ['id', 'email', 'firstName', 'lastName', 'userRoles'],
        }),
        isValid: true,
      }
    } catch (error) {
      throw new BadRequestException(error.message)
    }
  }

  async createToken(
    user: User,
    options?: JwtSignOptions,
    activeUserAliasId?: number
  ): Promise<string> {
    const jwtPayload = {
      id: user.id,
      email: user.email,
      // lastName: user.lastName,
      firstName: user.firstName,
      ...(activeUserAliasId ? { activeUserAliasId } : {}),
    }
    return this.jwtService.signAsync(jwtPayload, options)
  }

  async createRefreshToken(user: User, activeUserAliasId?: number): Promise<string> {
    const jwtPayload = {
      id: user.id,
      email: user.email,
      activeUserAliasId,
    }

    return this.jwtService.signAsync(jwtPayload, {
      secret: process.env.JWT_REFRESH_SECRET, // unique refresh secret from environment vars
      expiresIn: process.env.JWT_REFRESH_EXPIRES_IN, // unique refresh expiration from environment vars
    })
  }

  private async getResponseUserDto(user: User): Promise<ResponseUserDto> {
    const userRoles = await user.userRoles
    const { sites, institutions } = await this.usersService.getUserSitesAndInstitutions(user.id)

    const data: ResponseUserDto = {
      ...plainToInstance(UserDetailDto, user),
      sites: sitesOfUser(sites, institutions),
      permissions: permissionsOfUser(userRoles),
    }

    return data
  }

  async acceptInviteWithRegistration(acceptInviteSiteMemberDto: AcceptInviteSiteMemberDto) {
    const inviteSiteMember = await this.inviteMembersRepository.findOneBy({
      token: acceptInviteSiteMemberDto.token,
      status: InviteSiteMemberStatus.INVITING,
    })

    if (!inviteSiteMember) {
      throw new BadRequestException(UserErrorMessage.USER_INVITE_NOT_FOUND)
    }

    const transformedPhone = transformPhone(inviteSiteMember.phone)

    let existingUserRole = await this.userRolesRepository.findOneBy({
      institutionId: inviteSiteMember.institutionId,
      user: {
        phone: transformedPhone,
      },
    })

    let invitedUser: User

    acceptInviteSiteMemberDto.phone = inviteSiteMember.phone

    if (!existingUserRole) {
      invitedUser = await this.usersRepository.findOneBy({
        phone: transformedPhone,
      })

      if (!invitedUser) {
        const newUser = await this.registerAdminAccount(acceptInviteSiteMemberDto, true)

        if (!newUser) {
          throw new BadRequestException(UserErrorMessage.USER_CANNOT_BE_CREATED)
        }

        invitedUser = await this.usersService.findOneBy({
          id: newUser.user.id,
        })
      }
    } else {
      invitedUser = await this.usersRepository.findOneBy({
        id: existingUserRole.userId,
      })
    }

    if (acceptInviteSiteMemberDto.agree) {
      inviteSiteMember.status = InviteSiteMemberStatus.ACCEPT
      this.inviteMembersRepository.save(inviteSiteMember)

      if (!existingUserRole) {
        existingUserRole = await this.userRolesRepository.save({
          siteId: inviteSiteMember.siteId,
          institutionId: inviteSiteMember.institutionId,
          userId: invitedUser.id,
          isMasterAdmin: false,
          isSiteManager: inviteSiteMember.isSiteManager,
          isInstitutionManager: inviteSiteMember.isInstitutionManager,
          isInstructor: inviteSiteMember.isInstructor,
          isOperator: inviteSiteMember.isOperator,
          isStudent: false,
        })
      } else {
        const hashedPassword = await bcrypt.hash(acceptInviteSiteMemberDto.password, 12)

        await this.usersRepository.save({
          ...invitedUser,
          firstName: acceptInviteSiteMemberDto.firstName,
          email: acceptInviteSiteMemberDto.email,
          password: hashedPassword,
        })

        existingUserRole = await this.userRolesRepository.save({
          ...existingUserRole,
          isSiteManager: inviteSiteMember.isSiteManager,
          isInstitutionManager: inviteSiteMember.isInstitutionManager,
          isInstructor: inviteSiteMember.isInstructor,
          isOperator: inviteSiteMember.isOperator,
        })
      }

      if (inviteSiteMember.isInstructor) {
        await this.instructorProfileRepository.save({
          userRoleId: existingUserRole.id,
          isRatesEnabled: false,
          isActive: true,
        })
      }
    } else {
      inviteSiteMember.status = InviteSiteMemberStatus.REFUSE
      this.inviteMembersRepository.save(inviteSiteMember)
    }

    return invitedUser
  }
}
