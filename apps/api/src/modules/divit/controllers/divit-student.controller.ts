import { Body, Controller, Get, Post, Query, UseGuards, Param } from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'

import { CurrentUser } from '@/common/decorators/current-user.decorator'
import { Public } from '@/common/decorators/public.decorator'
import { StudentAuthGuard } from '@/common/guards/student-auth.guard'
import { User } from '@/models/user.entity'

import { CreateDivitOrderDto } from '../dto/divit-order.dto'
import { DivitService } from '../services/divit.service'

@ApiTags('Divit (Student)')
@ApiUnauthorizedResponse({ description: 'Unauthenticated request.' })
@UseGuards(StudentAuthGuard)
@ApiBearerAuth('access-token')
@Controller('divit')
export class DivitStudentController {
  constructor(private readonly divitService: DivitService) {}

  @Get('connection')
  @Public()
  @ApiOperation({ summary: 'Check if Divit is enabled for an institution' })
  @ApiQuery({ name: 'institutionId', type: Number })
  getConnection(@Query('institutionId') institutionId: number) {
    return this.divitService.getConnection(Number(institutionId))
  }

  @Post('create-order')
  @Public()
  @ApiOperation({ summary: 'Create a Divit payment order for an invoice' })
  @ApiQuery({ name: 'token', type: String, description: 'Invoice proof token' })
  createOrder(@Body() dto: CreateDivitOrderDto, @Query('token') token: string) {
    return this.divitService.createOrder(dto, token)
  }

  @Get('payment-status')
  @Public()
  @ApiOperation({ summary: 'Poll payment status for an invoice' })
  @ApiQuery({ name: 'invoiceId', type: Number })
  @ApiQuery({ name: 'token', type: String, description: 'Invoice proof token' })
  getPaymentStatus(@Query('invoiceId') invoiceId: number, @Query('token') token: string) {
    return this.divitService.getPaymentStatus(Number(invoiceId), token)
  }
}
