import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger'

import { ApiResult } from '@/common/api-formats/api-result'
import { Roles } from '@/common/decorators/roles.decorator'
import { AdminAuthGuard } from '@/common/guards/admin-auth.guard'
import { RolesGuard } from '@/common/guards/roles.guard'
import { Role } from '@/models/enums/'

import { SetingBlockTimeService } from '../../../domain/service/setting-block-time.service'

import { CreateBlockTimeDto } from './dto/create-block-time.dto'
import { GetListBlockTimeDto } from './dto/list-block-time.dto'
import { UpdateBlockTimeDto } from './dto/update-block-time.dto'

@Controller('setting-block-time')
@ApiTags('Setting Block Time')
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
export class SetingBlockTimeController {
  constructor(private readonly setingBlockTimeService: SetingBlockTimeService) {}

  @Post('')
  @ApiOperation({
    summary: 'This api for creating block time',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  async create(@Body() body: CreateBlockTimeDto) {
    const result = await this.setingBlockTimeService.create(body)
    return new ApiResult().success(result)
  }

  @Get('')
  @ApiOperation({
    summary: 'This api for get list block time',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  async getList(@Query() query: GetListBlockTimeDto) {
    const result = await this.setingBlockTimeService.getList(query)
    return new ApiResult().success(result)
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'This api for delete block time',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  async delete(@Param('id') id: number) {
    const result = await this.setingBlockTimeService.delete(id)
    return new ApiResult().success(result)
  }

  @Get(':id')
  @ApiOperation({
    summary: 'This api for detail block time',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  async getDetail(@Param('id') id: number) {
    const result = await this.setingBlockTimeService.getDetail(id)
    return new ApiResult().success(result)
  }

  @Put(':id')
  @ApiOperation({
    summary: 'This api for update block time',
  })
  @ApiOkResponse({
    type: ApiResult,
  })
  @Roles(
    Role.MASTER_ADMIN,
    Role.SITE_MANAGER,
    Role.INSTITUTION_MANAGER,
    Role.INSTRUCTOR,
    Role.OPERATOR
  )
  @UseGuards(RolesGuard)
  async update(@Param('id') id: number, @Body() body: UpdateBlockTimeDto) {
    const result = await this.setingBlockTimeService.update(id, body)
    return new ApiResult().success(result)
  }
}
