import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'
import { LuArrowRight } from 'react-icons/lu'
import { useQuery } from 'react-query'

import { findInvoiceStatisticsByDateRange } from '@/api/invoice'
import MetricCard from '@/components/Cards/MetricCard'
import MetricCardContainer from '@/components/Cards/MetricCardContainer'
import ChartDatePicker from '@/components/DatePickers/ChartDatePicker'
import { Button } from '@/components/ui/Button'
import { defaultMetrics } from '@/constants/onboarding/onboarding'
import { PaymentState } from '@/constants/payment'
import { QUERY_KEY } from '@/constants/queryKey'
import { useResponsive } from '@/hooks/useResponsive'
import useSchoolData from '@/hooks/useSchoolData'
import useSiteData from '@/hooks/useSiteData'
import { useInvoiceMetrics } from '@/hooks/useStudentMetrics'
import { ChartDate } from '@/types/chartDate.type'
import { Invoice } from '@/types/enrollCourse'
import { CalculatedMetrics, ChartDataType } from '@/types/metrics'
import { calculateGrowthRate } from '@/utils/calculate-course'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/currency'
import { checkDateBetween } from '@/utils/date.utils'
import { formatDateRelativeToToday } from '@/utils/timeString'

import RevenueWithChart from './components/RevenueWithChart'

// Helper functions for chart building
const shouldGroupByWeek = (start: string, end: string) => {
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  return endDate.diff(startDate, 'day') > 90
}

const shouldGroupByHour = (start: string, end: string) => {
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  return endDate.diff(startDate, 'day') < 4
}

const getWeekLabel = (date: dayjs.Dayjs) => {
  return date.startOf('week').format('DD MMM YYYY')
}

const getHourLabel = (date: dayjs.Dayjs) => date.format('DD MMM HH:00')

const buildChartDataForInvoices = (
  items: Invoice[],
  chartDate: ChartDate,
  valueSelector: (item: Invoice) => number,
  filter: (item: Invoice) => boolean
): ChartDataType<number> => {
  const isGroupByHour = shouldGroupByHour(
    chartDate.startDate,
    chartDate.endDate
  )
  const isGroupByWeek =
    !isGroupByHour && shouldGroupByWeek(chartDate.startDate, chartDate.endDate)
  const valueByPeriod: Record<string, number> = {}
  items.forEach(item => {
    if (!filter(item)) return
    const d = dayjs(item.createdAt)
    let label
    if (isGroupByHour) label = getHourLabel(d)
    else if (isGroupByWeek) label = getWeekLabel(d)
    else label = d.format('DD MMM')
    valueByPeriod[label] = (valueByPeriod[label] || 0) + valueSelector(item)
  })
  const allPeriods: string[] = []
  let current = dayjs(chartDate.startDate)
  const end = dayjs(chartDate.endDate)
  if (isGroupByHour) {
    let day = dayjs(chartDate.startDate).startOf('day')
    while (day.isSameOrBefore(end, 'day')) {
      for (let h = 0; h < 24; h++) {
        allPeriods.push(day.hour(h).format('DD MMM HH:00'))
      }
      day = day.add(1, 'day')
    }
  } else {
    while (current.isSameOrBefore(end, isGroupByWeek ? 'week' : 'day')) {
      const label = isGroupByWeek
        ? getWeekLabel(current)
        : current.format('DD MMM')
      if (
        allPeriods.length === 0 ||
        allPeriods[allPeriods.length - 1] !== label
      ) {
        allPeriods.push(label)
      }
      current = isGroupByWeek ? current.add(1, 'week') : current.add(1, 'day')
    }
  }
  const labels = allPeriods
  const dataArr = labels.map(label => valueByPeriod[label] || 0)
  return { labels, data: dataArr }
}

const buildRevenueChartDataFromInvoices = (
  data: Invoice[],
  chartDate: ChartDate
): ChartDataType<number> => {
  return buildChartDataForInvoices(
    data,
    chartDate,
    invoice => Number(invoice.payAmount) + Number(invoice.usedBalance ?? 0),
    invoice =>
      invoice.paymentState === PaymentState.PAID &&
      checkDateBetween(invoice.createdAt, chartDate)
  )
}

