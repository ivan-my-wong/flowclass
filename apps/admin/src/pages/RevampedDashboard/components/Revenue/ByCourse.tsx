import { useTranslation } from 'react-i18next'

import { RevenueByItem } from '@/types/enrollCourse'

import { ByItemTable, ByItemTableLabels } from '../../ByItemTable'

interface ByCourseTabProps {
  data?: RevenueByItem[]
  isLoading: boolean
}

export const ByCourseTab = ({ data, isLoading }: ByCourseTabProps) => {
  const { t } = useTranslation(['onboarding'])

  const labels: ByItemTableLabels = {
    entityName: t('statistics:common.course'),
    emptyMessage: t('statistics:revenue.noCourseData'),
  }

  return <ByItemTable data={data} isLoading={isLoading} labels={labels} />
}
