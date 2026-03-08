import { useTranslation } from 'react-i18next'

import { StudentByItem } from '@/types/enrollCourse'

import { ByItemTable, ByItemTableLabels } from '../../ByItemTable'

interface ByStudentTabProps {
  data?: StudentByItem[]
  isLoading: boolean
}

export const ByStudentTab = ({ data, isLoading }: ByStudentTabProps) => {
  const { t } = useTranslation()

  const labels: ByItemTableLabels = {
    entityName: t('statistics:common.students'),
    emptyMessage: t('statistics:revenue.noStudentData'),
  }

  return <ByItemTable data={data} isLoading={isLoading} labels={labels} />
}