const buildChartOptions = (
  title: string,
  currency: string,
  chartData: ChartDataType<number>
): Highcharts.Options => {
  return {
    chart: {
      backgroundColor: 'transparent',
      style: {
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
      },
    },
    title: {
      text: '',
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      pointFormat:
        '<span style="color:{point.color}">\u25CF</span> {series.name}: <b>{point.y}</b>',
      valuePrefix: currency,
      valueSuffix: '',
      shared: true,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      borderWidth: 1,
      borderColor: '#e6e6e6',
      shadow: true,
      style: {
        padding: '10px',
      },
    },
    yAxis: {
      title: {
        text: '',
      },
      labels: {
        rotation: 0,
        align: 'right',
      },
      gridLineColor: 'rgba(221, 221, 221, 0.6)',
    },
    xAxis: {
      categories: chartData.labels,
      labels: {
        rotation: 0,
        align: 'right',
      },
      title: {
        text: '',
      },
      tickInterval: Math.ceil(chartData.labels.length / 10),
      lineColor: '#e6e6e6',
      tickColor: '#e6e6e6',
    },
    series: [
      {
        type: 'line',
        data: chartData.data,
        name: title,
        color: 'var(--color-primary)',
        marker: {
          enabled: false,
          radius: 4,
          symbol: 'circle',
          states: {
            hover: {
              enabled: true,
              radius: 6,
            },
          },
        },
        states: {
          hover: {
            lineWidth: 3,
          },
        },
      },
    ],
    plotOptions: {
      line: {
        lineWidth: 2,
        states: {
          hover: {
            lineWidth: 3,
          },
        },
      },
      series: {
        animation: {
          duration: 1000,
        },
      },
    },
    responsive: {
      rules: [
        {
          condition: {
            maxWidth: 500,
          },
          chartOptions: {
            legend: {
              enabled: false,
            },
          },
        },
      ],
    },
  }
}

