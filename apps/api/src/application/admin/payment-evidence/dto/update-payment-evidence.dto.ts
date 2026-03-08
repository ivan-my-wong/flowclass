import { PartialType } from '@nestjs/swagger'

import { CreatePaymentEvidenceDto } from './create-payment-evidence.dto'

export class UpdatePaymentEvidenceDto extends PartialType(CreatePaymentEvidenceDto) {}
