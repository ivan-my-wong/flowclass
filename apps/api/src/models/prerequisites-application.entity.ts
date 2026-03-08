import { Column, Entity } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

enum PrerequisiteOperatorEnum {
  AND = 'AND',
  OR = 'OR',
}

@Entity({ name: 'prerequisites_condition' })
export class PrerequisitesCondition extends BaseEntity {
  @Column({ name: 'class_id' })
  classId: number

  @Column({ name: 'course_id' })
  courseId: number

  @Column({ name: 'operator', type: 'enum', enum: PrerequisiteOperatorEnum })
  operator: PrerequisiteOperatorEnum

  @Column({ name: 'group_id' })
  groupId: number
}

@Entity({ name: 'prerequisites_condition_group' })
export class PrerequisitesConditionGroup extends BaseEntity {
  @Column({ name: 'prerequisite_id' })
  prerequisiteId: number
}

@Entity({ name: 'prerequisites_application' })
export class PrerequisitesApplication extends BaseEntity {
  @Column({ name: 'course_id' })
  courseId: number
}
