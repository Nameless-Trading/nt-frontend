"use client"

import { useState, useEffect } from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { getPortfolioHistory, type PortfolioSnapshot } from "@/lib/api"

const chartConfig = {
  cumulative_return: {
    label: "Cumulative Return",
    color: "hsl(142, 76%, 36%)",
  },
  value: {
    label: "Portfolio Value",
  },
  timestamp: {
    label: "Time",
  },
} satisfies ChartConfig

type Period = "1D" | "5D" | "1M" | "6M" | "1Y" | "ALL"

export default function PortfolioHistory() {
  const [chartData, setChartData] = useState<Array<{
    date: string
    cumulative_return: number
    value: number
    timestamp: string
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("5D")

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const data = await getPortfolioHistory(selectedPeriod)

        const transformedData = data.map((snapshot: PortfolioSnapshot) => ({
          date: new Date(snapshot.timestamp).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            timeZone: 'America/New_York'
          }),
          cumulative_return: snapshot.cumulative_return * 100,
          value: snapshot.value,
          timestamp: new Date(snapshot.timestamp).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            timeZone: 'America/New_York',
            timeZoneName: 'short'
          }),
        }))

        setChartData(transformedData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch portfolio history')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [selectedPeriod])

  const periods: Period[] = ["1D", "5D", "1M", "6M", "1Y", "ALL"]

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-6xl space-y-6">
        <div className="flex justify-end gap-1">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              disabled={loading}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                selectedPeriod === period
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {period}
            </button>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Cumulative Return</CardTitle>
            <CardDescription>Performance over time</CardDescription>
          </CardHeader>
          <CardContent>
            {loading || error ? (
              <div className="h-96 flex items-center justify-center text-muted-foreground">
                {loading ? "Loading chart data..." : "Failed to load chart"}
              </div>
            ) : (
              <ChartContainer config={chartConfig}>
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Area
                    dataKey="cumulative_return"
                    type="linear"
                    fill="var(--color-cumulative_return)"
                    fillOpacity={0.4}
                    stroke="var(--color-cumulative_return)"
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
