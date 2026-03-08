import React, { useEffect, useRef } from 'react'

import Highcharts from 'highcharts'

type HighchartProps = {
  options: Highcharts.Options
  height?: string | number
}

const HighchartWrapper: React.FC<HighchartProps> = ({ options, height }) => {
  const chartRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartRef.current) return
    Highcharts.chart(chartRef.current, options)
    // eslint-disable-next-line consistent-return
    return () => {
      if (chartRef.current) {
        const chart = Highcharts.charts.find(
          chart => chart && chart.container === chartRef.current
        )
        if (chart) {
          chart.destroy()
        }
      }
    }
  }, [options])

  return (
    <div
      ref={chartRef}
      className="w-full"
      style={{
        height: typeof height === 'number' ? `${height}px` : height || '100%',
      }}
    />
  )
}

export default HighchartWrapper
