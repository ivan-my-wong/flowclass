import { useTranslation } from 'react-i18next'

import { RevenueByItem } from '@/types/enrollCourse'

import { ByItemTable, ByItemTableLabels } from '../../ByItemTable'

interface ByClassTabProps {
  data?: RevenueByItem[]
  isLoading: boolean
}

export const ByClassTab = ({ data, isLoading }: ByClassTabProps) => {
  const { t } = useTranslation(['onboarding'])

  const labels: ByItemTableLabels = {
    entityName: t('statistics:common.class'),
    emptyMessage: t('statistics:revenue.noClassData'),
  }

  return <ByItemTable data={data} isLoading={isLoading} labels={labels} />
}
