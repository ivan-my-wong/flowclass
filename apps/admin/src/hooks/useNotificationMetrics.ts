import { useCallback, useEffect, useMemo, useState } from 'react'

import { NotificationRecordItem } from '@/api/recordLogs'
import { ChartDate } from '@/types/chartDate.type'
import { CalculatedMetrics, MetricConfig } from '@/types/metrics'
import { NotificationChannel } from '@/types/notifications'
import { calculateMetrics } from '@/utils/calculate-course'

import useSiteData from './useSiteData'

const TIME_SAVED_MAP = {
  [NotificationChannel.EMAIL]: 5,
  [NotificationChannel.WHATSAPP]: 10,
}

const useNotificationMetrics = (
  filteredList: NotificationRecordItem[],
  chartDate: ChartDate
): CalculatedMetrics => {
  const { currency } = useSiteData()
  const [metrics, setMetrics] = useState<CalculatedMetrics>({
    EMAIL: {
      current: 0,
      previous: 0,
      growthRate: '',
    },
    WHATSAPP: {
      current: 0,
      previous: 0,
      growthRate: '',
    },
    timeSaved: {
      current: 0,
      previous: 0,
      growthRate: '',
    },
  })
  const getTimeSaved = useCallback((channel: NotificationChannel): number => {
    return TIME_SAVED_MAP[channel] || 0
  }, [])

  const notificationConfigs: MetricConfig<NotificationRecordItem>[] = useMemo(
    () => [
      {
        name: NotificationChannel.EMAIL,
        getValue: item => (item.channel === NotificationChannel.EMAIL ? 1 : 0),
      },
      {
        name: NotificationChannel.WHATSAPP,
        getValue: item =>
          item.channel === NotificationChannel.WHATSAPP ? 1 : 0,
      },
      {
        name: 'timeSaved',
        getValue: item => getTimeSaved(item.channel),
        isTimeMetric: true,
      },
    ],
    [getTimeSaved]
  )

  const newMetrics = useMemo(
    () =>
      calculateMetrics<NotificationRecordItem>(
        filteredList,
        chartDate.startDate,
        chartDate.endDate,
        notificationConfigs,
        currency
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredList, chartDate.startDate, chartDate.endDate]
  )
  useEffect(() => {
    setMetrics(newMetrics)
  }, [newMetrics])

  return metrics
}

export default useNotificationMetrics
