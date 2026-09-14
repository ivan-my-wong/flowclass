import { PartialType } from '@nestjs/swagger'

import { CreatePlanDto } from './create-subscription-plans.dto'

export class UpdatePlanDto extends PartialType(CreatePlanDto) {}
