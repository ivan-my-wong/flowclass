import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'

import { PricingPageService } from '@/domain/service/pricing-page.service'

import { SubmitQuoteDto } from './dto/submit-quote.dto'

@ApiTags('Pricing Page')
@Controller('pricing-page')
export class PricingPageController {
  constructor(private readonly pricingPageService: PricingPageService) {}

  @Post('submit-quote')
  @ApiOperation({
    operationId: 'submitQuote',
    summary: 'Submit a quote request from the pricing calculator',
    description: 'Processes quote submissions and sends email notifications to info@flowclass.io',
  })
  @ApiResponse({
    status: 200,
    description: 'Quote submitted successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - invalid data',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async submitQuote(@Body() submitQuoteDto: SubmitQuoteDto) {
    return this.pricingPageService.submitQuote(submitQuoteDto)
  }
}
