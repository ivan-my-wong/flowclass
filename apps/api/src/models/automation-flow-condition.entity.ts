import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { AutomationFlow } from './automation-flow.entity'

@Entity('automation_flow_conditions')
export class AutomationFlowCondition extends BaseEntity {
  @Column({ name: 'automation_flow_id', type: 'int' })
  automationFlowId: number

  @ManyToOne(() => AutomationFlow, (flow) => flow.conditions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'automation_flow_id' })
  flow: AutomationFlow

  @Column()
  field: string

  @Column()
  operator: string

  @Column()
  value: string
}
