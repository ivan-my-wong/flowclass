import { PartialType } from '@nestjs/swagger'

import { CreateStripeConnectDto } from './create-stripe-connect.dto'

export class UpdateStripeConnectDto extends PartialType(CreateStripeConnectDto) {}
