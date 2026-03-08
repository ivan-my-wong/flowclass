import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
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

import { ApiResult } from '@/common/api-formats/api-result'
import { Public } from '@/common/decorators/public.decorator'
import { RequireParams } from '@/common/decorators/require-param.decorator'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { EnrollmentFormService } from '@/domain/service/enrollment-form.service'
import { RequireParam, Role } from '@/models/enums/'

import {
  AssignFormForCourseDto,
  ChangeFieldStatusDto,
  CreateFieldDto,
  CreateFormDto,
  EnrollmentFormBaseDto,
  FormDetailDto,
  IDDto,
  ReOrderDto,
  UpdateFieldDto,
  UpdateFormDto,
} from './dtos/enrollment-form.dto'

@Controller('enrollment-form')
@ApiTags('Enrollment Form')
@UseInterceptors(ClassSerializerInterceptor)
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
@ApiUnprocessableEntityResponse({
  description: 'This response when request body invalidate.',
})
@ApiResponse({
  description: 'This response when system error.',
  status: 500,
})
export class EnrollmentFormController {
  constructor(private readonly enrollmentFormService: EnrollmentFormService) {}

  @Get('create-field-opt')
  @ApiOperation({
    summary: 'This api for get option for create field.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when field option already exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  async getCreateField() {
    const result = await this.enrollmentFormService.getCreateFieldOpt()

    return new ApiResult().success(result)
  }

  @Post('create-field')
  @ApiOperation({
    summary: 'This api for create field.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when create field success',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async createField(@Body() params: CreateFieldDto) {
    const result = await this.enrollmentFormService.createField(params)

    return new ApiResult().success(result)
  }

  @Post('update-field')
  @ApiOperation({
    summary: 'This api for update field.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when update field success',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async updateField(@Body() params: UpdateFieldDto) {
    const result = await this.enrollmentFormService.updateField(params)

    return new ApiResult().success(result)
  }

  @Post('delete-field')
  @ApiOperation({
    summary: 'This api for delete field.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when delete field success',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  async deleteField(@Body() params: IDDto) {
    const result = await this.enrollmentFormService.deleteField(params.id)

    return new ApiResult().success(result)
  }

  @Post('change-field-status')
  @ApiOperation({
    summary: 'This api for change status field.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when change status field success',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  async changeFieldStatus(@Body() params: ChangeFieldStatusDto) {
    const result = await this.enrollmentFormService.changeFieldStatus(params)

    return new ApiResult().success(result)
  }

  @Get('fields')
  @ApiOperation({
    summary: 'This api for list all field of flowclass.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when field exist in our system',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getFields(@Query() params: EnrollmentFormBaseDto) {
    const result = await this.enrollmentFormService.getFields(params.institutionId)

    return new ApiResult().success(result)
  }

  @Get('field-detail')
  @ApiOperation({
    summary: 'This api for field detail of flowclass.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when field exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  async getField(@Query() params: IDDto) {
    const result = await this.enrollmentFormService.getFieldDetail(params.id)

    return new ApiResult().success(result)
  }

  @Post('order-field')
  @ApiOperation({
    summary: 'This api for order field.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when order field success',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async orderField(@Body() params: ReOrderDto) {
    const result = await this.enrollmentFormService.reOrder(params)

    return new ApiResult().success(result)
  }

  @Get('courses')
  @ApiOperation({
    summary: 'This api for list all course of flowclass.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when course exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getCourses(@Query() params: EnrollmentFormBaseDto) {
    const result = await this.enrollmentFormService.getCourses(params.institutionId)

    return new ApiResult().success(result)
  }

  @Post('create-form')
  @ApiOperation({
    summary: 'This api for create form.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when create form success',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async createForm(@Body() params: CreateFormDto) {
    const result = await this.enrollmentFormService.createForm(params)

    return new ApiResult().success(result)
  }

  @Get('create-default-form')
  @ApiOperation({
    summary: 'This api for create form.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when create form success',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async createDefaultForm(@Query('institutionId') institutionId: string) {
    // This endpoint will be used on onboarding
    const result = await this.enrollmentFormService.createDefaultForms(+institutionId)

    return new ApiResult().success(result)
  }

  @Post('update-form')
  @ApiOperation({
    summary: 'This api for update form.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when update form success',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async updateForm(@Body() params: UpdateFormDto) {
    const result = await this.enrollmentFormService.updateForm(params)

    return new ApiResult().success(result)
  }

  @Post('delete-form')
  @ApiOperation({
    summary: 'This api for delete form.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when form field success',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  async deleteForm(@Body() params: IDDto) {
    const result = await this.enrollmentFormService.deleteForm(params.id)

    return new ApiResult().success(result)
  }

  @Get('forms')
  @ApiOperation({
    summary: 'This api for list all form of flowclass.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when form exist in our system',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  @RequireParams(RequireParam.INSTITUTION_ID)
  async getForms(@Query() params: EnrollmentFormBaseDto) {
    const result = await this.enrollmentFormService.getForms(params.institutionId)

    return new ApiResult().success(result)
  }

  @Get('form-detail')
  @ApiOperation({
    summary: 'This api for form of flowclass.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when form exist in our system',
  })
  @Public()
  async getForm(@Query() params: FormDetailDto) {
    const result = await this.enrollmentFormService.getFormDetail(params)

    return new ApiResult().success(result)
  }

  @Post('assign-form-for-course')
  @ApiOperation({
    summary: 'This api for assign form for course.',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @ApiBadRequestResponse({
    description: 'This response may be when assign form success',
  })
  @Roles(Role.MASTER_ADMIN, Role.SITE_MANAGER, Role.INSTITUTION_MANAGER, Role.INSTRUCTOR)
  @UseGuards(RolesGuard)
  async assignForm(@Body() params: AssignFormForCourseDto) {
    const result = await this.enrollmentFormService.assignFormForCourse(params)

    return new ApiResult().success(result)
  }
}
