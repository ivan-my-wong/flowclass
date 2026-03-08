import { ComponentProps } from 'react'

import { t } from 'i18next'
import { Bar, Line } from 'react-chartjs-2'

import { ChartDate } from '@/types/chartDate.type'
import {
  RollingDatePreset,
  SemanticDatePreset,
} from '@/types/fullCalendar.type'
import dayjs from '@/utils/dayjs'
import { getFormatDate } from '@/utils/timeFormat'
import { formatDateRelativeToToday } from '@/utils/timeString'

type DateRangeParams = {
  daysBeforeStart: number
  daysBeforeEnd: number
}

type ChartDataProps = {
  chartData: { [key: string]: string | number }[]
  labelKey: string
  dataKey: string
  randomColor?: boolean
  label?: string
}

type ChartDataset = {
  label: string
  data: (string | number)[]
  fill: boolean
  backgroundColor: string | string[]
  borderColor: string | string[]
}

type ChartData = {
  labels: (string | number)[]
  datasets: ChartDataset[]
}

export const getLineChartOptions = (): ComponentProps<
  typeof Line
>['options'] => {
  return {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }
}

export const getBarChartOptions = (): ComponentProps<typeof Bar>['options'] => {
  return {
    maintainAspectRatio: false,
    responsive: true,
    indexAxis: 'y' as const,
    plugins: {
      legend: {
        position: 'center' as const,
      },
    },
    scales: {
      y: {
        grid: {
          offset: true,
        },
      },
    },
  }
}

export const mapDataToChart = ({
  chartData,
  labelKey,
  dataKey,
  randomColor = false,
  label = '# of Visitors',
}: ChartDataProps): ChartData => {
  const labels = chartData.map(item => {
    if (dayjs(String(item[labelKey]), 'YYYY/MM/DD', true).isValid()) {
      return getFormatDate(String(item[labelKey]))
    }
    return String(item[labelKey])
  })
  const data = chartData.map(
    item => Number(item[dataKey]) || String(item[dataKey])
  )
  return {
    labels,
    datasets: [
      {
        label,
        data,
        fill: false,
        backgroundColor: 'rgb(96, 165, 250)',
        borderColor: 'rgb(96, 165, 250)',
        ...(randomColor && getRandomChartColorCombination(chartData.length)),
      },
    ],
  }
}

const getRandomColor = () => {
  const r = Math.floor(Math.random() * 256)
  const g = Math.floor(Math.random() * 256)
  const b = Math.floor(Math.random() * 256)
  return `${r}, ${g}, ${b}`
}

const getRandomChartColorCombination = (number: number) => {
  const result = {
    backgroundColor: [] as string[],
    borderColor: [] as string[],
  }
  for (let i = 0; i < number; i += 1) {
    const randomColor = getRandomColor()
    result.backgroundColor.push(`rgba(${randomColor}, 0.2)`)
    result.borderColor.push(`rgba(${randomColor}, 1)`)
  }
  return result
}

export const getInitialChartDateRange = ({
  daysBeforeStart,
  daysBeforeEnd,
}: DateRangeParams): ChartDate => {
  return {
    startDate: formatDateRelativeToToday(daysBeforeStart),
    endDate: formatDateRelativeToToday(daysBeforeEnd),
  }
}

export const chartDateOptionMapping = [
  {
    label: t(`component:chartDate.today`),
    dayLength: SemanticDatePreset.Today,
  },
  {
    label: t(`component:chartDate.thisWeek`),
    dayLength: SemanticDatePreset.ThisWeek,
  },
  {
    label: t(`component:chartDate.lastWeek`),
    dayLength: SemanticDatePreset.LastWeek,
  },
  {
    label: t(`component:chartDate.thisMonth`),
    dayLength: SemanticDatePreset.ThisMonth,
  },
  {
    label: t(`component:chartDate.lastMonth`),
    dayLength: SemanticDatePreset.LastMonth,
  },
  {
    label: t(`component:chartDate.last3Months`),
    dayLength: SemanticDatePreset.Last3Months,
  },
  {
    label: t(`component:chartDate.thisYear`),
    dayLength: SemanticDatePreset.ThisYear,
  },
  {
    label: t(`component:chartDate.lastYear`),
    dayLength: SemanticDatePreset.LastYear,
  },
]

export const customDateRangeMapping = [
  {
    label: t(`component:chartDate.latest7Days`),
    dayLength: RollingDatePreset.Latest7Days,
  },
  {
    label: t(`component:chartDate.latest30Days`),
    dayLength: RollingDatePreset.Latest30Days,
  },
  {
    label: t(`component:chartDate.latest90Days`),
    dayLength: RollingDatePreset.Latest90Days,
  },
  {
    label: t(`component:chartDate.latest365Days`),
    dayLength: RollingDatePreset.Latest365Days,
  },
]