const Dashboard = (): JSX.Element => {
  const { t } = useTranslation(['onboarding', 'student'])
  const { siteData } = useSiteData()
  const { schoolData } = useSchoolData()
  const [params, setParams] = useSearchParams()

  const { isMobile } = useResponsive()

  // State management
  const [chartDate, setChartDate] = useState<ChartDate>(() => ({
    startDate: params.get('startDate') ?? formatDateRelativeToToday(30),
    endDate: params.get('endDate') ?? formatDateRelativeToToday(0),
  }))

  const navigate = useNavigate()

  const currentSiteId = siteData.currentSite?.id ?? 0
  const currentInstitutionId = schoolData.currentSchool?.id ?? 0

  const startDateParam = params.get('startDate') ?? chartDate.startDate
  const endDateParam = params.get('endDate') ?? chartDate.endDate

  const {
    data: invoiceData,
    isLoading: isLoadingInvoices,
    isFetching: isFetchingInvoices,
  } = useQuery<Invoice[]>(
    [
      QUERY_KEY.statistics.dynamic,
      'invoice-statistics',
      currentSiteId,
      currentInstitutionId,
      startDateParam,
      endDateParam,
    ],
    () =>
      findInvoiceStatisticsByDateRange({
        startDate: startDateParam,
        endDate: endDateParam,
        siteId: currentSiteId,
        institutionId: currentInstitutionId,
      }),
    {
      enabled: !!currentSiteId && !!currentInstitutionId,
    }
  )

  // Filter invoices to parent invoices only (exclude child invoices)
  const parentInvoices = useMemo(() => {
    if (!invoiceData) return []
    return invoiceData.filter(invoice => !invoice.invoiceParentId)
  }, [invoiceData])

  // Use invoice metrics hook for some metrics
  const invoiceMetrics = useInvoiceMetrics(parentInvoices, chartDate)

  // Derived state
  const isAnythingLoading = useMemo(() => {
    return isLoadingInvoices || isFetchingInvoices
  }, [isLoadingInvoices, isFetchingInvoices])

  // Calculate revenue metrics from invoices
  const metrics = useMemo((): CalculatedMetrics => {
    if (isAnythingLoading || !invoiceData) return defaultMetrics

    const start = dayjs(chartDate.startDate).startOf('day')
    const end = dayjs(chartDate.endDate).endOf('day')
    const daysDifference = end.diff(start, 'days')
    const previousEnd = dayjs(start).subtract(1, 'days').endOf('day')
    const previousStart = dayjs(previousEnd)
      .subtract(daysDifference, 'days')
      .startOf('day')

    const currency = siteData.currentSite?.currency ?? ''

    // Calculate current period metrics
    let totalRevenueCurrent = 0
    let unpaidRevenueCurrent = 0
    let overdueRevenueCurrent = 0

    // Calculate previous period metrics
    let totalRevenuePrevious = 0
    let unpaidRevenuePrevious = 0
    let overdueRevenuePrevious = 0

    parentInvoices.forEach(invoice => {
      const invoiceDate = dayjs(invoice.createdAt)
      const invoiceAmount =
        Number(invoice.payAmount) + Number(invoice.usedBalance ?? 0)

      if (invoiceDate.isBetween(start, end, 'day', '[]')) {
        // Current period
        if (invoice.paymentState === PaymentState.PAID) {
          totalRevenueCurrent += invoiceAmount
        } else if (
          [PaymentState.PENDING, PaymentState.SUBMITTED].includes(
            invoice.paymentState
          )
        ) {
          unpaidRevenueCurrent += invoiceAmount
        } else if (invoice.paymentState === PaymentState.CRITICAL) {
          overdueRevenueCurrent += invoiceAmount
        }
      } else if (
        invoiceDate.isBetween(previousStart, previousEnd, 'day', '[]')
      ) {
        // Previous period
        if (invoice.paymentState === PaymentState.PAID) {
          totalRevenuePrevious += invoiceAmount
        } else if (
          [PaymentState.PENDING, PaymentState.SUBMITTED].includes(
            invoice.paymentState
          )
        ) {
          unpaidRevenuePrevious += invoiceAmount
        } else if (invoice.paymentState === PaymentState.CRITICAL) {
          overdueRevenuePrevious += invoiceAmount
        }
      }
    })

    // Build chart data for totalRevenue
    const totalRevenueChartData = buildRevenueChartDataFromInvoices(
      parentInvoices,
      chartDate
    )
    const totalRevenueChart = buildChartOptions(
      t('student:bannerCards.totalRevenue'),
      currency,
      totalRevenueChartData
    )

    return {
      totalRevenue: {
        name: 'totalRevenue',
        isCurrency: true,
        current: totalRevenueCurrent,
        previous: totalRevenuePrevious,
        growthRate: calculateGrowthRate(
          totalRevenueCurrent,
          totalRevenuePrevious,
          true,
          false,
          currency
        ),
        chart: totalRevenueChart,
      },
      unpaidRevenue: {
        name: 'unpaidRevenue',
        isCurrency: true,
        current: unpaidRevenueCurrent,
        previous: unpaidRevenuePrevious,
        growthRate: calculateGrowthRate(
          unpaidRevenueCurrent,
          unpaidRevenuePrevious,
          true,
          false,
          currency
        ),
        chart: undefined,
      },
      overdueRevenue: {
        name: 'overdueRevenue',
        isCurrency: true,
        current: overdueRevenueCurrent,
        previous: overdueRevenuePrevious,
        growthRate: calculateGrowthRate(
          overdueRevenueCurrent,
          overdueRevenuePrevious,
          true,
          false,
          currency
        ),
        chart: undefined,
      },
      amountReceived: {
        ...invoiceMetrics.amountReceived,
        name: 'amountReceived',
      },
      paymentsReceived: {
        ...invoiceMetrics.paymentsReceived,
        name: 'paymentsReceived',
      },
      paymentToBeReviewed: {
        ...invoiceMetrics.paymentToBeReviewed,
        name: 'paymentToBeReviewed',
      },
    }
  }, [
    invoiceData,
    parentInvoices,
    chartDate,
    isAnythingLoading,
    invoiceMetrics,
    siteData.currentSite?.currency,
    t,
  ])

  // Event handlers
  const handleChartDateChange = useCallback((date: ChartDate) => {
    setChartDate(date)
  }, [])

  // Side effects
  useEffect(() => {
    setParams(prev => {
      prev.set('startDate', chartDate.startDate)
      prev.set('endDate', chartDate.endDate)
      return prev
    })
  }, [chartDate, setParams])

  return (
    <div className="w-full box-col-full gap-4 p-4 items-start relative">
      <div className="box-responsive-full justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">
            {t('onboarding:dashboard.analytics')}
          </h1>
          <Button
            onClick={() => navigate('/dashboard-v2')}
            variant="primary-outline"
            size="sm"
            iconAfter={<LuArrowRight />}
          >
            {t('onboarding:dashboard.advanced')}
          </Button>
        </div>
        <ChartDatePicker
          chartDate={chartDate}
          handleChartDateChange={handleChartDateChange}
        />
      </div>
      {/* Main Chart Section - Full Width on Desktop */}
      <div className="box-responsive-full items-start">
        <div
          className={cn(
            'box-col-full gap-4 items-start w-full',
            isMobile ? '' : 'sm:w-2/3'
          )}
        >
          <MetricCardContainer
            isLoading={isAnythingLoading}
            className="w-full gap-4 items-start"
          >
            <RevenueWithChart
              metrics={[metrics.totalRevenue, metrics.paymentsReceived]}
            />
          </MetricCardContainer>
        </div>

        {/* Sidebar Section - One Third Width on Desktop */}
        <div
          className={cn(
            'box-col-full items-start w-full',
            isMobile ? '' : 'sm:w-1/3'
          )}
        >
          <MetricCard
            title={t('student:bannerCards.paymentsToBeReviewed')}
            value={formatCurrency(
              metrics?.unpaidRevenue.current,
              siteData.currentSite?.currency ?? ''
            )}
            growthRate={metrics?.unpaidRevenue.growthRate}
            subtitle={
              t(
                'recordLogs:notificationLogs.bannerCards.SinceLastMonth'
              ) as string
            }
          />
          <MetricCard
            title={t('student:bannerCards.applicationsToBeReviewed')}
            value={metrics?.paymentToBeReviewed.current}
            growthRate={metrics?.paymentToBeReviewed.growthRate}
            subtitle={
              t(
                'recordLogs:notificationLogs.bannerCards.SinceLastMonth'
              ) as string
            }
          />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
