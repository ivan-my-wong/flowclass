import { useMemo } from 'react'

import dayjs from 'dayjs'
import { useTranslation } from 'react-i18next'

import { PaymentMethodsEnum, PaymentState } from '@/constants/payment'
import { ChartDate } from '@/types/chartDate.type'
import { EnrollConfirmState, Invoice } from '@/types/enrollCourse'
import { CalculatedMetrics, ChartDataType, MetricConfig } from '@/types/metrics'
import {
  SingleStudentCrmRecordEnrollCourse,
  SingleStudentCrmRecordEnrolledClassesInvoice,
  StudentEnrolmentRecord,
} from '@/types/student'
import { calculateMetrics } from '@/utils/calculate-course'
import { checkDateBetween } from '@/utils/date.utils'

import useSiteData from './useSiteData'

// Helper to determine if we should group by week
const shouldGroupByWeek = (start: string, end: string) => {
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  return endDate.diff(startDate, 'day') > 90
}

// Helper to get week label (first day of week)
const getWeekLabel = (date: dayjs.Dayjs) => {
  return date.startOf('week').format('DD MMM YYYY')
}

// Helper to determine if we should group by hour (if 4 days or less)
const shouldGroupByHour = (start: string, end: string) => {
  const startDate = dayjs(start)
  const endDate = dayjs(end)
  return endDate.diff(startDate, 'day') < 4
}

// Helper to get hour label with date
const getHourLabel = (date: dayjs.Dayjs) => date.format('DD MMM HH:00')

