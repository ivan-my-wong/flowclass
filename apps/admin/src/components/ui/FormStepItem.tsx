import React, { useState } from 'react'

import { t } from 'i18next'
import { useFormContext } from 'react-hook-form'

import { cn } from '@/utils/cn'

import DottedCheckCircle from './AnimatedCheckCircle'
import { FormControl, FormField, FormItem, FormMessage } from './Form'

interface FormStepItemProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string // form field name
  label?: string | null // optional label
  isCompleted?: boolean // completion status
  required?: boolean // if field is required
  children: React.ReactNode // content to be rendered
  rules?: Record<string, any> // validation rules
  className?: string
  preserveChildStyle?: boolean
  customValueCheck?: (value: any) => boolean
  validateFields?: string[]
}

export const FormStepItem = ({
  name,
  label,
  isCompleted,
  required = false,
  children,
  rules,
  className,
  preserveChildStyle = false,
  customValueCheck,
  validateFields = [],
  ...props
}: FormStepItemProps) => {
  const form = useFormContext()
  const value = form.watch(name)

  const getHasValue = () => {
    if (customValueCheck) {
      return customValueCheck(value)
    }
    if (validateFields.length > 0) {
      return validateFields.every(field => Boolean(form.watch(field)))
    }
    return Boolean(value)
  }

  const hasValue = getHasValue()
  const isError = !!form?.formState.errors[name]
  const [wasBlurred, setWasBlurred] = useState(false)
  const isCompletedDefined = typeof isCompleted === 'boolean'
  const getStyleClassName = () => {
    if ((isCompletedDefined ? isCompleted : hasValue) && !isError) {
      return 'border-blue-100 bg-blue-50'
    }
    if (isError) {
      return 'border-red-100 bg-red-50'
    }
    return 'border-gray-200'
  }

  return (
    <div
      className={cn(
        'rounded-lg p-3 transition-all',
        getStyleClassName(),
        className
      )}
      {...props}
    >
      {/* Content */}
      <FormField
        name={name}
        rules={{
          required: required ? (t('common:errors.required') as string) : false,
          ...rules,
        }}
        render={({ field }) => (
          <FormItem className="w-full">
            <div className="flex items-center gap-[10px]">
              <DottedCheckCircle
                isCompleted={
                  (isCompletedDefined ? isCompleted : hasValue) &&
                  (!wasBlurred || !isError)
                }
                size="sm"
                dotCount={12}
              />
              {label && (
                <div className="font-medium">
                  {label}
                  {required && <span className="text-red-500 ml-1">*</span>}
                </div>
              )}
            </div>
            <FormControl>
              <div className="flex-1 pl-[34px] min-w-0">
                {React.isValidElement(children)
                  ? React.cloneElement(children as React.ReactElement, {
                      ...(Object.prototype.hasOwnProperty.call(
                        children.props,
                        'field'
                      )
                        ? { field }
                        : field),
                      onBlur: (e: React.FocusEvent<HTMLInputElement>) => {
                        setWasBlurred(true)

                        const fieldName = e.target?.name || e.target?.id

                        if (validateFields.length > 0) {
                          if (validateFields.includes(fieldName)) {
                            form.trigger(fieldName)
                            return
                          }
                        }

                        form.trigger(name)

                        if (children.props.onBlur) {
                          children.props.onBlur(e)
                        }
                      },
                      className: preserveChildStyle
                        ? children.props.className
                        : cn(
                            getStyleClassName(),
                            'px-0 py-1 h-6 border-t-0 border-x-0 rounded-none focus:border-b-primary focus-visible:ring-0 focus-visible:ring-offset-0',
                            children.props.className
                          ),
                    })
                  : children}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
