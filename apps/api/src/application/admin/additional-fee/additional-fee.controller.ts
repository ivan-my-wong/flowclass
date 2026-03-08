import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
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

import { RequireParams } from '@/common/decorators/require-param.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RequireParamsGuard } from '@/common/guards/require-params.guard'
import { AdditionalFeeService } from '@/domain/service/additional-fee.service'
import { AdditionalFeeRepository } from '@/models/additional-fee.entity'
import { RequireParam } from '@/models/enums/'

import { AssignAdditionalFeeToCourseDto, CreateAdditionalFeeDto } from './additional-fee.dto'

@ApiTags('AdditionalFee')
@Controller('additional-fee')
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
export class AdditionalFeeController {
  constructor(
    private readonly additionalFeeService: AdditionalFeeService,
    private readonly additionalFeeRepository: AdditionalFeeRepository
  ) {}

  // Write one to get by siteId and institutionId
  @Get()
  @ApiOperation({
    summary: 'This api for getting all additional fees.',
  })
  @ApiOkResponse({
    description: 'Successfully found the additional fees.',
  })
  @ApiBadRequestResponse({
    description: 'This response may be when the additional fees do not exist in our system.',
  })
  @RequireParams(RequireParam.INSTITUTION_ID)
  @UseGuards(RequireParamsGuard)
  async getAdditionalFeeBySiteAndInstitution(
    @Query('siteId') siteId: number,
    @Query('institutionId') institutionId: number
  ): Promise<any> {
    return await this.additionalFeeRepository.findBy({ siteId, institutionId })
  }

  @Get(':id')
  @ApiOperation({
    summary: 'This api for getting an additional fee by id.',
  })
  @ApiOkResponse({
    description: 'Successfully found the additional fee.',
  })
  @ApiBadRequestResponse({
    description: 'This response may be when the additional fee does not exist in our system.',
  })
  async findAdditionalFeeById(@Param('id') id: number): Promise<any> {
    return await this.additionalFeeRepository.findOneBy({ id })
  }

  @Post()
  @ApiOperation({
    summary: 'This api for creating an additional fee.',
  })
  @ApiBadRequestResponse({
    description:
      'This response may be when information of the additional fee already exist in our system',
  })
  createAdditionalFee(@Body() dto: CreateAdditionalFeeDto): Promise<any> {
    return this.additionalFeeService.create(dto)
  }

  @Post('assign-course')
  @ApiOperation({
    summary: 'This api for assigning an additional fee to a course.',
  })
  @ApiOkResponse({
    description: 'Successfully assigned the additional fee to the course.',
  })
  @ApiBadRequestResponse({
    description:
      'This response may be when the additional fee or course does not exist in our system.',
  })
  async assignAdditionalFeeToCourse(@Body() dto: AssignAdditionalFeeToCourseDto): Promise<any> {
    return this.additionalFeeService.assignToCourse(dto.additionalFeeId, dto.courseId)
  }

  @Post('unassign-course')
  @ApiOperation({
    summary: 'This api for unassigning an additional fee from a course.',
  })
  @ApiOkResponse({
    description: 'Successfully unassigned the additional fee from the course.',
  })
  @ApiBadRequestResponse({
    description:
      'This response may be when the additional fee or course does not exist in our system.',
  })
  async unassignAdditionalFeeFromCourse(@Body() dto: AssignAdditionalFeeToCourseDto): Promise<any> {
    return this.additionalFeeService.unassignFromCourse(dto.additionalFeeId, dto.courseId)
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'This api for updating an additional fee.',
  })
  @ApiOkResponse({
    description: 'Successfully updated the additional fee.',
  })
  @ApiBadRequestResponse({
    description: 'This response may be when the additional fee does not exist in our system.',
  })
  async updateAdditionalFee(
    @Param('id') id: number,
    @Body() dto: CreateAdditionalFeeDto
  ): Promise<any> {
    return this.additionalFeeRepository.update({ id }, dto)
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'This API is for deleting an additional fee.',
  })
  @ApiOkResponse({
    description: 'Successfully deleted the additional fee.',
  })
  @ApiBadRequestResponse({
    description: 'This response may be when the additional fee does not exist in our system.',
  })
  async deleteAdditionalFee(@Param('id') id: number): Promise<any> {
    return this.additionalFeeRepository.delete(id)
  }
}
