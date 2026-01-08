"use client"

import { useState, useEffect } from "react"
import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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

export const description = "A simple area chart"

const chartConfig = {
  cumulative_return: {
    label: "Portfolio Value",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export default function ChartAreaDefault() {
  const [chartData, setChartData] = useState<Array<{ month: string; cumulative_return: number }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const data = await getPortfolioHistory("5D")

        // Transform the data to match the chart format
        const transformedData = data.map((snapshot: PortfolioSnapshot) => ({
          month: new Date(snapshot.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          cumulative_return: snapshot.cumulative_return * 100,
        }))

        console.log(transformedData)

        setChartData(transformedData)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch portfolio history')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="px-128 py-32">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio History</CardTitle>
            <CardDescription>Loading...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-128 py-32">
        <Card>
          <CardHeader>
            <CardTitle>Portfolio History</CardTitle>
            <CardDescription className="text-red-500">{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="px-128 py-32">
      <Card>
        <CardHeader>
          <CardTitle>Portfolio History</CardTitle>
          <CardDescription>
            Showing portfolio value for the last month
          </CardDescription>
        </CardHeader>
        <CardContent>
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
                dataKey="month"
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
                type="natural"
                fill="var(--color-cumulative_return)"
                fillOpacity={0.4}
                stroke="var(--color-cumulative_return)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-start gap-2 text-sm">
            <div className="grid gap-2">
              <div className="flex items-center gap-2 leading-none font-medium">
                Portfolio performance <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-muted-foreground flex items-center gap-2 leading-none">
                Last 30 days
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
