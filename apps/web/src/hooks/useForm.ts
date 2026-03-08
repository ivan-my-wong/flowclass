import { useContext } from 'react'

import { FieldError, useFormContext } from 'react-hook-form'

import { FormFieldContext, FormItemContext } from '@/contexts/FormContext'

type ReturnTypeUseFormHook = {
  id: string
  name: string
  formItemId: string
  formDescriptionId: string
  formMessageId: string
  invalid: boolean
  isDirty: boolean
  isTouched: boolean
  error?: FieldError
}

const useFormField = (): ReturnTypeUseFormHook => {
  const fieldContext = useContext(FormFieldContext)
  const itemContext = useContext(FormItemContext)
  const { getFieldState, formState } = useFormContext()

  const fieldState = getFieldState(fieldContext.name, formState)

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>')
  }

  const { id } = itemContext

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  }
}
export default useFormField
