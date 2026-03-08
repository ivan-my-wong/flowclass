import { useTranslation } from 'react-i18next'

import { RevenueByItem } from '@/types/enrollCourse'

import { ByItemTable, ByItemTableLabels } from '../../ByItemTable'

interface ByStudentTabProps {
  data?: RevenueByItem[]
  isLoading: boolean
}

export const ByStudentTab = ({ data, isLoading }: ByStudentTabProps) => {
  const { t } = useTranslation(['onboarding'])

  const labels: ByItemTableLabels = {
    entityName: t('statistics:common.student'),
    emptyMessage: t('statistics:revenue.noStudentData'),
  }

  return <ByItemTable data={data} isLoading={isLoading} labels={labels} />
}
