import { useEffect, useState } from 'react'

import { t } from 'i18next'
import { Bar } from 'react-chartjs-2'

import ChartDatePicker from '@/components/DatePickers/ChartDatePicker'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import useGoogleAnalytics from '@/hooks/useGoogleAnalytics'
import { ChartDate } from '@/types/chartDate.type'
import { GoogleAnalyticsDataType } from '@/types/googleAnalytics'

import { getBarChartOptions, mapDataToChart } from './chartjsSetup'
import ChartStatusWrapper from './ChartStatusWrapper'

type PropTypes = {
  outerChartDate: ChartDate
}
const VisitorCountryGraph = ({ outerChartDate }: PropTypes): JSX.Element => {
  const { useFetchGoogleAnalytics } = useGoogleAnalytics()
  const [chartDate, setChartDate] = useState<ChartDate>(outerChartDate)
  const { data, isLoading, isError } = useFetchGoogleAnalytics({
    startDate: chartDate.startDate,
    endDate: chartDate.endDate,
    dataType: GoogleAnalyticsDataType.VISITOR_COUNTRY,
  })
  useEffect(() => {
    setChartDate(outerChartDate)
  }, [outerChartDate])

  if (!data) {
    return <></>
  }

  return (
    <ChartStatusWrapper isLoading={isLoading} isError={isError}>
      {data && (
        <>
          <Box justify="center" direction="col">
            <Text bold>
              {t(`component:googleAnalytics.visitorCountByCountry`)}
            </Text>
            <ChartDatePicker
              chartDate={chartDate}
              handleChartDateChange={setChartDate}
            />
          </Box>
          <Bar
            data={mapDataToChart({
              chartData: data,
              labelKey: 'country',
              dataKey: 'activeUsers',
            })}
            options={getBarChartOptions()}
          />
        </>
      )}
    </ChartStatusWrapper>
  )
}

export default VisitorCountryGraph
