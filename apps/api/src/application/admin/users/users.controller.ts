import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Query,
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
import { Transactional } from 'typeorm-transactional'

import { meSchema, userSchema, usersSchema } from '@/application/admin/users/dto/user.schema'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { RequirePermissions } from '@/common/decorators/permissions.decorator'
import { Public } from '@/common/decorators/public.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { PermissionGuard } from '@/common/guards/permission.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import {
  PermissionAction,
  PermissionScope,
  ResourceType,
} from '@/common/permissions/permission-registry'
import { AuthService } from '@/domain/service/auth.service'
import { UserRolesService } from '@/domain/service/user-roles.service'
import { UsersService } from '@/domain/service/users.service'
import { RequireParam, Role } from '@/models/enums/'
import { successSchema } from '@/models/schemas/success.schema'
import { User } from '@/models/user.entity'
import { UserRole } from '@/models/user-role.entity'

import { AcceptInviteSiteMemberDto } from '../sites/dto/accept-invite-site-member.dto'

import { ChangeAliasPasswordDto } from './dto/change-alias-password.dto'
import { ChangePasswordDto, ChangeUserPasswordDto } from './dto/change-password.dto'
import { ChangeProfileDto } from './dto/change-profile.dto'
import { InviteUserResponse } from './dto/invite-user.dto'
import { UpdateUserPermissionDto, UpdateUserProfileDto } from './dto/update-user.dto'
import { UserPageDto, UserPageOptionDto } from './dto/user-pagination.dto'
import { UpdateUserRoleDto, UserRoleResponse } from './dto/user-role.dto'

