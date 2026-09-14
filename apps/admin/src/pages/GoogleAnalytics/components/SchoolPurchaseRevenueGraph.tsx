import { useEffect, useState } from 'react'

import { t } from 'i18next'
import { Line } from 'react-chartjs-2'
import { useRecoilValue } from 'recoil'

import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import useGoogleAnalytics from '@/hooks/useGoogleAnalytics'
import { schoolState } from '@/stores/schoolData'
import { ChartDate } from '@/types/chartDate.type'
import { SchoolCourseRevenueAmount } from '@/types/dataAnalytics'
import { addMissingData } from '@/utils/dataAnalytics'
import { getFormatDate } from '@/utils/timeFormat'

import { getLineChartOptions, mapDataToChart } from './chartjsSetup'
import ChartStatusWrapper from './ChartStatusWrapper'

type PropTypes = {
  outerChartDate: ChartDate
}
const SchoolPurchaseRevenueGraph = ({
  outerChartDate,
}: PropTypes): JSX.Element => {
  const { useFetchRevenueAnalytics } = useGoogleAnalytics()
  const schoolData = useRecoilValue(schoolState)
  const currentSchoolId = schoolData.currentSchool?.id || 0

  const { data, isLoading, isError, refetch } = useFetchRevenueAnalytics({
    institutionId: currentSchoolId,
    startDate: outerChartDate.startDate,
    endDate: outerChartDate.endDate,
  })

  const [eachDayData, setEachDayData] = useState<SchoolCourseRevenueAmount[]>(
    data ?? []
  )

  useEffect(() => {
    refetch().then(res => {
      const formattedData = addMissingData(res.data ?? [], outerChartDate).map(
        item => {
          const date = getFormatDate(item.date)

          return {
            totalAmount: item.totalAmount,
            date,
          }
        }
      )
      setEachDayData(formattedData)
    })
  }, [outerChartDate])

  return (
    <ChartStatusWrapper isLoading={isLoading} isError={isError}>
      {data && (
        <>
          <Box justify="center" direction="col">
            <Text bold>
              {t(`component:googleAnalytics.schoolTotalPurchaseRevenue`)}
            </Text>
          </Box>
          <Line
            data={mapDataToChart({
              chartData: eachDayData,
              labelKey: 'date',
              dataKey: 'totalAmount',
              label: `${t(`component:googleAnalytics.revenue`)} (${
                schoolData.currentSchool?.siteSetting?.currency
              })`,
            })}
            options={getLineChartOptions()}
          />
        </>
      )}
    </ChartStatusWrapper>
  )
}

export default SchoolPurchaseRevenueGraph
