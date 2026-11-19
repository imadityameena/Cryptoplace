import { useMemo } from 'react'
import Chart from 'react-google-charts'

const LineChart = ({ historicalData, days, currency }) => {
  const prices = useMemo(() => historicalData?.prices ?? [], [historicalData])

  const data = useMemo(
    () => [
      [{ type: 'datetime', label: 'Date' }, { type: 'number', label: `Price (${currency.name.toUpperCase()})` }],
      ...prices.map(([time, price]) => [new Date(time), price]),
    ],
    [prices, currency]
  )

  if (prices.length < 2) {
    return <p className='chart-empty'>No price history available for this range.</p>
  }

  const rising = prices[prices.length - 1][1] >= prices[0][1]

  // 5 labels evenly spaced in time, kept off the edges, so dates never repeat or collide
  const start = prices[0][0]
  const span = prices[prices.length - 1][0] - start
  const ticks = Array.from({ length: 5 }, (_, i) => new Date(start + (span * (i + 0.5)) / 5))
  const axisText = { color: '#c9c9c9', fontName: 'Outfit', fontSize: 12 }

  const options = {
    backgroundColor: 'transparent',
    legend: 'none',
    colors: [rising ? '#00d515' : '#ff4646'],
    lineWidth: 2,
    chartArea: { left: 64, right: 12, top: 12, bottom: 36 },
    hAxis: {
      format: days <= 1 ? 'HH:mm' : days <= 90 ? 'MMM d' : "MMM ''yy",
      ticks,
      textStyle: axisText,
      gridlines: { color: 'transparent' },
      minorGridlines: { color: 'transparent' },
      baselineColor: '#3c3c3c',
    },
    vAxis: {
      format: 'short',
      textStyle: axisText,
      gridlines: { color: '#3c3c3c', count: 5 },
      minorGridlines: { color: 'transparent' },
      baselineColor: '#3c3c3c',
    },
    tooltip: { textStyle: { fontName: 'Outfit' } },
  }

  return (
    <Chart
      chartType='LineChart'
      data={data}
      options={options}
      width='100%'
      height='100%'
      loader={<div className='spinner small'><div className='spin'></div></div>}
    />
  )
}

export default LineChart
