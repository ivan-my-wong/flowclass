import { useEffect, useState } from 'react'

import ChartDataLabels, { Context } from 'chartjs-plugin-datalabels'
import { t } from 'i18next'
import { Pie } from 'react-chartjs-2'

import ChartDatePicker from '@/components/DatePickers/ChartDatePicker'
import Text from '@/components/Texts/Text'
import Box from '@/components/ui/Box'
import useGoogleAnalytics from '@/hooks/useGoogleAnalytics'
import { ChartDate } from '@/types/chartDate.type'
import { GoogleAnalyticsDataType } from '@/types/googleAnalytics'

import { mapDataToChart } from './chartjsSetup'
import ChartStatusWrapper from './ChartStatusWrapper'

type PropTypes = {
  outerChartDate: ChartDate
}
const ChannelGroupGraph = ({ outerChartDate }: PropTypes): JSX.Element => {
  const { useFetchGoogleAnalytics } = useGoogleAnalytics()
  const [chartDate, setChartDate] = useState<ChartDate>(outerChartDate)
  const { data, isLoading, isError } = useFetchGoogleAnalytics({
    startDate: chartDate.startDate,
    endDate: chartDate.endDate,
    dataType: GoogleAnalyticsDataType.CHANNEL_GROUP,
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
              {t(`component:googleAnalytics.channelGroupFirstAcquiredTheUser`)}
            </Text>
            <ChartDatePicker
              chartDate={chartDate}
              handleChartDateChange={setChartDate}
            />
          </Box>
          <Pie
            options={{
              maintainAspectRatio: false,
              responsive: true,
              plugins: {
                legend: {
                  position: 'left',
                },
                datalabels: {
                  formatter: (value: number, ctx: Context) => {
                    if (ctx.dataset.data) {
                      const dataAsNumbers = ctx.dataset.data.map(Number)
                      const total = dataAsNumbers.reduce(
                        (a: number, b: number) => a + b,
                        0
                      )
                      const percentage = value / total
                      return `${ctx?.chart?.data?.labels?.[ctx.dataIndex]}\n${(
                        percentage * 100
                      ).toFixed(0)}%`
                    }
                    return ''
                  },
                },
              },
            }}
            plugins={[ChartDataLabels as any]}
            data={mapDataToChart({
              chartData: data,
              labelKey: 'firstUserDefaultChannelGroup',
              dataKey: 'activeUsers',
              randomColor: true,
            })}
          />
        </>
      )}
    </ChartStatusWrapper>
  )
}

export default ChannelGroupGraph
