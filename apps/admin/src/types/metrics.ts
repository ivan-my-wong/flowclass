export type MetricConfig<T> = {
  name: string
  isCurrency?: boolean
  currency?: string
  getValue: (item: T) => number | undefined
  isTimeMetric?: boolean
  getChartData?: (data: T[]) => Highcharts.Options
}

export type Metric = {
  name?: string
  isCurrency?: boolean
  current: number
  previous: number
  chart?: Highcharts.Options
  growthRate: string
}

export type CalculatedMetrics = {
  [key: string]: Metric
}

export type ChartDataType<T> = { data: T[]; labels: string[] }
