// eslint-disable-next-line simple-import-sort/imports
import { Invoice } from '@/models/invoice.entity'
import { BaseEntity } from '@/modules/base/base.entity'

import { ClassEntity } from './classes.entity'
import { CommentEntity } from './comments.entity'
import { CourseActivitiesOrderEntity } from './course-activities-order.entity'
import { IPrerequisite } from './custom-types/prerequisites'
import { Institution } from './institutions.entity'
import { SeoContent } from './seo-setting.entity'
import { Site } from './site.entity'

import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator'
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany, OneToOne } from 'typeorm'
import { InstructorRate } from './instructor-rates.entity'

export class LongDescription {
  @IsNotEmpty()
  sectionTitle: string

  @IsNotEmpty()
  content: string

  static example = {
    sectionTitle: 'title',
    content: 'This is the content',
  }

  static type_definition = {
    type: 'object',
    properties: {
      sectionTitle: { type: 'string' },
      content: { type: 'string' },
    },
  }
}

export class FrequentlyAskedQuestion {
  @IsNotEmpty()
  question: string

  @IsNotEmpty()
  answer: string

  static example = {
    question: 'What is this?',
    answer: 'This is it',
  }

  static type_definition = {
    type: 'object',
    properties: {
      question: { type: 'string' },
      answer: { type: 'string' },
    },
  }
}

export class CFOption {
  @IsNotEmpty()
  label: string

  @IsNotEmpty()
  name: string
}

export class CustomField {
  static fromJSON(json: any) {
    const custom = new CustomField()
    Object.assign(custom, json)
    return custom
  }

  @IsNotEmpty()
  id: string // unique id for frontend rendering and storing data

  @IsOptional()
  fieldKey: string // For tags or categories of the field

  @IsString()
  description: string // The question text body

  @IsString()
  @IsNotEmpty()
  inputType: string // input_text | input_number | text_area | radio_group | checkbox | select | toggle_switch

  @IsString()
  @IsNotEmpty()
  validation: string // email, phone_number, not_empty, date, date_range

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CFOption)
  @ArrayMinSize(0, { message: 'fieldData is required and must be an array ' })
  fieldData: CFOption[] // [an array of radio options | checkbox option | dropdown option] can be empty if dataType is primitive

  static example = {
    id: 'id',
    // fieldName: 'sen',
    // id: 'key name for json validation (json key) ex: sen',
    fieldKey: 'sen',
    inputType:
      'input_text (text) | input_number | text_area (paragraph) | radio_group (radio) | checkbox | select | toggle_switch',
    description: 'Description about the field, ex: Do you need special assistance?',
    validation: 'Validation rule: number | email | not_empty | date | required',
    fieldData: [
      {
        label: 'Options of select or radio group',
        name: 'option_1',
      },
      {
        label: 'Option two',
        name: 'option_2',
      },
      {
        label: 'Option three',
        name: 'option_3',
      },
    ],
  }

  getOptionSet() {
    const options = new Array<string>()
    for (let i = 0; i < this.fieldData.length; i++) {
      options.push(this.fieldData[i].name)
    }
    const optionSet = new Set(options)
    return optionSet
  }

  getOptionString() {
    let str = ''
    for (let i = 0; i < this.fieldData.length - 1; i++) {
      str = str.concat(this.fieldData[i].name + ', ')
    }
    str = str.concat(this.fieldData[this.fieldData.length - 1].name)
    return str
  }

  static EMAIL_REG = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
  static NUMBER_REG = /^[\d]+$/
  static DATE_1 = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/
  static DATE_2 = /^\d{4}\-(0[1-9]|1[012])\-(0[1-9]|[12][0-9]|3[01])$/
  validateCustomField(value: string): { valid: boolean; message: string } {
    const rules = this.validation.split(/\s*\|\s*|\s*,\s*|\s*,\s*/) // split delimiters will be either " | " or "|" or ", " or ","
    const ruleSet = new Set(rules)
    if (ruleSet.has('not_empty')) {
      if (!value || value.length === 0) {
        return { valid: false, message: `${this.id} can not be empty` }
      }
    }
    if (ruleSet.has('boolean')) {
      const res = value === 'true' || value === 'false'
      if (!res) {
        return {
          valid: false,
          message: `${this.id} is not a valid boolean: ${value}`,
        }
      }
    } else if (ruleSet.has('number')) {
      const res = CustomField.NUMBER_REG.test(value)
      if (!res) {
        return {
          valid: false,
          message: `${this.id} is not a valid number: ${value}`,
        }
      }
    } else if (ruleSet.has('date')) {
      const res = CustomField.DATE_1.test(value) || CustomField.DATE_2.test(value)
      if (!res) {
        return {
          valid: false,
          message: `${this.id} is not a valid date string: ${value}`,
        }
      }
    } else if (ruleSet.has('email')) {
      const res = CustomField.EMAIL_REG.test(value)
      if (!res) {
        return { valid: false, message: 'Email format is invalid: ' + value }
      }
    }
    if (this.inputType === 'radio_group' || this.inputType === 'select') {
      const optionSet = this.getOptionSet()
      const optionsString = this.getOptionString()
      if (!optionSet.has(value) && value !== null && value !== '') {
        return {
          valid: false,
          message: `${value} is not a valid data of ${this.id}. (${optionsString})`,
        }
      }
    } else if (this.inputType === 'checkbox') {
      if (value === null || value === '') {
        return { valid: true, message: '' }
      }
      const optionSet = this.getOptionSet()
      const vals = value.split(',')
      for (let i = 0; i < vals.length; i++) {
        const val = vals[i]
        if (!optionSet.has(val)) {
          return {
            valid: false,
            message: `${val} is not a valid data of ${this.id}`,
          }
        }
      }
    } else if (this.inputType === 'toggle_switch') {
      if (value === null || value === '') {
        return { valid: false, message: `${this.id} can not be null or empty` }
      }
      if (value !== 'true' && value !== 'false' && typeof value !== 'boolean') {
        return {
          valid: false,
          message: `${this.id} must be true or false. got ${value}`,
        }
      }
    }
    return { valid: true, message: '' } // MOCK
  }
}

