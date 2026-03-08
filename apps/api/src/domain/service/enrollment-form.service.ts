import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import * as _ from 'lodash'
import { In, IsNull, Repository } from 'typeorm'
import validator from 'validator'

import {
  AssignFormForCourseDto,
  ChangeFieldStatusDto,
  CreateFieldDto,
  CreateFormDto,
  FormDetailDto,
  ReOrderDto,
  UpdateFieldDto,
  UpdateFormDto,
} from '@/application/admin/enrollment-form/dtos/enrollment-form.dto'
import { ApiError } from '@/common/api-formats/api-error'
import { DEFAULT_FIELD } from '@/common/constants'
import { ErrorCode } from '@/exceptions/error-message/errors'
import { CommonField, FieldMapping, FieldType } from '@/models/common-field.entity'
import { CommonForm } from '@/models/common-form.entity'
import { Course } from '@/models/courses.entity'
import { parseStringToArray } from '@/utils/string.utils'

@Injectable()
export class EnrollmentFormService {
  constructor(
    @InjectRepository(CommonField)
    private readonly fieldRepository: Repository<CommonField>,
    @InjectRepository(CommonForm)
    private readonly formRepository: Repository<CommonForm>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>
  ) {}

  async getCreateFieldOpt() {
    return Object.values(FieldType)
  }

  async createField(params: CreateFieldDto): Promise<CommonField> {
    const ex = await this.fieldRepository.findOneBy({
      question: params.question,
      institutionId: params.institutionId,
    })

    if (ex || _.findIndex(DEFAULT_FIELD, ['question', params.question]) != -1)
      throw new ApiError(ErrorCode.FIELD_ALREADY_EXIST)

    const create = this.fieldRepository.create({
      ...params,
      order: 99,
    })

    return await this.fieldRepository.save(create)
  }

  async updateField(params: UpdateFieldDto) {
    const field = await this.fieldRepository.findOneBy({ id: params.fieldId })

    if (!field) throw new ApiError(ErrorCode.FIELD_NOT_FOUND)

    // const ex = await this.fieldRepository.findOneBy({
    //   question: params.question,
    //   institutionId: params.institutionId,
    // })

    // if (ex || _.findIndex(DEFAULT_FIELD, ['question', params.question]) != -1)
    //   throw new ApiError(ErrorCode.FIELD_ALREADY_EXIST)

    return await this.fieldRepository.save({
      ...field,
      ..._.omit(params, ['fieldId']),
    })
  }

  async deleteField(fieldId: number) {
    const field = await this.fieldRepository.findOneById(fieldId)

    if (!field) throw new ApiError(ErrorCode.FIELD_NOT_FOUND)

    return await this.fieldRepository.softDelete(fieldId)
  }

  async changeFieldStatus(params: ChangeFieldStatusDto) {
    const field = await this.fieldRepository.findOneById(params.fieldId)

    if (!field) throw new ApiError(ErrorCode.FIELD_NOT_FOUND)

    field.status = params.status

    return await this.fieldRepository.save(field)
  }

  async getOrCreateDefaultFields(institutionId: number): Promise<CommonField[]> {
    let nameField = await this.fieldRepository.findOneBy({
      institutionId,
      isDefault: true,
      // isRequire: true,
      columnMapping: FieldMapping.NAME,
    })

    if (!nameField) {
      nameField = await this.fieldRepository.save(
        this.fieldRepository.create({
          ...DEFAULT_FIELD[0],
          institutionId,
          isRequire: true,
          order: 0,
        })
      )
    }

    let phoneField = await this.fieldRepository.findOneBy({
      institutionId,
      isDefault: true,
      // isRequire: true,
      columnMapping: FieldMapping.PHONE,
    })

    if (!phoneField) {
      phoneField = await this.fieldRepository.save(
        this.fieldRepository.create({
          ...DEFAULT_FIELD[1],
          institutionId,
          isRequire: true,
          order: 1,
        })
      )
    }

    let emailField = await this.fieldRepository.findOneBy({
      institutionId,
      isDefault: true,
      // isRequire: true,
      columnMapping: FieldMapping.EMAIL,
    })

    if (!emailField) {
      emailField = await this.fieldRepository.save(
        this.fieldRepository.create({
          ...DEFAULT_FIELD[2],
          institutionId,
          isRequire: true,
          order: 2,
        })
      )
    }

    return [nameField, emailField, phoneField]
  }