@ApiTags('Users')
@Controller('users')
@UseGuards(AdminAuthGuard)
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
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly userRoleService: UserRolesService
  ) {}

  @Get()
  @ApiOperation({
    summary: 'This api for user use to lst all a account of flowclass.',
  })
  @ApiOkResponse({
    schema: usersSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  findAll(
    @Query() pageOptionsDto: UserPageOptionDto,
    @CurrentUser() user: User
  ): Promise<UserPageDto | User[]> {
    return this.usersService.findAll(pageOptionsDto, user, true)
  }

  // @Post()
  // @ApiOperation({
  //   summary: 'This api for user use to create a account of flowclass.',
  // })
  // @ApiOkResponse({
  //   schema: responseCreateUserSchema,
  // })
  // @ApiBadRequestResponse({
  //   description: 'This response may be when information of user already exist in our system',
  // })
  // @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER)
  // @UseGuards(RolesGuard)
  // @RequireParams(RequireParam.SITE_ID)
  // @UseGuards(RequireParamsGuard)
  // async create(@Body() createUserDto: CreateUserDto): Promise<User> {
  //   return this.usersService.create(createUserDto)
  // }

  @Get('me')
  @ApiOperation({
    summary: 'This api for user use to view profile after login a account of flowclass.',
  })
  @ApiOkResponse({
    schema: meSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  async me(@CurrentUser() user: User): Promise<UserRoleResponse> {
    return await this.usersService.detailWithPermission(user)
  }

  @Get('get')
  @ApiOperation({
    summary: 'This api for user use to detail view a account of flowclass.',
  })
  @ApiOkResponse({
    schema: userSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @RequireParams(RequireParam.SITE_ID)
  @RequirePermissions([
    {
      resource: ResourceType.USERS,
      action: PermissionAction.VIEW,
      scope: PermissionScope.OWN,
    },
  ])
  @UseGuards(RequireParamsGuard, PermissionGuard)
  findOne(
    @Query('userId') id: number,
    @Query('institutionId') institutionId: number
  ): Promise<UserRole> {
    return this.usersService.findUserByUserIdAndInstitutionId(id, institutionId)
  }

  @Patch('update')
  @ApiOperation({
    summary: 'This api for user use to update a account of flowclass.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @UseGuards(PermissionGuard)
  @RequirePermissions([
    {
      resource: ResourceType.USERS,
      action: PermissionAction.UPDATE,
      scope: PermissionScope.OWN,
    },
  ])
  // We need to ban instructors from updating his own permission
  update(
    @Query('userId') id: string,
    @Query('institutionId') institutionId: number,
    @Body() updateUserDto: UpdateUserProfileDto
  ) {
    return this.usersService.updateUserProfile(+id, institutionId, updateUserDto)
  }

  @Patch('update-permission')
  @ApiOperation({
    summary: 'This api for user use to update permission of a account of flowclass.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @UseGuards(RolesGuard)
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @RequireParams(RequireParam.SITE_ID)
  @UseGuards(RequireParamsGuard)
  updatePermission(
    @Query('userId') id: string,
    @Body() updateUserDto: UpdateUserPermissionDto
  ): Promise<UserRole> {
    return this.usersService.updatePermission(+id, updateUserDto)
  }

  @Patch('update-password')
  @ApiOperation({
    summary: 'This api for master admin to update password for a user',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @UseGuards(PermissionGuard)
  @RequirePermissions([
    {
      resource: ResourceType.USERS,
      action: PermissionAction.UPDATE,
      scope: PermissionScope.OWN,
    },
  ])
  updatePassword(@Query('userId') id: string, @Body() updatePasswordDto: ChangeUserPasswordDto) {
    return this.usersService.updatePasswordUser(+id, updatePasswordDto)
  }

  @Delete('delete')
  @ApiOperation({
    summary: 'This api for master admin to delete a account of flowclass.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  remove(@Query('userId') id: string, @CurrentUser() user: User, @Query('siteId') siteId: number) {
    return this.usersService.remove(+id, user, siteId)
  }

  @Delete('remove-account')
  @ApiOperation({
    summary: 'This api for user use to delete a account of flowclass himself.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  @Transactional()
  removeSelf(@CurrentUser() user: User, @Query('userId') id: string) {
    return this.usersService.removeSelf(user, parseInt(id))
  }

  @Post('change-profile')
  @ApiOperation({
    summary: 'This api for user use to change profile a account of flowclass.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  changeProfile(@CurrentUser() user: User, @Body() changeProfileDto: ChangeProfileDto) {
    return this.usersService.changeProfile(user, changeProfileDto)
  }

  @Post('change-password')
  @ApiOperation({
    summary: 'This api for user use to change password a account of flowclass.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when information of user already exist in our system',
  })
  changePassword(@CurrentUser() user: User, @Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(user, changePasswordDto)
  }

  @Post('change-alias-password')
  @ApiOperation({
    summary: 'This api for admin to change the alias password of a user alias.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when user alias not found or invalid data provided',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER)
  @UseGuards(RolesGuard)
  async changeAliasPassword(@Body() changeAliasPasswordDto: ChangeAliasPasswordDto) {
    const result = await this.usersService.changeAliasPassword(changeAliasPasswordDto)
    return result
  }

  @Get('invitations')
  @ApiOperation({
    summary: 'This api for user get list invitation to institutions.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  invitation(@CurrentUser() user: User) {
    return this.usersService.getInvitation(user.email)
  }

  @Post('accept-invite-with-register')
  @Public()
  @ApiOperation({
    summary: 'This api for user who is invited to register and become a member of site.',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  async acceptInviteMember(@Body() acceptInviteSiteMemberDto: AcceptInviteSiteMemberDto) {
    return this.authService.acceptInviteWithRegistration(acceptInviteSiteMemberDto)
  }

  @Patch('change-user-roles')
  @ApiOperation({
    summary: 'This api for site manager to change user roles',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  changeUserRoles(@Query() updateUserRoleDto: UpdateUserRoleDto, @CurrentUser() user: User) {
    return this.userRoleService.changeUserRole(updateUserRoleDto.email, updateUserRoleDto.role)
  }

  @Get('get-invitation')
  @Public()
  @ApiOperation({
    summary: 'This api for invited user to get in registration',
  })
  @ApiOkResponse({
    schema: successSchema,
  })
  async getInviteByToken(@Query('token') token: string): Promise<InviteUserResponse> {
    return this.usersService.getInvitationByToken(token)
  }
}
