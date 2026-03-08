import { PartialType } from '@nestjs/swagger'

import { StudentCreatePaymentEvidenceDto } from './create-payment-evidence.dto'

export class UpdatePaymentEvidenceDto extends PartialType(StudentCreatePaymentEvidenceDto) {}