  async getFields(institutionId: number) {
    await this.getOrCreateDefaultFields(institutionId)
    return await this.fieldRepository.find({
      where: {
        institutionId,
      },
      order: {
        order: 'ASC',
      },
    })
  }

  async getFieldDetail(fieldId: number) {
    const field = await this.fieldRepository.findOneById(fieldId)

    if (!field) throw new ApiError(ErrorCode.FIELD_NOT_FOUND)

    return field
  }

  async getCourses(institutionId: number) {
    return await this.courseRepository.find({
      select: ['id', 'name'],
      where: {
        institutionId,
        formId: IsNull(),
      },
    })
  }

  async reOrder(params: ReOrderDto) {
    const fields = await this.fieldRepository.findBy({
      id: In(params.order),
    })

    if (_.size(params.order) != _.size(fields)) throw new ApiError(ErrorCode.FIELD_NOT_FOUND)

    const converts = _.reduce(
      fields,
      (data, item) => {
        data[item.id] = item

        return data
      },
      []
    )

    for (const i in params.order) {
      const id = params.order[i]

      if (converts[id]) {
        converts[id].order = i
      }
    }

    return await this.fieldRepository.save(fields)
  }

  async createForm(params: CreateFormDto): Promise<CommonForm> {
    let fieldIds = []
    // Test if params.fields is a number, if it is, then it is a default field
    // Check if params.fields is a list of strings
    if (Array.isArray(params.fields) && params.fields.every((field) => typeof field === 'string')) {
      fieldIds = params.fields.map((o) => +o.split('.')[1])
    } else {
      fieldIds = params.fields
    }
    const fields = await this.fieldRepository.countBy({
      id: In(fieldIds),
    })

    // const fields = await this.fieldRepository.countBy({
    //   id: In(params.fields),
    // })

    if (_.size(params.fields) != fields) throw new ApiError(ErrorCode.FIELD_NOT_FOUND)

    const courses = await this.courseRepository.countBy({
      id: In(params.courses),
    })

    if (_.size(params.courses) != courses) throw new ApiError(ErrorCode.COURSE_NOT_FOUND)

    const create = this.formRepository.create({
      institutionId: params.institutionId,
      name: params.name,
      description: params.description,
      fields: params.fields,
    })

    const form = await this.formRepository.save(create)

    const courseUps = _.map(courses, (c) => {
      return { ...c, formId: form.id }
    })

    await this.courseRepository.save(courseUps)

    return form
  }

  async updateForm(params: UpdateFormDto): Promise<CommonForm> {
    const ex = await this.formRepository.findOneById(params.formId)

    if (!ex) throw new ApiError(ErrorCode.FORM_NOT_FOUND)

    let fieldIds = []
    // Check if params.fields is a list of strings
    if (Array.isArray(params.fields) && params.fields.every((field) => typeof field === 'string')) {
      fieldIds = params.fields.map((o) => +o.split('.')[1])
    } else {
      fieldIds = params.fields
    }

    const fields = await this.fieldRepository.findBy({
      id: In(fieldIds),
    })

    if (_.size(params.fields) != _.size(fields)) throw new ApiError(ErrorCode.FIELD_NOT_FOUND)

    if (_.size(params.courses) > 0) {
      const courses = await this.courseRepository.findBy({
        id: In(params.courses),
      })

      if (_.size(params.courses) != _.size(courses)) throw new ApiError(ErrorCode.COURSE_NOT_FOUND)
    }

    const field = await this.formRepository.save({
      ...ex,
      ..._.omit(params, ['courses']),
    })

    // Not sure what this code does

    // const currentCourses = await this.courseRepository.findBy({ formId: ex.id })

    // const up = []

    // if (_.size(params.courses) > 0 && _.size(currentCourses) == 0) {
    //   for (const id of params.courses) {
    //     up.push(this.courseRepository.update({ id }, { formId: ex.id }))
    //   }

    //   await Promise.all(up)

    //   return field
    // }

    // const cIds = _.map(currentCourses, (course) => course.id)
    // const courseUp = _.difference(params.courses, cIds)
    // const courseDel = _.difference(cIds, params.courses)

    // if (_.size(courseUp) > 0) {
    //   for (const id of courseUp) {
    //     up.push(this.courseRepository.update({ id }, { formId: field.id }))
    //   }
    // }

    // if (_.size(courseDel) > 0) {
    //   for (const id of courseDel) {
    //     up.push(this.courseRepository.update({ id }, { formId: null }))
    //   }
    // }

    // await Promise.all(up)

    return field
  }

