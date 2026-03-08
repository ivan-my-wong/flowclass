import { DefaultTFuncReturn } from 'i18next'

import { SimpleSelectorItemProps } from '@/components/Selector/Select'

export type InputMeta<ValueType = any> = {
  id?: string
  name: string
  className?: string
  label?: DefaultTFuncReturn | string
  helpText?: string
  placeholder?: string
  required?: boolean
  defaultValue?: ValueType
}

export enum DropDownMenuType {
  Section = 'Section',
  Course = 'Course',
  Session = 'Session',
  Class = 'Class',
}

export type SelectorOption = SimpleSelectorItemProps

export enum Operator {
  Contain = 'contain',
  NotContain = 'notContain',
  IsEmpty = 'isEmpty',
  NotEmpty = 'notEmpty',
  Equals = 'equals',
  Before = 'before',
  After = 'after',
}

export enum FilterMatchMode {
  All = 'all',
  Any = 'any',
}

export type OptionType = { label: string | null; value: string | number }
