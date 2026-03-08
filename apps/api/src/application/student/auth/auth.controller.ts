import { Body, Controller, Post, Query } from '@nestjs/common'
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

import { AuthService } from '@/domain/service/auth.service'
import { successSchema } from '@/models/schemas/success.schema'

import { loginSchema } from './dto/auth.schema'
import { StudentForgotPasswordDto } from './dto/forgot-password.dto'
import { LoginResponse, StudentLoginDto } from './dto/login.dto'
import { StudentParamForgotPasswordDto } from './dto/param-forgot-password.dto'
import { StudentRegisterAccountDto } from './dto/register-account.dto'
import { StudentResetPasswordDto } from './dto/reset-password.dto'

@Controller('auth')
@ApiTags('Student-Auth')
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiResponse({
  description: 'This response when system error.',
  status: 500,
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiExtraModels(LoginResponse)
  @Post('register')
  @ApiOperation({
    operationId: 'studentAuthRegister',
    summary: 'This api for user use to register a account of flowclass.',
  })
  @ApiOkResponse({
    schema: loginSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  async accountRegister(
    @Body() registerAccountDto: StudentRegisterAccountDto
  ): Promise<LoginResponse> {
    return this.authService.registerAdminAccount(registerAccountDto, true)
  }

  @Post('login')
  @ApiOperation({
    operationId: 'studentAuthLogin',
    summary:
      'This api for master admin, site manager, institution manager, instructor, operator to log into out system.',
  })
  @ApiOkResponse({
    schema: loginSchema,
  })
  @ApiUnauthorizedResponse({
    description: 'This response when user not available in your system.',
  })
  async login(@Body() loginDto: StudentLoginDto): Promise<LoginResponse> {
    return this.authService.findByLogin(loginDto)
  }

  @Post('reset-password')
  @ApiOperation({
    operationId: 'studentAuthResetPassword',
    summary: 'This api for user use to reset password a account of flowclass.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  async resetPassword(@Body() resetPasswordDto: StudentResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto)
  }

  @Post('forgot-password')
  @ApiOperation({
    operationId: 'studentAuthForgotPassword',
    summary: 'This api for user use to forgot password a account of flowclass.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  async forgotPassword(
    @Query() paramForgotPasswordDto: StudentParamForgotPasswordDto,
    @Body() forgotPasswordDto: StudentForgotPasswordDto
  ) {
    return this.authService.forgotPassword(paramForgotPasswordDto, forgotPasswordDto)
  }
}