// Generic chart data builder
function buildChartData<T>(
  items: T[],
  chartDate: ChartDate,
  valueSelector: (item: T) => number,
  filter: (item: T) => boolean,
  getDate: (item: T) => string | Date
): ChartDataType<number> {
  const isGroupByHour = shouldGroupByHour(
    chartDate.startDate,
    chartDate.endDate
  )
  const isGroupByWeek =
    !isGroupByHour && shouldGroupByWeek(chartDate.startDate, chartDate.endDate)
  const valueByPeriod: Record<string, number> = {}
  items.forEach(item => {
    if (!filter(item)) return
    const d = dayjs(getDate(item))
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

// Replace buildRevenueChartData
const buildRevenueChartData = (
  data: StudentEnrolmentRecord[],
  paymentState: PaymentState,
  chartDate: ChartDate
): ChartDataType<number> => {
  return buildChartData<SingleStudentCrmRecordEnrolledClassesInvoice>(
    data
      .flatMap<SingleStudentCrmRecordEnrollCourse>(d => d.enrollCourses || [])
      .flatMap(c => {
        // Support both invoice (new) and invoices (old) for backward compatibility
        return c.invoice ? [c.invoice] : c.invoices || []
      }),
    chartDate,
    invoice => Number(invoice.payAmount) + Number(invoice.usedBalance ?? 0),
    invoice =>
      invoice.paymentState === paymentState &&
      checkDateBetween(new Date(invoice.createdAt), chartDate),
    invoice => invoice.createdAt
  )
}

const buildInvoiceChartData = (
  data: Invoice[],
  paymentState: PaymentState,
  chartDate: ChartDate
): ChartDataType<number> => {
  const groupedData = data
    .filter(
      invoice =>
        checkDateBetween(invoice.createdAt, chartDate) &&
        invoice.paymentState === paymentState
    )
    .sort((a, b) => {
      return dayjs(a.createdAt).diff(dayjs(b.createdAt))
    })
    .reduce((dateGroup, invoice) => {
      const date = dayjs(invoice.createdAt).format('DD MMM')
      // eslint-disable-next-line no-param-reassign
      dateGroup[date] = (dateGroup[date] || 0) + 1
      return dateGroup
    }, {} as Record<string, number>)
  return {
    data: Object.values(groupedData),
    labels: Object.keys(groupedData),
  }
}

// Replace buildApplicationsToBeReviewedChartData
const buildApplicationsToBeReviewedChartData = (
  data: Invoice[],
  chartDate: ChartDate
): ChartDataType<number> => {
  return buildChartData<Invoice>(
    data,
    chartDate,
    _ => 1,
    invoice =>
      !(
        invoice.enrollCourses.some(
          enrollCourse =>
            enrollCourse.confirmState === EnrollConfirmState.REJECTED
        ) ||
        invoice.paymentState === PaymentState.PAID ||
        invoice.paymentMethod === PaymentMethodsEnum.PAY_NOW
      ) && checkDateBetween(invoice.createdAt, chartDate),
    invoice => invoice.createdAt
  )
}

// Replace buildPaymentsReceivedChartData
const buildPaymentsReceivedChartData = (
  data: Invoice[],
  chartDate: ChartDate
): ChartDataType<number> => {
  return buildChartData<Invoice>(
    data,
    chartDate,
    _ => 1,
    invoice =>
      invoice.paymentState === PaymentState.PAID &&
      checkDateBetween(invoice.createdAt, chartDate),
    invoice => invoice.createdAt
  )
}

const buildChartOptions = (
  title: string,
  currency: string,
  chartData: ChartDataType<number>
) => {
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
      tickInterval: Math.ceil(chartData.labels.length / 10), // Show about 10 labels
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

const useStudentMetrics = (
  filteredList: StudentEnrolmentRecord[],
  chartDate: ChartDate
): CalculatedMetrics => {
  const { t } = useTranslation('student')
  const { currency } = useSiteData()

  const studentDataConfigs = useMemo<MetricConfig<StudentEnrolmentRecord>[]>(
    () => [
      {
        name: 'totalRevenue',
        isCurrency: true,
        getValue: item => {
          return (
            item.enrollCourses?.reduce((courseTotal, course) => {
              // Support both invoice (new) and invoices (old) for backward compatibility
              const invoices = course.invoice
                ? [course.invoice]
                : course.invoices || []
              const totalPaidForCourse = invoices
                .filter(invoice => {
                  return (
                    checkDateBetween(new Date(invoice.createdAt), chartDate) &&
                    invoice.paymentState === PaymentState.PAID
                  )
                })
                .reduce((invoiceTotal, invoice) => {
                  return (
                    Number(invoiceTotal) +
                    Number(invoice.payAmount) +
                    Number(invoice.usedBalance ?? 0)
                  )
                }, 0)

              return courseTotal + totalPaidForCourse
            }, 0) || 0
          )
        },
        getChartData: (data: StudentEnrolmentRecord[]) => {
          const chartData = buildRevenueChartData(
            data,
            PaymentState.PAID,
            chartDate
          )
          return buildChartOptions(
            t('student:bannerCards.totalRevenue'),
            currency,
            chartData
          ) as Highcharts.Options
        },
      },
      {
        name: 'unpaidRevenue',
        isCurrency: true,
        getValue: item => {
          return (
            item.enrollCourses?.reduce((courseTotal, course) => {
              // Support both invoice (new) and invoices (old) for backward compatibility
              const invoices = course.invoice
                ? [course.invoice]
                : course.invoices || []
              const totalValue = invoices
                .filter(invoice => {
                  return (
                    checkDateBetween(new Date(invoice.createdAt), chartDate) &&
                    [
                      PaymentState.PENDING,
                      PaymentState.PENDING,
                      PaymentState.SUBMITTED,
                    ].includes(invoice.paymentState)
                  )
                })
                .reduce((invoiceTotal, invoice) => {
                  return (
                    Number(invoiceTotal) +
                    Number(invoice.payAmount) +
                    Number(invoice.usedBalance ?? 0)
                  )
                }, 0)

              return courseTotal + totalValue
            }, 0) || 0
          )
        },
      },
      {
        name: 'overdueRevenue',
        isCurrency: true,
        getValue: item => {
          return (
            item.enrollCourses?.reduce((courseTotal, course) => {
              // Support both invoice (new) and invoices (old) for backward compatibility
              const invoices = course.invoice
                ? [course.invoice]
                : course.invoices || []
              const totalValue = invoices
                .filter(invoice => {
                  return (
                    checkDateBetween(new Date(invoice.createdAt), chartDate) &&
                    invoice.paymentState === PaymentState.CRITICAL
                  )
                })
                .reduce((invoiceTotal, invoice) => {
                  return (
                    Number(invoiceTotal) +
                    Number(invoice.payAmount) +
                    Number(invoice.usedBalance ?? 0)
                  )
                }, 0)

              return courseTotal + totalValue
            }, 0) || 0
          )
        },
      },
    ],
    [chartDate]
  )

  const metrics = useMemo(
    () =>
      calculateMetrics<StudentEnrolmentRecord>(
        filteredList,
        chartDate.startDate,
        chartDate.endDate,
        studentDataConfigs,
        currency
      ),
    [filteredList, chartDate, studentDataConfigs, currency]
  )

  return metrics
}

export const useInvoiceMetrics = (
  filteredList: Invoice[],
  chartDate: ChartDate
): CalculatedMetrics => {
  const { t } = useTranslation('student')
  const { currency } = useSiteData()

  const paymentProofConfigs = useMemo(() => {
    return [
      {
        name: 'amountReceived',
        isCurrency: true,
        isTimeMetric: true,
        getValue: (item: Invoice) =>
          item.paymentState === PaymentState.PAID
            ? Number(item.payAmount) + Number(item.usedBalance ?? 0)
            : 0,
      },
      {
        name: 'paymentsReceived',
        isCurrency: false,
        getValue: (item: Invoice) =>
          item.paymentState === PaymentState.PAID ? 1 : 0,
        getChartData: (data: Invoice[]) => {
          const chartData = buildPaymentsReceivedChartData(data, chartDate)
          return buildChartOptions(
            t('student:bannerCards.paymentsReceived'),
            '',
            chartData
          )
        },
      },
      {
        name: 'paymentToBeReviewed',
        isCurrency: false,
        getValue: (item: Invoice) => {
          if (
            item.enrollCourses.some(
              enrollCourse =>
                enrollCourse.confirmState === EnrollConfirmState.REJECTED
            ) ||
            item.paymentState === PaymentState.PAID ||
            item.paymentMethod === PaymentMethodsEnum.PAY_NOW
          ) {
            return 0
          }

          return 1
        },
        getChartData: (data: Invoice[]) => {
          const chartData = buildApplicationsToBeReviewedChartData(
            data,
            chartDate
          )
          return buildChartOptions(
            t('student:bannerCards.applicationsToBeReviewed'),
            '',
            chartData
          )
        },
      },
    ] as MetricConfig<Invoice>[]
  }, [t, chartDate])

  const invoiceMetrics = useMemo(
    () =>
      calculateMetrics<Invoice>(
        filteredList,
        chartDate.startDate,
        chartDate.endDate,
        paymentProofConfigs,
        currency
      ),
    [filteredList, chartDate, paymentProofConfigs, currency]
  )

  return invoiceMetrics
}

export default useStudentMetrics
