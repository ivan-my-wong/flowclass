import { FieldTypes } from '../constants/enrollmentFormFieldNames'

import { Course } from './course'

export enum FlagInformationFieldTypes {
  common = 'common',
  applicant = 'applicant',
}

export type InformationFieldTypes = {
  institutionId?: number
  id?: number
  fieldId?: number
  question: string
  description?: string
  type: FieldTypes
  option?: string[]
  isRequire?: boolean
  checked?: boolean
  isDefault: boolean
  order: number
  value?: string[] | string | number | boolean | Date
  flag?: FlagInformationFieldTypes
  columnMapping?: string
}

export type DefaultInformationFieldTypes = {
  question: string
  type: FieldTypes
  isDefault: boolean
}

export type CreateInformationFieldTypes = {
  institutionId: number
  question: string
  description?: string
  type: FieldTypes
  option?: string[]
  isRequire: boolean
}

export type ApplicationFormTypes = {
  id: number | null
  formId: number | null
  institutionId: number
  name: string
  updatedAt: Date
  description: string
  fields: string[] | InformationFieldTypes[]
  courses: number[] | Course[]
}

export type CreateApplicationFormTypes = {
  name: string
  institutionId: number
  description: string
  fields: string[] | InformationFieldTypes[]
  courses: number[] | Course[]
}

export type DetailApplicationFormTypes = {
  id: number
  formId: number | null
  institutionId: number
  name: string
  updatedAt: Date
  description: string
  fields: number[] | InformationFieldTypes[]
  courses: Course[]
}

export type CustomField = {
  id: number
  type: string
  question: string
  value: string
}