export class Tag {
  @IsNotEmpty()
  key: string

  @IsNotEmpty()
  value: string[]

  @IsNotEmpty()
  searchable: boolean

  static example = {
    key: 'key1',
    value: ['value1', 'value2'],
    searchable: true,
  }

  static type_definition = {
    type: 'object',
    properties: {
      key: { type: 'string' },
      value: { type: 'array' },
      searchable: { type: 'boolean' },
    },
  }
}

export interface EmailSettings {
  emailTitle?: string
  emailId?: string
}

@Entity('courses')
export class Course extends BaseEntity {
  @Index('IX_courses_site_id')
  @Column({ name: 'site_id' })
  siteId: number

  @Index('IX_courses_institution_id')
  @Column({ name: 'institution_id' })
  institutionId: number

  @Column({ name: 'name' })
  name: string

  // [TO BE DELETED] To be dropped after migration
  // @Column({ name: 'type', nullable: true })
  // type: string;

  @Column('jsonb', { name: 'seo_content', nullable: true })
  seoContent: SeoContent

  @Column('jsonb', { name: 'long_description', nullable: true })
  longDescriptions?: LongDescription[]

  @Column('jsonb', { name: 'faq', nullable: true })
  faqs?: FrequentlyAskedQuestion[]

  @Column({ name: 'online_booking', default: true })
  onlineBooking: boolean

  @Column({ name: 'registration_mes', nullable: true })
  registrationMes: string

  @Column('jsonb', { name: 'custom_fields', nullable: true })
  customFields?: CustomField[]

  @Column({ name: 'preview_image_url', nullable: true })
  previewImageUrl: string

  @Column({ name: 'preview_video_url', nullable: true })
  previewVideoUrl: string

  @Column({ name: 'view_limit', type: 'int', default: 0 })
  viewLimit: number

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number

  @Column({ name: 'published', type: 'boolean', default: false })
  published: boolean

  @Column({ name: 'is_private', type: 'boolean', default: false })
  isPrivate: boolean

  @Column({ name: 'rating', type: 'double precision', default: 0 })
  rating: number

  @Column({ name: 'total_rater', type: 'int', default: 0 })
  totalRater: number

  @Column({ name: 'comments_count', type: 'int', default: 0 })
  commentCount: number

  @Column({ name: 'path', nullable: true })
  path: string

  @Column({ name: 'recruit_start', nullable: true })
  recruitStart?: string

  @Column({ name: 'recruit_end', nullable: true })
  recruitEnd?: string

  @Column({ name: 'use_qr_attendance', default: false })
  useQrAttendance?: boolean

  @Column({ name: 'require_email_verification', default: false })
  requireEmailVerification?: boolean

  @Column({ name: 'block_duplicate_email_enrollment', default: false })
  blockDuplicateEmailEnrollment?: boolean

  @Column('jsonb', { name: 'tags', nullable: true })
  tags?: Tag[]

  @Column({ name: 'form_id', nullable: true })
  formId: number

  @Column({ name: 'prerequisites', type: 'jsonb', nullable: true })
  prerequisites?: IPrerequisite

  @ManyToOne(() => Site, (site) => site.courses, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'site_id' })
  site: Site

  @ManyToOne(() => Institution, (institution) => institution.courses, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'institution_id' })
  institution: Institution

  @OneToMany(() => ClassEntity, (classEntity) => classEntity.course)
  classes: ClassEntity[]

  @OneToMany(() => CommentEntity, (comment) => comment.course)
  comments: CommentEntity[]

  @OneToMany(() => Invoice, (invoice) => invoice.course)
  invoices: Invoice[]

  @OneToOne(
    () => CourseActivitiesOrderEntity,
    (courseActivitiesOrderEntity) => courseActivitiesOrderEntity.course,
    {
      createForeignKeyConstraints: false,
    }
  )
  courseActivitiesOrder: CourseActivitiesOrderEntity

  @OneToMany(() => InstructorRate, (instructorRate) => instructorRate.course)
  instructorRates: InstructorRate[]

  @Index('IX_courses_is_archived')
  @Column({ name: 'is_archived', type: 'boolean', default: false })
  isArchived: boolean

  @Column('jsonb', { name: 'email_settings', nullable: true })
  emailSettings?: EmailSettings

  @Column({ name: 'course_code', nullable: true })
  courseCode: string
}
