import { Column, Entity, Index, JoinColumn, OneToOne, Unique } from 'typeorm'

import { IntegrationConnectStatus } from '@/models/enums/status'
import { BaseEntity } from '@/modules/base/base.entity'

import { Institution } from './institutions.entity'

@Entity('stripe_connects')
export class StripeConnect extends BaseEntity {
  @Index('IX_stripe_connects_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_stripe_connects_institution_id')
  @Unique('UQ_stripe_connects_institution_id', ['institutionId'])
  @Column({ name: 'institution_id' })
  institutionId: number

  // This is the stripe account id for the institution, which is ONLY used for stripe connect
  @Column({ name: 'stripe_account_id', nullable: true })
  stripeAccountId: string

  // This is the status of the stripe connect, which is ONLY used for stripe connect
  @Column({ name: 'status', enum: IntegrationConnectStatus, type: 'varchar', nullable: true })
  status?: IntegrationConnectStatus

  // This is the status of the stripe connect, which is ONLY used for stripe connect
  @Column({ name: 'enabled', default: false })
  enabled: boolean

  // This is the customer id for user to subscription to our service
  @Column({ name: 'customer_id', nullable: true })
  customerId: string

  @OneToOne(() => Institution)
  @JoinColumn({ name: 'institution_id' })
  institution: Institution

  // This is the subscription id for user to subscription to our service
  // We don't add this field here because there can be multiple stripe subscriptions
  // @Column({ name: 'subscription_id', nullable: true })
  // subscriptionId: string
}
