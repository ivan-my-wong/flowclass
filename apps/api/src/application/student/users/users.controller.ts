import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { meSchema } from '@/application/admin/users/dto/user.schema'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { StudentAuthGuard } from '@/common/guards/student-auth.guard'
import { UsersService } from '@/domain/service/users.service'
import { successSchema } from '@/models/schemas/success.schema'
import { User } from '@/models/user.entity'

import { StudentChangePasswordDto } from './dto/change-password.dto'
import { StudentChangeProfileDto } from './dto/change-profile.dto'
import { StudentUserRoleResponse } from './dto/user-role.dto'

@ApiTags('Student-Users')
@Controller('users')
@UseGuards(StudentAuthGuard)
@ApiBearerAuth('access-token')
@UseInterceptors(ClassSerializerInterceptor)
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiResponse({
  description: 'This response when system error.',
  status: 500,
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    operationId: 'studentUsersMeGet',
    summary: 'This api for user use to view profile after login a account of flowclass.',
  })
  @ApiOkResponse({
    schema: meSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  async me(@CurrentUser() user: User): Promise<StudentUserRoleResponse> {
    return await this.usersService.detailWithPermission(user)
  }

  @Post('change-profile')
  @ApiOperation({
    operationId: 'studentUsersChangeProfilePost',
    summary: 'This api for user use to change profile a account of flowclass.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  changeProfile(@CurrentUser() user: User, @Body() changeProfileDto: StudentChangeProfileDto) {
    return this.usersService.changeProfile(user, changeProfileDto)
  }

  @Post('change-password')
  @ApiOperation({
    operationId: 'studentUsersChangePasswordPost',
    summary: 'This api for user use to change password a account of flowclass.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  changePassword(@CurrentUser() user: User, @Body() changePasswordDto: StudentChangePasswordDto) {
    return this.usersService.changePassword(user, changePasswordDto)
  }
}
