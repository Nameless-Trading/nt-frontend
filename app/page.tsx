"use client";

import { useState, useEffect, useCallback } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

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
  value: {
    label: "Portfolio",
    color: "hsl(var(--chart-1))",
  },
  cumulative_return: {
    label: "Portfolio Return",
    color: "hsl(var(--chart-1))",
  },
  timestamp: {
    label: "Time",
  },
} satisfies ChartConfig;

type Period = "TODAY" | "5D" | "1M" | "6M" | "1Y" | "ALL";

export default function PortfolioHistory() {
  const [chartData, setChartData] = useState<
    Array<{
      date: string;
      cumulative_return: number;
      cumulative_return_dollar: number;
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
  const [hoveredReturnDollar, setHoveredReturnDollar] = useState<number | null>(
    null,
  );
  const [hoveredReturnPct, setHoveredReturnPct] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const portfolioData = await getPortfolioHistory(selectedPeriod);

      const transformedData = portfolioData.map(
        (snapshot: PortfolioSnapshot) => {
          return {
            date: new Date(snapshot.timestamp).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              timeZone: "America/New_York",
            }),
            cumulative_return: snapshot.cumulative_return * 100,
            cumulative_return_dollar: snapshot.cumulative_return_dollar,
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
          };
        },
      );

      setChartData(transformedData);
      setError(null);
    } catch (err) {
      console.error("Error fetching data:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch portfolio history",
      );
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const periods: Period[] = ["TODAY", "5D", "1M", "6M", "1Y", "ALL"];

  const latest = chartData.at(-1);
  const latestValue = latest?.value ?? null;
  const latestReturnDollar = latest?.cumulative_return_dollar ?? null;
  const latestReturnPct = latest?.cumulative_return ?? null;

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

  const isPositive = latestReturnDollar !== null && latestReturnDollar >= 0;
  const displayValue = hoveredValue ?? latestValue;
  const hoveredChangeAbs = hoveredReturnDollar ?? latestReturnDollar;
  const hoveredChangePct = hoveredReturnPct ?? latestReturnPct;
  const isHoveredPositive = hoveredChangeAbs !== null && hoveredChangeAbs >= 0;
  const showTime = ["TODAY", "5D", "1M"].includes(selectedPeriod);

  return (
    <div className="flex items-start justify-center min-h-screen overflow-x-hidden bg-background">
      <div className="w-full max-w-5xl px-3 sm:px-6 py-4 sm:py-12">
        <div className="flex flex-col gap-4 mb-6 sm:mb-8">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                Live Performance
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1 font-medium">
                Real-time strategy metrics and returns
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <ThemeToggle />
            </div>
          </div>

          <div className="flex flex-wrap justify-start items-center gap-2 bg-transparent p-0">
            {periods.map((period) => {
              const active = selectedPeriod === period;
              return (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  disabled={loading}
                  className={`px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 text-[11px] sm:text-xs md:text-sm font-bold transition-all ${
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "bg-white dark:bg-card text-foreground border-foreground hover:bg-foreground/5"
                  } ${loading ? "cursor-not-allowed opacity-50" : ""}`}
                  style={{ borderWidth: "3px" }}
                  title={`Show ${period} period`}
                >
                  {period === "TODAY"
                    ? "Today"
                    : period === "5D"
                      ? "5D"
                      : period === "1M"
                        ? "1M"
                        : period === "6M"
                          ? "6M"
                          : period === "1Y"
                            ? "1Y"
                            : "All"}
                </button>
              );
            })}
          </div>
        </div>

        <Card className="border-4 border-foreground overflow-hidden shadow-none bg-white dark:bg-card">
          <CardHeader className="pb-0 pt-4 sm:pt-6 px-4 sm:px-6 bg-white dark:bg-card">
            <div className="flex flex-col gap-1 sm:gap-2">
              <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight font-mono">
                {loading ? (
                  <span className="inline-block h-8 sm:h-10 md:h-14 w-32 sm:w-40 md:w-52 animate-pulse rounded bg-muted" />
                ) : (
                  formatCurrency(displayValue)
                )}
              </h2>
              {!loading && hoveredChangeAbs !== null && (
                <>
                  <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                    <span
                      className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-mono ${
                        isHoveredPositive
                          ? "text-emerald-600 dark:text-emerald-500"
                          : "text-red-600 dark:text-red-500"
                      }`}
                    >
                      {isHoveredPositive ? "+" : ""}
                      {formatCurrency(hoveredChangeAbs)}
                    </span>
                    <span
                      className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold font-mono ${
                        isHoveredPositive
                          ? "text-emerald-600 dark:text-emerald-500"
                          : "text-red-600 dark:text-red-500"
                      }`}
                    >
                      ({isHoveredPositive ? "+" : ""}
                      {formatPercent(hoveredChangePct)})
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium tracking-wide">
                    {hoveredShortDate ||
                      (showTime ? latest?.timestamp : latest?.date)}
                  </span>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6 sm:pt-8 pb-4 sm:pb-6 px-2 sm:px-3 md:px-6 bg-white dark:bg-card">
            {loading ? (
              <div className="h-64 sm:h-80 md:h-96 w-full animate-pulse bg-muted" />
            ) : error ? (
              <div className="flex flex-col items-start gap-3 p-4 bg-white dark:bg-card border-4 border-foreground">
                <div className="text-sm">
                  <span className="font-semibold">Failed to load chart.</span>{" "}
                  <span className="text-muted-foreground">{error}</span>
                </div>
                <button
                  onClick={fetchData}
                  className="bg-foreground text-background hover:opacity-90 px-4 py-2 text-sm font-bold border-3 border-foreground"
                  style={{ borderWidth: "3px" }}
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="relative">
                <ChartContainer
                  config={chartConfig}
                  className="w-full h-64 sm:h-80 md:h-96"
                >
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
                        const payload = data.activePayload[0]?.payload;
                        setHoveredValue(payload?.value);
                        setHoveredDate(payload?.timestamp);
                        setHoveredShortDate(
                          showTime ? payload?.timestamp : payload?.date,
                        );
                        setHoveredReturnDollar(
                          payload?.cumulative_return_dollar,
                        );
                        setHoveredReturnPct(payload?.cumulative_return);
                      }
                    }}
                    onMouseLeave={() => {
                      setHoveredValue(null);
                      setHoveredDate(null);
                      setHoveredShortDate(null);
                      setHoveredReturnDollar(null);
                      setHoveredReturnPct(null);
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="portfolioGradient"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor={
                            isPositive
                              ? "hsl(142, 76%, 36%)"
                              : "hsl(0, 72%, 51%)"
                          }
                          stopOpacity="0.4"
                        />
                        <stop
                          offset="100%"
                          stopColor={
                            isPositive
                              ? "hsl(142, 76%, 36%)"
                              : "hsl(0, 72%, 51%)"
                          }
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
                    <YAxis hide domain={["auto", "auto"]} />
                    <ChartTooltip
                      cursor={{
                        stroke: "hsl(var(--muted-foreground))",
                        strokeWidth: 2,
                        strokeOpacity: 0.3,
                      }}
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;

                        const data = payload[0].payload;
                        return (
                          <div
                            className="bg-white dark:bg-background p-3 sm:p-4 shadow-xl border-3 border-foreground"
                            style={{ borderWidth: "3px" }}
                          >
                            <p className="text-xs text-muted-foreground mb-2 font-medium tracking-wide uppercase">
                              {showTime ? data.timestamp : data.date}
                            </p>
                            <div className="space-y-1 sm:space-y-1.5">
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-xs sm:text-sm font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-500">
                                  Portfolio
                                </span>
                                <span className="text-sm sm:text-base font-mono font-bold">
                                  {formatCurrency(data.value)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Area
                      dataKey="value"
                      type="monotone"
                      fill="url(#portfolioGradient)"
                      stroke={
                        isPositive ? "hsl(142, 76%, 36%)" : "hsl(0, 72%, 51%)"
                      }
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 6,
                        fill: isPositive
                          ? "hsl(142, 76%, 36%)"
                          : "hsl(0, 72%, 51%)",
                        stroke: "hsl(var(--background))",
                        strokeWidth: 3,
                      }}
                    />
                  </AreaChart>
                </ChartContainer>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mt-4 sm:mt-6">
          <Card className="border-4 border-foreground shadow-none bg-white dark:bg-card">
            <CardHeader className="pb-2 sm:pb-3 md:pb-4 bg-white dark:bg-card">
              <CardDescription className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Total Value
              </CardDescription>
              <CardTitle className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold font-mono">
                {loading ? (
                  <span className="inline-block h-5 sm:h-6 md:h-8 w-20 sm:w-24 md:w-32 animate-pulse bg-muted" />
                ) : (
                  formatCurrency(latestValue)
                )}
              </CardTitle>
            </CardHeader>
          </Card>

          <Card className="border-4 border-foreground shadow-none bg-white dark:bg-card">
            <CardHeader className="pb-2 sm:pb-3 md:pb-4 bg-white dark:bg-card">
              <CardDescription className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Total Return
              </CardDescription>
              <CardTitle className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold font-mono">
                {loading ? (
                  <span className="inline-block h-5 sm:h-6 md:h-8 w-16 sm:w-20 md:w-24 animate-pulse bg-muted" />
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
        </div>
      </div>
    </div>
  );
}
