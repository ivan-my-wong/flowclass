import { useCallback, useState } from 'react'

import { useTranslation } from 'react-i18next'

import useSiteData from '@/hooks/useSiteData'
import { Metric } from '@/types/metrics'
import { cn } from '@/utils/cn'
import { formatCurrency } from '@/utils/currency'

import HighchartWrapper from './HighchartWrapper'

type PropTypes = {
  metrics: Metric[]
}

const RevenueWithChart = ({ metrics }: PropTypes): JSX.Element => {
  const { siteData } = useSiteData()
  const { t } = useTranslation()
  const [currentMetric, setCurrentMetric] = useState<Metric | null>(
    metrics[0] || null
  )
  const onSelectMetric = (metric: Metric) => {
    setCurrentMetric(metric)
  }
  const growthStyle = useCallback((metric: Metric) => {
    const growthRate = parseFloat(metric.growthRate)
    if (Number.isNaN(growthRate)) return ''
    if (growthRate === 0) return ''
    return growthRate < 0 ? 'text-warn' : 'text-success'
  }, [])

  const renderMainFigure = (metric: Metric) => {
    if (metric.isCurrency) {
      return `${formatCurrency(
        metric.current,
        siteData.currentSite?.currency ?? ''
      )}`
    }
    return metric.current
  }

  return (
    <div className="w-full flex flex-col bg-background-layer-2 rounded-b-md">
      <div className="flex mb-4">
        {metrics.map(metric => (
          <div
            className={cn(
              'w-1/2 px-8 py-4',
              currentMetric?.name === metric.name
                ? 'border-t-primary border-t-2 bg-primary/20'
                : 'bg-background-layer-2'
            )}
            key={metric.name}
            role="button"
            onClick={() => onSelectMetric(metric)}
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelectMetric(metric)
              }
            }}
          >
            <h1 className="text-sm font-bold mb-2">
              {t(`student:bannerCards.${metric.name}`)}
            </h1>
            <div className="flex w-full items-start gap-x-4 flex-col">
              <p className="font-bold text-2xl">{renderMainFigure(metric)}</p>
              <p className={cn('font-bold', growthStyle(metric))}>
                {metric.growthRate}
              </p>
            </div>
          </div>
        ))}
      </div>
      {currentMetric?.chart ? (
        <HighchartWrapper options={currentMetric.chart} />
      ) : (
        <div className="w-full flex items-center justify-center p-8 bg-background-layer-2 rounded-b-md">
          <p className="text-gray-500">{t('student:chart.noData')}</p>
        </div>
      )}
    </div>
  )
}

export default RevenueWithChart
