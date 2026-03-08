import { InjectRepository } from '@nestjs/typeorm'
import { Column, Entity, Index, Repository } from 'typeorm'

import { SupportedType } from '@/application/admin/custom-messages/dto/custom-message.dto'
import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'
import { BaseEntity } from '@/modules/base/base.entity'
@Index(['studentId', 'institutionId', 'notificationType'])
@Entity('student_notification_setting')
export class StudentNotificationSetting extends BaseEntity {
  @Column({ name: 'student_id' })
  studentId: number

  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'notification_type', type: 'varchar' })
  notificationType: SupportedType

  @Column({ name: 'whatsapp', type: 'boolean', default: true })
  whatsapp: boolean

  @Column({ name: 'email', type: 'boolean', default: true })
  email: boolean
}

export class StudentNotificationSettingRepository extends BaseAbstractRepository<StudentNotificationSetting> {
  protected readonly _repository: Repository<StudentNotificationSetting>

  constructor(
    @InjectRepository(StudentNotificationSetting)
    repository: Repository<StudentNotificationSetting>
  ) {
    super(repository)
    this._repository = repository
  }

  async getByStudentAndType(studentId: number, institutionId: number, type: SupportedType) {
    return this._repository.findOneBy({
      studentId,
      institutionId,
      notificationType: type,
    })
  }
}
