import React from 'react'

import { UseFormReturn } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { cn } from '@/utils/cn'

import ProgressCircle from './ProgressCircle'

interface ProgressIndicatorProps {
  formFields?: string[]
  total?: number
  className?: string
  Form: UseFormReturn<any, any>
}

export const ProgressIndicator = ({
  formFields = [],
  total,
  className,
  Form,
}: ProgressIndicatorProps): React.ReactElement => {
  const { t } = useTranslation()
  const totalItems = total ?? formFields.length
  const completedCount = React.useMemo(() => {
    return formFields.filter(field => {
      const value = Form.watch(field)
      if (
        value === undefined ||
        value === null ||
        Form.formState.errors[field]
      ) {
        return false
      }

      if (typeof value === 'boolean') {
        return value === true
      }
      if (typeof value === 'string' || Array.isArray(value)) {
        return value.length > 0
      }
      if (typeof value === 'object' && value !== null) {
        return Object.keys(value).length > 0
      }
      return true
    }).length
  }, [formFields, Form, Form.watch, Form.formState.errors])

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="flex items-center gap-2 text-sm">
        <ProgressCircle completed={completedCount} total={totalItems} />
        <span>
          {t('component:progress.tasksComplete', {
            completedCount,
            total: totalItems,
          })}
        </span>
      </div>
    </div>
  )
}
