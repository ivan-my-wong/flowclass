import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { BaseAbstractRepository } from '@/modules/base/base.abstract.repository'

import { CommonField } from './common-field.entity'
import { CommonForm } from './common-form.entity'

@Injectable()
export class CommonFormRepository extends BaseAbstractRepository<CommonForm> {
  private _repository: Repository<CommonForm>
  private _repositoryField: Repository<CommonField>

  constructor(
    @InjectRepository(CommonForm)
    repository: Repository<CommonForm>,
    @InjectRepository(CommonField)
    repositoryField: Repository<CommonField>
  ) {
    super(repository)
    this._repository = repository
    this._repositoryField = repositoryField
  }

  async getDetailForm(formId) {
    let form: any = {}
    if (formId) {
      form = await this._repository.findOne({ where: { id: formId } })
      await Promise.all(
        form.fields.map(async (o: any, i: any) => {
          let fieldId = null
          let flag = null
          if (typeof o !== 'string') {
            fieldId = o.id
          } else {
            const [stringFlag, stringFieldId] = o.split('.')
            if (stringFieldId) {
              fieldId = parseInt(stringFieldId)
            }
            if (stringFlag) {
              flag = stringFlag
            }
          }

          const field = await this._repositoryField.findOne({
            where: { id: fieldId },
          })
          form.fields[i] = { ...field, flag: flag || 'applicant' }
        })
      )
    }
    return form
  }
}
