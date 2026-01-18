"use client";

import { useState, useEffect, useCallback } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts";
import { RefreshCw } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  type ChartConfig,
} from "@/components/ui/chart";
import { getPortfolioHistory, type PortfolioSnapshot } from "@/lib/api";
import { ThemeToggle } from "@/components/theme-toggle";

const chartConfig = {
  cumulative_return: {
    label: "Cumulative Return",
    color: "hsl(var(--chart-1))",
  },
  value: {
    label: "Portfolio Value",
  },
  timestamp: {
    label: "Time",
  },
} satisfies ChartConfig;

type Period = "1D" | "5D" | "1M" | "6M" | "1Y" | "ALL";

export default function PortfolioHistory() {
  const [chartData, setChartData] = useState<
    Array<{
      date: string;
      cumulative_return: number;
      value: number;
      timestamp: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<Period>("5D");
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);
  const [, setHoveredDate] = useState<string | null>(null);
  const [hoveredShortDate, setHoveredShortDate] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getPortfolioHistory(selectedPeriod);

      const transformedData = data.map((snapshot: PortfolioSnapshot) => ({
        date: new Date(snapshot.timestamp).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          timeZone: "America/New_York",
        }),
        cumulative_return: snapshot.cumulative_return * 100,
        value: snapshot.value,
        timestamp: new Date(snapshot.timestamp).toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZone: "America/New_York",
          timeZoneName: "short",
        }),
      }));

      setChartData(transformedData);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch portfolio history"
      );
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const periods: Period[] = ["1D", "5D", "1M", "6M", "1Y", "ALL"];

  const latest = chartData.at(-1);
  const first = chartData[0];
  const latestValue = latest?.value ?? null;
  const periodChangeAbs = latest && first ? latest.value - first.value : null;
  const periodChangePct =
    latest && first && first.value !== 0
      ? ((latest.value - first.value) / first.value) * 100
      : null;
  const latestReturnPct = latest?.cumulative_return ?? null;
  const lastUpdated = latest?.timestamp ?? null;

  function formatCurrency(value: number | null | undefined) {
    if (value === null || value === undefined || Number.isNaN(value))
      return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function formatPercent(value: number | null | undefined, fractionDigits = 2) {
    if (value === null || value === undefined || Number.isNaN(value))
      return "—";
    return `${value.toFixed(fractionDigits)}%`;
  }

  const isPositive = periodChangeAbs !== null && periodChangeAbs >= 0;
  const displayValue = hoveredValue ?? latestValue;

  const hoveredChangeAbs = hoveredValue && first ? hoveredValue - first.value : periodChangeAbs;
  const hoveredChangePct = hoveredValue && first && first.value !== 0
    ? ((hoveredValue - first.value) / first.value) * 100
    : periodChangePct;
  const isHoveredPositive = hoveredChangeAbs !== null && hoveredChangeAbs >= 0;

  return (
    <div className="flex items-start justify-center min-h-screen overflow-x-hidden bg-background">
      <div className="w-full max-w-5xl px-4 sm:px-6 py-6 sm:py-12">
        <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Nameless Trading Portfolio
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={fetchData}
              disabled={loading}
              className={`p-2 rounded-lg transition-colors bg-muted hover:bg-muted/80 ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
              title="Refresh data"
              aria-label="Refresh data"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        <Card className="border-border/40 overflow-hidden">
          <CardHeader className="pb-0 pt-6 px-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-5xl sm:text-6xl font-bold tracking-tight">
                {loading ? (
                  <span className="inline-block h-14 w-52 animate-pulse rounded bg-muted" />
                ) : (
                  formatCurrency(displayValue)
                )}
              </h2>
              {!loading && hoveredChangeAbs !== null && (
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span
                    className={`text-2xl font-semibold ${
                      isHoveredPositive
                        ? "text-emerald-600 dark:text-emerald-500"
                        : "text-red-600 dark:text-red-500"
                    }`}
                  >
                    {isHoveredPositive ? "+" : ""}
                    {formatCurrency(hoveredChangeAbs)}
                  </span>
                  <span
                    className={`text-2xl font-semibold ${
                      isHoveredPositive
                        ? "text-emerald-600 dark:text-emerald-500"
                        : "text-red-600 dark:text-red-500"
                    }`}
                  >
                    ({isHoveredPositive ? "+" : ""}
                    {formatPercent(hoveredChangePct)})
                  </span>
                  <span className="text-base text-muted-foreground font-normal">
                    {hoveredShortDate || selectedPeriod}
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-8 pb-6 px-6">
            {loading ? (
              <div className="h-80 w-full animate-pulse rounded-lg bg-muted sm:h-96" />
            ) : error ? (
              <div className="flex flex-col items-start gap-3 rounded-lg border border-border p-4">
                <div className="text-sm">
                  <span className="font-medium">Failed to load chart.</span>{" "}
                  <span className="text-muted-foreground">{error}</span>
                </div>
                <button
                  onClick={fetchData}
                  className="bg-primary text-primary-foreground hover:opacity-90 rounded-md px-3 py-1.5 text-sm font-medium"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="relative">
                <ChartContainer config={chartConfig} className="w-full h-80 sm:h-96">
                  <AreaChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                      left: 0,
                      right: 0,
                      top: 20,
                      bottom: 20,
                    }}
                    onMouseMove={(data) => {
                      if (data && data.activePayload) {
                        setHoveredValue(data.activePayload[0]?.payload?.value);
                        setHoveredDate(data.activePayload[0]?.payload?.timestamp);
                        setHoveredShortDate(data.activePayload[0]?.payload?.date);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredValue(null);
                      setHoveredDate(null);
                      setHoveredShortDate(null);
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="cumulativeGradient"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 51%)"}
                          stopOpacity="0.4"
                        />
                        <stop
                          offset="100%"
                          stopColor={isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 51%)"}
                          stopOpacity="0"
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid 
                      vertical={false} 
                      horizontal={false}
                      strokeOpacity={0}
                    />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      hide
                    />
                    <YAxis
                      hide
                      domain={['dataMin - 5', 'dataMax + 5']}
                    />
                    <ReferenceLine
                      y={first?.cumulative_return ?? 0}
                      stroke="hsl(var(--muted-foreground))"
                      strokeDasharray="4 4"
                      strokeOpacity={0.3}
                      strokeWidth={1.5}
                    />
                    <ChartTooltip
                      cursor={{
                        stroke: isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 51%)",
                        strokeWidth: 2,
                        strokeOpacity: 0.3,
                      }}
                      content={() => null}
                    />
                    <Area
                      dataKey="cumulative_return"
                      type="monotone"
                      fill="url(#cumulativeGradient)"
                      stroke={isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 51%)"}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 6,
                        fill: isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 51%)",
                        stroke: "hsl(var(--background))",
                        strokeWidth: 3,
                      }}
                    />
                  </AreaChart>
                </ChartContainer>
                
                {/* Period Selector Below Chart */}
                <div className="flex justify-center items-center gap-1 mt-6 bg-muted/50 rounded-lg p-1 max-w-fit mx-auto">
                  {periods.map((period) => {
                    const active = selectedPeriod === period;
                    return (
                      <button
                        key={period}
                        onClick={() => setSelectedPeriod(period)}
                        disabled={loading}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                          active
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
                        title={`Show ${period} period`}
                      >
                        {period}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                Total Value
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
                {loading ? (
                  <span className="inline-block h-7 w-32 animate-pulse rounded bg-muted" />
                ) : (
                  formatCurrency(latestValue)
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="border-border/40">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                Total Return
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
                {loading ? (
                  <span className="inline-block h-7 w-24 animate-pulse rounded bg-muted" />
                ) : (
                  <span
                    className={
                      latestReturnPct !== null && latestReturnPct >= 0
                        ? "text-emerald-600 dark:text-emerald-500"
                        : "text-red-600 dark:text-red-500"
                    }
                  >
                    {formatPercent(latestReturnPct)}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-border/40 col-span-2 sm:col-span-1">
            <CardHeader className="pb-3">
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                Period Change
              </CardDescription>
              <CardTitle className="text-2xl font-bold">
                {loading ? (
                  <span className="inline-block h-7 w-28 animate-pulse rounded bg-muted" />
                ) : (
                  <span
                    className={
                      isPositive
                        ? "text-emerald-600 dark:text-emerald-500"
                        : "text-red-600 dark:text-red-500"
                    }
                  >
                    {formatPercent(periodChangePct)}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        {!loading && lastUpdated && (
          <p className="text-muted-foreground text-xs mt-6 text-center">
            Last updated: {lastUpdated}
          </p>
        )}
      </div>
    </div>
  );
}
