import { Column, Entity, JoinColumn, OneToOne } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { AutomationFlow } from './automation-flow.entity'

@Entity('institution_automation_flow')
export class InstitutionAutomationFlow extends BaseEntity {
  @Column({ name: 'institution_id', type: 'int' })
  institutionId: number

  @Column({ name: 'automation_flow_id', type: 'int' })
  automationFlowId: number

  @OneToOne(() => AutomationFlow, (automationFLow) => automationFLow.institutionAutomationFlow, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'automation_flow_id' })
  automationFlow: AutomationFlow

  @Column({ type: 'boolean', default: true, nullable: true })
  enabled: boolean

  @Column({ name: 'activated_count', type: 'int', default: 0, nullable: true })
  activatedCount: number
}
