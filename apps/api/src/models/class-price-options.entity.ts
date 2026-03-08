import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm'

import { BaseEntity } from '@/modules/base/base.entity'

import { ClassEntity } from './classes.entity'
import { PriceType } from './enums'

@Entity('class_price_options')
export class ClassPriceOption extends BaseEntity {
  @Index('IX_class_price_options_class_id')
  @Column({ name: 'class_id' })
  classId: number

  @ManyToOne(() => ClassEntity, (classEntity) => classEntity.priceOptions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'class_id' })
  classEntity: ClassEntity

  @Column({ name: 'price_type', type: 'varchar', nullable: false })
  priceType: PriceType

  @Column({ name: 'amount', type: 'numeric', default: 0 })
  amount: number

  @Column({ name: 'number_of_lessons', type: 'int', default: 1 })
  numberOfLessons: number

  @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
  name: string
}
