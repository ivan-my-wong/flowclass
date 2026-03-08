import { createContext } from 'react'

import { FieldPath, FieldValues } from 'react-hook-form'

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> = {
  name: TName
}

type FormItemContextValue = {
  id: string
}

const FormFieldContext = createContext<FormFieldContextValue>({} as FormFieldContextValue)

const FormItemContext = createContext<FormItemContextValue>({} as FormItemContextValue)

export { FormFieldContext, FormItemContext }
