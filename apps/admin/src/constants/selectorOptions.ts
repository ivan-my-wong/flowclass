import { t } from 'i18next'

import { FilterMatchMode, Operator, SelectorOption } from '@/types/options'

const selectorOptions = (): Record<string, any> => {
  const operatorItems: SelectorOption[] = [
    {
      value: Operator.Contain,
      label: t('student:customFieldFilter.contain') as string,
    },
    {
      value: Operator.NotContain,
      label: t('student:customFieldFilter.notContain') as string,
    },
    {
      value: Operator.IsEmpty,
      label: t('student:customFieldFilter.isEmpty') as string,
    },
    {
      value: Operator.NotEmpty,
      label: t('student:customFieldFilter.isNotEmpty') as string,
    },
    {
      value: Operator.Before,
      label: t('student:customFieldFilter.before') as string,
    },
    {
      value: Operator.After,
      label: t('student:customFieldFilter.after') as string,
    },
  ]
  const matchModeItems = [
    {
      itemValues: [
        {
          value: FilterMatchMode.All,
          label: t('student:customFieldFilter.matchAll') as string,
        },
        {
          value: FilterMatchMode.Any,
          label: t('student:customFieldFilter.matchAny') as string,
        },
      ],
    },
  ]
  return {
    operatorItems,
    matchModeItems,
  }
}

export default selectorOptions
