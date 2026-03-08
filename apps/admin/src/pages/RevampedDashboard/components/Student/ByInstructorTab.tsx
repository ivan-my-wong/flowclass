import { useTranslation } from 'react-i18next'

import { StudentByItem } from '@/types/enrollCourse'

import { ByItemTable, ByItemTableLabels } from '../../ByItemTable'

interface ByInstructorTabProps {
  data?: StudentByItem[]
  isLoading: boolean
}

export const ByInstructorTab = ({ data, isLoading }: ByInstructorTabProps) => {
  const { t } = useTranslation(['onboarding'])

  const labels: ByItemTableLabels = {
    entityName: t('statistics:common.instructor'),
    emptyMessage: t('statistics:revenue.noInstructorData'),
  }

  const transformedData = data?.map(item => ({
    ...item,
    students: item.courses,
  }))

  return (
    <ByItemTable data={transformedData} isLoading={isLoading} labels={labels} />
  )
}
