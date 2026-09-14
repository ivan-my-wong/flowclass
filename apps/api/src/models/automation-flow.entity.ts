import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { AutomationFlowCondition } from './automation-flow-condition.entity'
import { AutomationFlowStep } from './automation-flow-steps.entity'
import { InstitutionAutomationFlow } from './institution-automation-flow.entity'

export enum AutomationStatus {
  LIVE = 'live',
  DRAFT = 'draft',
}

export enum AutomationActionType {
  SEND_MESSAGE = 'send_message',
  ASSIGN_TO = 'assign_to',
  UNASSIGN_FROM = 'unassign_from',
  UPDATE_STATUS = 'update_status',
  ADD_TAG = 'add_tag',
  REMOVE_TAG = 'remove_tag',
  UPDATE_SUBSCRIPTION = 'update_subscription',
  WAIT = 'wait',
}

export enum TriggerMatchType {
  CONTAINS = 'contains',
  CONTAINS_EXACTLY = 'contains_exactly',
}

export enum SubscriptionStatus {
  SUBSCRIBED = 'subscribed',
  UNSUBSCRIBED = 'unsubscribed',
}

export enum ContactStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
}

export enum AutomationTriggerType {
  TIME_BASED = 'time_based',
  EVENT_BASED = 'event_based',
}

export type N8NWorkflowNode = {
  parameters: Record<string, any>
  name: string
  type: string
  typeVersion: number
  position: [number, number]
  [key: string]: any
}

export type N8NWorkflowConnection = Record<
  string,
  {
    main: Array<
      Array<{
        node: string
        type: string
        index: number
      }>
    >
  }
>

@Entity('automation_flow')
export class AutomationFlow extends BaseEntity {
  @Column({ type: 'varchar', length: 255, nullable: true, default: '' })
  name: string

  @Column({ name: 'triggered_count', type: 'int', default: 0, nullable: true })
  triggeredCount: number

  @Column({ type: 'jsonb', default: () => "'{}'", nullable: true })
  metadata: Record<string, any>

  @Column({ name: 'frequency_cron', type: 'varchar', length: 255 })
  frequencyCron: string

  @Column({ name: 'cron_job_id', type: 'varchar', length: 255, nullable: true })
  cronJobId: string

  @Column({ name: 'picked_courses', type: 'jsonb', default: () => "'{}'", nullable: true })
  pickedCourses: Record<string, any>

  @Column({ name: 'trigger_type', type: 'varchar', length: 100, nullable: true })
  triggerType: string

  @Column({ name: 'n8n_workflow_id', type: 'varchar', length: 255, nullable: true })
  n8nWorkflowId: string

  @OneToMany(() => AutomationFlowStep, (step) => step.automationFlow, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  steps: AutomationFlowStep[]

  @OneToMany(() => AutomationFlowCondition, (condition) => condition.flow, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  conditions: AutomationFlowCondition[]

  @OneToOne(() => InstitutionAutomationFlow, (obj) => obj.automationFlow, {
    onDelete: 'CASCADE',
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'id' })
  institutionAutomationFlow: InstitutionAutomationFlow
}
