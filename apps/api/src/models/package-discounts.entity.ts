import { Column, Entity, Unique } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

@Entity('package_discounts')
@Unique(['name', 'siteId', 'institutionId'])
export class PackageDiscount extends BaseEntity {
  @Column({ name: 'site_id' })
  siteId: number

  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'name' })
  name: string

  @Column({ name: 'amount_per_lesson', type: 'numeric' })
  amountPerLesson: number

  @Column({ name: 'is_all_classes', type: 'boolean', default: true })
  isAllClasses: boolean // true = applies to all classes

  @Column('int', { array: true, name: 'applicable_class_ids', nullable: true })
  applicableClassIds?: number[] // required if isAllClasses = false

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean
}
