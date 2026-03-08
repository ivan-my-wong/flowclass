import { Exclude } from 'class-transformer'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('identity', {
    name: 'id',
    generatedIdentity: 'BY DEFAULT',
  })
  id: number

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date

  @Exclude()
  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', default: null })
  deletedAt?: Date

  @Column({ name: 'created_by', type: 'int', nullable: true })
  createdBy: number

  @Column({ name: 'updated_by', type: 'int', nullable: true })
  updatedBy: number
}
