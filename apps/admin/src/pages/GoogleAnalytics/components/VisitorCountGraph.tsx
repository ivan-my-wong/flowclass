import { useEffect, useState } from 'react'

import { t } from 'i18next'
import { Line } from 'react-chartjs-2'

import ChartDatePicker from '@/components/DatePickers/ChartDatePicker'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import { ChartDate } from '@/types/chartDate.type'
import { VisitorCountData } from '@/types/googleAnalytics'

import { getLineChartOptions, mapDataToChart } from './chartjsSetup'
import ChartStatusWrapper from './ChartStatusWrapper'

type PropTypes = {
  data?: VisitorCountData[]
  isLoading: boolean
  isError: boolean
  outerChartDate: ChartDate
}
const VisitorCountGraph = ({
  data,
  isLoading,
  isError,
  outerChartDate,
}: PropTypes): JSX.Element => {
  const [chartDate, setChartDate] = useState<ChartDate>(outerChartDate)
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
              {t(`component:googleAnalytics.dailyWebsiteVisitorCount`)}
            </Text>
            <ChartDatePicker
              chartDate={chartDate}
              handleChartDateChange={setChartDate}
            />
          </Box>
          <Line
            data={mapDataToChart({
              chartData: data,
              labelKey: 'date',
              dataKey: 'eventCount',
            })}
            options={getLineChartOptions()}
          />
        </>
      )}
    </ChartStatusWrapper>
  )
}

export default VisitorCountGraph
