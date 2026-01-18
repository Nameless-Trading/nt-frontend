"use client";

import { useState, useEffect, useCallback } from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
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
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { getPortfolioHistory, type PortfolioSnapshot } from "@/lib/api";

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
      maximumFractionDigits: 0,
    }).format(value);
  }

  function formatPercent(value: number | null | undefined, fractionDigits = 2) {
    if (value === null || value === undefined || Number.isNaN(value))
      return "—";
    return `${value.toFixed(fractionDigits)}%`;
  }

  return (
    <div className="flex items-start justify-center min-h-screen p-8">
      <div className="w-full max-w-6xl space-y-8">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">
              Nameless Trading Portfolio Overview
            </h1>
            <p className="text-muted-foreground text-sm">
              Track performance and returns across time ranges.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={`bg-muted/70 flex rounded-lg p-1 ring-1 ring-border ${
                loading ? "opacity-70" : ""
              }`}
              role="tablist"
              aria-label="Select period"
            >
              {periods.map((period) => {
                const active = selectedPeriod === period;
                return (
                  <button
                    key={period}
                    onClick={() => setSelectedPeriod(period)}
                    disabled={loading}
                    role="tab"
                    aria-selected={active}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all
                      ${
                        active
                          ? "bg-background text-foreground shadow-sm ring-1 ring-border"
                          : "text-muted-foreground hover:text-foreground"
                      } ${loading ? "cursor-not-allowed" : ""}`}
                    title={`Show ${period} period`}
                  >
                    {period}
                  </button>
                );
              })}
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors bg-muted hover:bg-muted/80 ring-1 ring-border ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
              title="Refresh data"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardDescription>Total Value</CardDescription>
              <CardTitle className="text-2xl">
                {loading ? (
                  <span className="inline-block h-6 w-28 animate-pulse rounded bg-muted" />
                ) : (
                  formatCurrency(latestValue)
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Period Change</CardDescription>
              <CardTitle className="text-2xl">
                {loading ? (
                  <span className="inline-block h-6 w-36 animate-pulse rounded bg-muted" />
                ) : (
                  <span
                    className={
                      periodChangeAbs && periodChangeAbs >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                  >
                    {formatCurrency(periodChangeAbs)} (
                    {formatPercent(periodChangePct)})
                  </span>
                )}
              </CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Total Return</CardDescription>
              <CardTitle className="text-2xl">
                {loading ? (
                  <span className="inline-block h-6 w-24 animate-pulse rounded bg-muted" />
                ) : (
                  formatPercent(latestReturnPct)
                )}
              </CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-baseline justify-between">
              <div>
                <CardTitle>Cumulative Return</CardTitle>
                <CardDescription>Performance over time</CardDescription>
              </div>
              {!loading && lastUpdated ? (
                <span className="text-muted-foreground text-xs">
                  Last updated: {lastUpdated}
                </span>
              ) : null}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 w-full animate-pulse rounded-lg bg-muted" />
            ) : error ? (
              <div className="flex flex-col items-start gap-3 rounded-lg border p-4">
                <div className="text-sm">
                  <span className="font-medium">Failed to load chart.</span>{" "}
                  <span className="text-muted-foreground">{error}</span>
                </div>
                <button
                  onClick={fetchData}
                  className="bg-primary text-primary-foreground hover:opacity-90 rounded-md px-3 py-1.5 text-sm"
                >
                  Retry
                </button>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="lg:max-h-104 xl:max-h-112 2xl:max-h-120">
                <AreaChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
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
                        stopColor="var(--color-cumulative_return)"
                        stopOpacity="0.35"
                      />
                      <stop
                        offset="100%"
                        stopColor="var(--color-cumulative_return)"
                        stopOpacity="0.05"
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        indicator="line"
                        formatter={(value, name) => {
                          if (name === "cumulative_return") {
                            return (
                              <span className="font-mono">
                                {Number(value).toFixed(2)}%
                              </span>
                            );
                          }
                          return <span className="font-mono">{value}</span>;
                        }}
                      />
                    }
                  />
                  <Area
                    dataKey="cumulative_return"
                    type="linear"
                    fill="url(#cumulativeGradient)"
                    stroke="var(--color-cumulative_return)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
