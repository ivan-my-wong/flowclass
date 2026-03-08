import { useTranslation } from 'react-i18next'

import { RevenueByItem } from '@/types/enrollCourse'

import { ByItemTable, ByItemTableLabels } from '../../ByItemTable'

interface ByInstructorTabProps {
  data?: RevenueByItem[]
  isLoading: boolean
}

export const ByInstructorTab = ({ data, isLoading }: ByInstructorTabProps) => {
  const { t } = useTranslation(['onboarding'])

  const labels: ByItemTableLabels = {
    entityName: t('statistics:common.instructor'),
    emptyMessage: t('statistics:revenue.noInstructorData'),
  }

  return <ByItemTable data={data} isLoading={isLoading} labels={labels} />
}
