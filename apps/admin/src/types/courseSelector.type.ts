import { MultiValue } from 'react-select'

import { DynamicTypeSelectorItemProps } from '@/components/Selector/Select'

export type ClassItem = {
  id: number
  name: string
}

export type CourseAndClassOptionProps = {
  course: string
  courseId: number
  previewImageUrl: string | null
  classes: ClassItem[]
}

export type OptionProps = DynamicTypeSelectorItemProps<number> & {
  course: string
  courseId: number
  previewImageUrl: string | null
  type?: string
}
export type CourseSelectorItem = {
  label: string
  options: OptionProps[]
}

export type CourseSelectorItemProps = {
  options?: CourseSelectorItem[]
  defaultValue?: OptionProps[]
  value?: OptionProps[]
  onChange: (data: MultiValue<OptionProps>) => void
  isDisabled?: boolean
  id?: string
  hideSelectAll?: boolean
  isMulti?: boolean
  width:
    | `${number}px`
    | `${number}%`
    | `${number}rem`
    | `${number}em`
    | 'auto'
    | 'fit-content'
  placeholder?: string
  isLoading?: boolean
}
