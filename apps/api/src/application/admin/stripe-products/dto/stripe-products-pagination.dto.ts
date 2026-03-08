import { PageDto } from '@/common/pagination/page.dto'
import { PageOptionsDto } from '@/common/pagination/page-options.dto'

import { StripeProductsDetailReponse } from './stripe-products.dto'

export class StripeProductsPageDto extends PageDto<StripeProductsDetailReponse> {}

export class StripeProductsPageOptionDto extends PageOptionsDto {}
