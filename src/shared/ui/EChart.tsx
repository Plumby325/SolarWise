import { useEffect, useRef } from 'react'
import { BarChart, LineChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import { init, use } from 'echarts/core'
import type { EChartsCoreOption } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

use([BarChart, CanvasRenderer, GridComponent, LegendComponent, LineChart, TooltipComponent])

type EChartProps = {
  option: EChartsCoreOption
  className?: string
  ariaLabel: string
}

export function EChart({ option, className = '', ariaLabel }: EChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!chartRef.current) {
      return undefined
    }

    const chart = init(chartRef.current, undefined, { renderer: 'canvas' })
    const resizeObserver = new ResizeObserver(() => chart.resize())

    resizeObserver.observe(chartRef.current)
    chart.setOption(option)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }, [option])

  return <div ref={chartRef} className={className} role="img" aria-label={ariaLabel} />
}
