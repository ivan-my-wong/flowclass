import { STRIPE_CURRENCY } from '@/models/enums/'

export class CreateProductDto {
  name: string
  unitAmount: number
  currency: STRIPE_CURRENCY
}
