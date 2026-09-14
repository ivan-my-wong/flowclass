import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { AutomationFunction } from '@/common/constants/automationFlow'
import { WhatsappTemplateEntity } from '@/models/whatsapp-template.entity'
import { BaseEntity } from '@/modules/base/base.entity'

import { AutomationFlow } from './automation-flow.entity'

export type StepInput = {
  automationFlowId: number
  orderNumber: number
  // channel: string
  customMessageId: number
  sendTimingUnit?: string
  sendWhenInterval?: number
  sendWhenRelation?: string
  triggerReference?: string
}

@Entity('automation_flow_steps')
export class AutomationFlowStep extends BaseEntity {
  @Column({ name: 'automation_flow_id', type: 'int' })
  automationFlowId: number

  @ManyToOne(() => AutomationFlow, (automationFlow) => automationFlow.steps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'automation_flow_id' })
  automationFlow: AutomationFlow

  @Column({ name: 'step_order', type: 'int' })
  order: number

  @Column({ name: 'node_type', type: 'varchar', nullable: true })
  nodeType: string

  @Column({ name: 'node_name', type: 'varchar', nullable: true })
  nodeName: string

  @Column({ name: 'node_parameters', type: 'jsonb', default: () => "'{}'" })
  nodeParameters: Record<string, any>

  @Column({ name: 'node_position_x', type: 'int', nullable: true })
  nodePositionX: number

  @Column({ name: 'node_position_y', type: 'int', nullable: true })
  nodePositionY: number

  @Column({ name: 'email_template_id', type: 'int', nullable: true })
  emailTemplateId: number

  @Column({ name: 'whatsapp_template_id', type: 'int', nullable: true })
  whatsappTemplateId: number

  @ManyToOne(() => WhatsappTemplateEntity, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'whatsapp_template_id' })
  whatsappTemplate: WhatsappTemplateEntity

  @Column({ name: 'twillio_content_id', type: 'varchar', nullable: true })
  twillioContentId: string

  @Column({ name: 'triggered_count', type: 'int', default: 0, nullable: true })
  triggeredCount: number

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>

  @Column({ name: 'automation_function', type: 'jsonb', nullable: true, default: {} })
  automationFunction?: AutomationFunction & Record<string, any>

  @Column({ name: 'automation_interval', type: 'varchar', nullable: true })
  automationInterval?: string

  @Column({ name: 'interval_label', type: 'varchar', nullable: true })
  intervalLabel?: string

  @Column({ name: 'last_triggered_at', type: 'timestamp', nullable: true })
  lastTriggeredAt: Date

  @Column({ type: 'boolean', default: false })
  whatsappTemplateRequired: boolean

  @Column('jsonb', { nullable: true })
  conditions?: {
    field: string
    operator: string
    value: string
  }[]
}
