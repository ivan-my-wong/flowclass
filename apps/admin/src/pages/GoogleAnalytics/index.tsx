import { useEffect, useState } from 'react'

import { useTranslation } from 'react-i18next'
import { useRecoilValue } from 'recoil'

import ChartDatePicker from '@/components/DatePickers/ChartDatePicker'
import Heading from '@/components/Texts/Heading'
import Box from '@/components/ui/Box'
import useGoogleAnalytics from '@/hooks/useGoogleAnalytics'
import { schoolState } from '@/stores/schoolData'
import { styled } from '@/styles'
import { ChartDate } from '@/types/chartDate.type'
import {
  GoogleAnalyticsDataType,
  VisitorCountData,
} from '@/types/googleAnalytics'

import ChannelGroupGraph from './components/ChannelGroupGraph'
import { getInitialChartDateRange } from './components/chartjsSetup'
import CoursePurchaseRevenueGraph from './components/CoursePurchaseRevenueGraph'
import PageCountGraph from './components/PageCountGraph'
import SchoolPurchaseRevenueGraph from './components/SchoolPurchaseRevenueGraph'
import VisitorCountGraph from './components/VisitorCountGraph'
import VisitorCountryGraph from './components/VisitorCountryGraph'

import './components/chartjsModule'

const GoogleAnalytics = (): JSX.Element => {
  const schoolData = useRecoilValue(schoolState)
  const currentSchoolId = schoolData.currentSchool?.id || 0
  const { useFetchGoogleAnalytics, useFetchRevenueAnalytics } =
    useGoogleAnalytics()
  const [noAnalyticsData, setNoAnalyticsData] = useState(false)
  const [noRevenueData, setNoRevenueData] = useState(false)
  const { t } = useTranslation()

  const [outerChartDate, setOuterChartDate] = useState<ChartDate>(
    getInitialChartDateRange({
      daysBeforeStart: 7,
      daysBeforeEnd: 0,
    })
  )

  const { data, isLoading, isError } = useFetchGoogleAnalytics({
    startDate: outerChartDate.startDate,
    endDate: outerChartDate.endDate,
    dataType: GoogleAnalyticsDataType.VISITOR_COUNT,
  })

  const { data: revenueData, isError: isRevenueError } =
    useFetchRevenueAnalytics({
      institutionId: currentSchoolId,
      startDate: outerChartDate.startDate,
      endDate: outerChartDate.endDate,
    })

  useEffect(() => {
    if (!data && isError) {
      setNoAnalyticsData(true)
    }

    if (!revenueData && isRevenueError) {
      setNoRevenueData(true)
    }
  }, [data, revenueData, isRevenueError, isError])

  const renderStatusBar = (): JSX.Element => {
    if (isLoading) {
      return <Heading>{t('component:googleAnalytics.retrievingData')}</Heading>
    }

    if (isError && noAnalyticsData && noRevenueData) {
      return <Heading>{t('component:googleAnalytics.tryAgainLater')}</Heading>
    }
    return <></>
  }

  return (
    <DataFlex>
      <Box direction="col" padding="lg" align="start" className="shadow-sm">
        {renderStatusBar()}
        <ChartDatePicker
          chartDate={outerChartDate}
          handleChartDateChange={setOuterChartDate}
        />
      </Box>

      <ChartCombo>
        <VisitorCountGraph
          data={data as VisitorCountData[]}
          isLoading={isLoading}
          isError={isError}
          outerChartDate={outerChartDate}
        />
        <PageCountGraph outerChartDate={outerChartDate} />
        <VisitorCountryGraph outerChartDate={outerChartDate} />
        <ChannelGroupGraph outerChartDate={outerChartDate} />
        <SchoolPurchaseRevenueGraph outerChartDate={outerChartDate} />
        <CoursePurchaseRevenueGraph outerChartDate={outerChartDate} />
      </ChartCombo>
    </DataFlex>
  )
}

export default GoogleAnalytics

const DataFlex = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
})
const ChartCombo = styled('div', {
  display: 'flex',

  flexWrap: 'wrap',
  gap: '1rem',
})
