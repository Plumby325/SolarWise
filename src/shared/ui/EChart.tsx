import { useEffect, useRef } from 'react'
import { BarChart, LineChart, ScatterChart } from 'echarts/charts'
import { GridComponent, LegendComponent, MarkLineComponent, TooltipComponent } from 'echarts/components'
import { init, use } from 'echarts/core'
import type { ECharts, EChartsCoreOption } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'

use([
  BarChart,
  CanvasRenderer,
  GridComponent,
  LegendComponent,
  LineChart,
  MarkLineComponent,
  ScatterChart,
  TooltipComponent,
])

type EChartEventHandler = (params: unknown) => void

type EChartProps = {
  option: EChartsCoreOption
  className?: string
  ariaLabel: string
  onEvents?: Record<string, EChartEventHandler>
}

export function EChart({ option, className = '', ariaLabel, onEvents }: EChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null)
  const chartInstanceRef = useRef<ECharts | null>(null)
  const onEventsRef = useRef(onEvents)

  onEventsRef.current = onEvents

  useEffect(() => {
    if (!chartRef.current) {
      return undefined
    }

    const chart = init(chartRef.current, undefined, { renderer: 'canvas' })
    chartInstanceRef.current = chart

    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(chartRef.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
      chartInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    const chart = chartInstanceRef.current

    if (!chart) {
      return
    }

    chart.setOption(option, true)
  }, [option])

  useEffect(() => {
    const chart = chartInstanceRef.current

    if (!chart) {
      return
    }

    chart.off('click')

    if (onEvents) {
      Object.entries(onEvents).forEach(([eventName, handler]) => {
        chart.on(eventName, handler)
      })
    }
  }, [onEvents])

  return <div ref={chartRef} className={className} role="img" aria-label={ariaLabel} />
}
