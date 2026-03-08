import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiExtraModels,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { Public } from '@/common/decorators/public.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { AuthService } from '@/domain/service/auth.service'
import { Role } from '@/models/enums/'
import { successSchema } from '@/models/schemas/success.schema'
import { User } from '@/models/user.entity'

import { loginSchema } from './dto/auth.schema'
import { ForgotPasswordDto } from './dto/forgot-password.dto'
import {
  CreateLoginTokenDto,
  LoginDto,
  LoginResponse,
  LoginWithTokenDto,
  RefreshTokenDto,
  ValidateTokenDto,
} from './dto/login.dto'
import { ParamForgotPasswordDto } from './dto/param-forgot-password.dto'
import { RegisterAccountDto } from './dto/register-account.dto'
import { ChangeOtherUserPasswordDto, ResetPasswordDto } from './dto/reset-password.dto'

@Controller('auth')
@ApiTags('Admin-Auth')
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiResponse({
  description: 'This response when system error.',
  status: 500,
})
@UseGuards(AdminAuthGuard)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('has-users')
  @Public()
  @ApiOperation({
    summary:
      'Check if any users exist in the database. Used to redirect new installations to register.',
  })
  @ApiOkResponse({
    description: 'Returns whether at least one user exists',
    schema: {
      properties: {
        hasUsers: { type: 'boolean', description: 'True if any users exist' },
      },
    },
  })
  async hasUsers(): Promise<{ hasUsers: boolean }> {
    return this.authService.hasUsers()
  }

  @ApiExtraModels(LoginResponse)
  @Post('register')
  @Public()
  @ApiOperation({
    summary: 'This api for user use to register a account of flowclass.',
  })
  @ApiOkResponse({
    schema: loginSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  async accountRegister(@Body() registerAccountDto: RegisterAccountDto): Promise<LoginResponse> {
    return this.authService.registerAdminAccount(registerAccountDto)
  }

  @Post('login')
  @Public()
  @ApiOperation({
    summary:
      'This api for master admin, site manager, institution manager, instructor, operator to log into out system.',
  })
  @ApiOkResponse({
    schema: loginSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'This response when user not available in your system.',
  })
  async login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.findByLogin(loginDto)
  }

  @Post('refresh-token')
  @Public()
  @ApiOperation({
    summary:
      'This api for master admin, site manager, institution manager, instructor, operator to refresh their accesstoken.',
  })
  @ApiOkResponse({
    schema: loginSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'This response when user not available in your system.',
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshAccessToken(refreshTokenDto)
  }

  @Post('reset-password')
  @Public()
  @ApiOperation({
    summary: 'This api for user use to reset password a account of flowclass.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto)
  }

  @Post('forgot-password')
  @Public()
  @ApiOperation({
    summary: 'This api for user use to forgot password a account of flowclass.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  async forgotPassword(
    @Query() paramForgotPasswordDto: ParamForgotPasswordDto,
    @Body() forgotPasswordDto: ForgotPasswordDto
  ) {
    return this.authService.forgotPassword(paramForgotPasswordDto, forgotPasswordDto)
  }

  @Post('create-login-token')
  @Roles(Role.MASTER_ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for master admin to create login tokrn log into out system.',
  })
  @ApiOkResponse({
    schema: loginSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'This response when user not available in your system.',
  })
  async createLoginToken(@Body() createLoginTokenDto: CreateLoginTokenDto): Promise<string> {
    return this.authService.createLoginToken(createLoginTokenDto)
  }

  @Post('login-with-token')
  @Public()
  @ApiOperation({
    summary:
      'This api for master admin, site manager, institution manager, instructor, operator to log into out system with the token provided.',
  })
  @ApiOkResponse({
    schema: loginSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'This response when user not available in your system.',
  })
  async loginWithToken(@Body() loginWithTokenDto: LoginWithTokenDto): Promise<LoginResponse> {
    return this.authService.loginWithToken(loginWithTokenDto)
  }

  @Post('validate-token')
  @Public()
  @ApiOperation({
    summary:
      'This api for master admin, site manager, institution manager, instructor, operator to validate the token provided.',
  })
  @ApiOkResponse({
    description: 'Token validation successful',
    schema: {
      properties: {
        user: {
          type: 'object',
          description: 'User information if token is valid',
        },
        isValid: {
          type: 'boolean',
          description: 'Indicates if the provided token is valid',
        },
      },
    },
  })
  async validateToken(
    @Body() validateTokenDto: ValidateTokenDto
  ): Promise<{ user: User; isValid: boolean }> {
    return this.authService.validateToken(validateTokenDto)
  }

  @Post('change-other-user-password')
  @Roles(Role.MASTER_ADMIN)
  @UseGuards(RolesGuard)
  @ApiOperation({
    summary: 'This api for master admin to change other user password.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  async changeOtherUserPassword(@Body() changeOtherUserPasswordDto: ChangeOtherUserPasswordDto) {
    return this.authService.changeOtherUserPassword(changeOtherUserPasswordDto)
  }
}
