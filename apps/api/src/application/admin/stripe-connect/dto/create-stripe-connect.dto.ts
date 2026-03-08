import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

import { StripePlanPriceLookupKey } from '@/models/enums/'

export class CreateStripeConnectDto {
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  institutionId: number

  @ApiPropertyOptional({
    example: 'https://example.com/settings/payments',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  returnUrl: string

  @ApiPropertyOptional({
    example: 'https://example.com/settings/payments',
  })
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  refreshUrl: string
}

export class CreateLoginLinkDto {
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  institutionId: number
}

export class UpdateSubscriptionDto {
  @ApiProperty({
    example: 1,
  })
  @IsEnum(StripePlanPriceLookupKey)
  plan: StripePlanPriceLookupKey
}

export class CreateBillingPortalLinkDto {
  @ApiProperty({
    example: 1,
  })
  @IsNumber()
  institutionId: number
}

export class CreateStripeConnectResponse {
  @ApiProperty({
    example: 'account_link',
  })
  object: string

  @ApiProperty({
    example: 1677748051,
  })
  created: number

  @ApiProperty({
    example: 1677748351,
  })
  expires_at: number

  @ApiProperty({
    example: 'https://connect.stripe.com/setup/e/acct_1Mh7kHPV9dKIvGsz/eYU0Fsfv8O9J',
  })
  @IsString()
  url: string
}

export class CreateLoginLinkResponse {
  @ApiProperty({
    example: 'login_link',
  })
  object: string

  @ApiProperty({
    example: 1678345216,
  })
  created: number

  @ApiProperty({
    example: 'https://connect.stripe.com/express/CxDN9x4I3lnI',
  })
  url: string
}

export class CreateBillingPortalLinkResponse {
  @ApiProperty({
    example: 'bps_1NGJq7CzWlOWnoapbeGC2Wos',
  })
  id: string

  @ApiProperty({
    example: 'billing_portal.session',
  })
  object: string

  @ApiProperty({
    example: 'bpc_1LYLa0CzWlOWnoapdphUxvRk',
  })
  configuration: string

  @ApiProperty({
    example: 1686134623,
  })
  created: number

  @ApiProperty({
    example: 'cus_O2OTq3aFr9DFQh',
  })
  customer: string

  @ApiProperty({
    example: null,
  })
  flow: any

  @ApiProperty({
    example: false,
  })
  livemode: boolean

  @ApiProperty({
    example: null,
  })
  locale: any

  @ApiProperty({
    example: null,
  })
  on_behalf_of: any

  @ApiProperty({
    example: null,
  })
  return_url: any

  @ApiProperty({
    example:
      'https://billing.stripe.com/p/session/test_YWNjdF8xSUJCWWVDeldsT1dub2FwLF9PMk9kckVXaEczMUdndllKOUU4SkFUVnNHZzh2MTVK0100PMjtfZlt',
  })
  url: string
}

export class StripeSubscriptionResponse {
  id: string
  object: string
  application: null
  application_fee_percent: null
  automatic_tax: {
    enabled: boolean
  }
  billing_cycle_anchor: number
  billing_thresholds: null
  cancel_at: null
  cancel_at_period_end: boolean
  canceled_at: null
  cancellation_details: {
    comment: null
    feedback: null
    reason: null
  }
  collection_method: string
  created: number
  currency: string
  current_period_end: number
  current_period_start: number
  customer: string
  days_until_due: null
  default_payment_method: string
  default_source: null
  default_tax_rates: []
  description: null
  discount: null
  ended_at: null
  items: {
    object: string
    data: [
      {
        id: string
        object: string
        billing_thresholds: null
        created: number
        metadata: Record<string, never>
        plan: {
          id: string
          object: string
          active: boolean
          aggregate_usage: null
          amount: number
          amount_decimal: string
          billing_scheme: string
          created: number
          currency: string
          interval: string
          interval_count: number
          livemode: boolean
          metadata: Record<string, never>
          nickname: null
          product: string
          tiers_mode: null
          transform_usage: null
          trial_period_days: null
          usage_type: string
        }
        price: {
          id: string
          object: string
          active: boolean
          billing_scheme: string
          created: number
          currency: string
          custom_unit_amount: null
          livemode: boolean
          lookup_key: null
          metadata: Record<string, never>
          nickname: null
          product: string
          recurring: {
            aggregate_usage: null
            interval: string
            interval_count: number
            trial_period_days: null
            usage_type: string
          }
          tax_behavior: string
          tiers_mode: null
          transform_quantity: null
          type: string
          unit_amount: number
          unit_amount_decimal: string
        }
        quantity: number
        subscription: string
        tax_rates: []
      }
    ]
    has_more: boolean
    total_count: number
    url: string
  }
  latest_invoice: string
  livemode: boolean
  metadata: Record<string, never>
  next_pending_invoice_item_invoice: null
  on_behalf_of: null
  pause_collection: null
  payment_settings: {
    payment_method_options: null
    payment_method_types: null
    save_default_payment_method: string
  }
  pending_invoice_item_interval: null
  pending_setup_intent: null
  pending_update: null
  plan: {
    id: string
    object: string
    active: boolean
    aggregate_usage: null
    amount: number
    amount_decimal: string
    billing_scheme: string
    created: number
    currency: string
    interval: string
    interval_count: number
    livemode: boolean
    metadata: Record<string, never>
    nickname: null
    product: string
    tiers_mode: null
    transform_usage: null
    trial_period_days: null
    usage_type: string
  }
  quantity: number
  schedule: null
  start_date: number
  status: string
  test_clock: string
  transfer_data: null
  trial_end: null
  trial_settings: {
    end_behavior: {
      missing_payment_method: string
    }
  }
  trial_start: null
}

class ExpressBusinessProfile {
  @ApiProperty()
  mcc: string

  @ApiProperty()
  name: string

  @ApiProperty()
  product_description: string

  @ApiProperty()
  support_address: string

  @ApiProperty()
  support_email: string

  @ApiProperty()
  support_phone: string

  @ApiProperty()
  support_url: string

  @ApiProperty()
  url: string
}

class ExpressCapabilities {
  @ApiProperty()
  card_payments: string

  @ApiProperty()
  transfers: string
}

export class StripeExpressAccountResponse {
  @ApiProperty()
  id: string

  @ApiProperty()
  object: string

  @ApiProperty({ type: () => ExpressBusinessProfile })
  business_profile: ExpressBusinessProfile

  @ApiProperty({ type: () => ExpressCapabilities })
  capabilities: ExpressCapabilities

  @ApiProperty()
  charges_enabled: boolean

  @ApiProperty()
  country: string

  @ApiProperty()
  created: number

  @ApiProperty()
  default_currency: string

  @ApiProperty()
  details_submitted: boolean

  @ApiProperty()
  email: string

  @ApiProperty()
  external_accounts: {
    object: string
    data: any[]
    has_more: boolean
    url: string
  }

  @ApiProperty()
  future_requirements: {
    alternatives: any[]
    current_deadline: null
    currently_due: any[]
    disabled_reason: null
    errors: any[]
    eventually_due: any[]
    past_due: any[]
    pending_verification: any[]
  }

  @ApiProperty()
  metadata: Record<string, never>

  @ApiProperty()
  payouts_enabled: boolean

  @ApiProperty()
  requirements: {
    alternatives: any[]
    current_deadline: null
    currently_due: string[]
    disabled_reason: string
    errors: any[]
    eventually_due: string[]
    past_due: string[]
    pending_verification: any[]
  }

  @ApiProperty()
  settings: {
    bacs_debit_payments: Record<string, never>
    branding: {
      icon: null
      logo: null
      primary_color: null
      secondary_color: null
    }
    card_issuing: {
      tos_acceptance: {
        date: null
        ip: null
      }
    }
    card_payments: {
      decline_on: {
        avs_failure: boolean
        cvc_failure: boolean
      }
      statement_descriptor_prefix: null
      statement_descriptor_prefix_kanji: null
      statement_descriptor_prefix_kana: null
    }
    dashboard: {
      display_name: string
      timezone: string
    }
    payments: {
      statement_descriptor: null
      statement_descriptor_kana: null
      statement_descriptor_kanji: null
    }
    payouts: {
      debit_negative_balances: boolean
      schedule: {
        delay_days: number
        interval: string
      }
      statement_descriptor: null
    }
    sepa_debit_payments: Record<string, never>
  }

  @ApiProperty()
  tos_acceptance: {
    date: null
    ip: null
    user_agent: null
  }

  @ApiProperty()
  type: 'express'
}
