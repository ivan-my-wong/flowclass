import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'

import { StripeProductPricesDetailReponse } from './stripe-product-prices.dto'

export class StripeProductPricesPageDto extends PageDto<StripeProductPricesDetailReponse> {}

export class StripeProductPricesPageOptionDto extends PageOptionsDto {}