  async deleteForm(formId: number) {
    const ex = await this.formRepository.findOneById(formId)

    if (!ex) throw new ApiError(ErrorCode.FORM_NOT_FOUND)

    return await this.formRepository.softDelete({ id: formId })
  }

  async getForms(institutionId: number) {
    const forms = await this.formRepository.findBy({
      institutionId,
    })
    return forms
  }

  async createDefaultForms(institutionId: number): Promise<CommonForm[]> {
    const fields = await this.getOrCreateDefaultFields(institutionId)
    const formInstance = this.formRepository.create({
      institutionId,
      name: 'Default Form',
      description: 'Default Form',
      fields: fields.map((f) => `applicant.${f.id}`),
    })

    const form = await this.formRepository.save(formInstance)
    return [form]
  }

  async getFormDetail(params: FormDetailDto) {
    const form = await this.formRepository.findOneById(params.id)

    if (!form) throw new ApiError(ErrorCode.FORM_NOT_FOUND)

    let fieldIds = []
    // Check if params.fields is a list of strings
    if (Array.isArray(form.fields) && form.fields.every((field) => typeof field === 'string')) {
      fieldIds = form.fields.map((o) => +o.split('.')[1])
    } else {
      fieldIds = form.fields
    }
    const fields = await this.fieldRepository.findBy({
      id: In(fieldIds),
    })

    // const fields = await this.fieldRepository.findBy({
    //   id: In(form.fields),
    // })

    const cFields = _.reduce(
      fields,
      (data, field) => {
        data[field.id] = field

        return data
      },
      []
    )

    const mapFieldByOrder = _.reduce(
      form.fields,
      (data, key: string) => {
        if (typeof key === 'string') {
          const [flag, fieldId] = key.split('.')
          if (cFields[fieldId]) {
            data.push({ ...cFields[fieldId], flag })
          }
        } else {
          data.push(cFields[key])
        }

        return data
      },
      []
    )

    const courses = await this.courseRepository.find({
      select: ['id', 'name'],
      where: {
        formId: params.id,
      },
    })

    if (params.isDefault) {
      return {
        ...form,
        fields: [...DEFAULT_FIELD, ...mapFieldByOrder],
        courses,
      }
    } else {
      return { ...form, fields: mapFieldByOrder, courses }
    }
  }

  async assignFormForCourse(params: AssignFormForCourseDto) {
    const course = await this.courseRepository.findOneBy({ id: params.courseId })

    if (!course) throw new ApiError(ErrorCode.FORM_NOT_FOUND)
    if (params.formId === null) {
      // Unassign
      course.formId = null
    } else {
      // Assign
      const form = await this.formRepository.findOneBy({ id: params.formId })
      if (!form) throw new ApiError(ErrorCode.FORM_NOT_FOUND)
      course.formId = params.formId
    }

    return await this.courseRepository.save(course)
  }

  async validateCustomField(customField: CommonField, value: any) {
    const stringValue = String(value ?? '').trim()

    console.log('Validating custom field:')
    console.log('Field:', customField)
    console.log('Raw value:', value, ' | Type:', typeof value)
    console.log('Parsed string value:', stringValue)

    switch (customField.type) {
      case FieldType.NUMBER:
        return !isNaN(Number(stringValue))
      case FieldType.DATE:
        if (!stringValue) return false
        if (!isNaN(Number(stringValue))) {
          const jsDate = new Date(Math.round((Number(stringValue) - 25569) * 86400 * 1000))
          return !isNaN(jsDate.getTime())
        }
        return !isNaN(Date.parse(stringValue))
      case FieldType.EMAIL:
        return validator.isEmail(stringValue)
      case FieldType.PHONE:
        return validator.isMobilePhone(value.toString())
      case FieldType.SWITCH:
        return stringValue === 'true' || stringValue === 'false'
      case FieldType.MULTIPLE_CHOICE:
        return Array.isArray(parseStringToArray(stringValue))
      case FieldType.CHECKBOX:
      case FieldType.DROPDOWN_LIST:
        return Array.isArray(value)
      default:
        return true
    }
  }
}
