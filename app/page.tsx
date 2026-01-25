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
import {
  getPortfolioHistory,
  getPortfolioSummary,
  type PortfolioSnapshot,
  type PortfolioSummary,
} from "@/lib/api";

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
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [portfolioData, summaryData] = await Promise.all([
        getPortfolioHistory(selectedPeriod),
        getPortfolioSummary(selectedPeriod),
      ]);

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
      setSummary(summaryData);
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
      <div className="w-full max-w-6xl px-3 sm:px-6 py-2 sm:py-4">
        <div className="flex flex-col gap-3 mb-4 sm:mb-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
              Live Performance
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-muted-foreground font-medium">
              Real-time strategy metrics and returns
            </p>
          </div>

          <div className="flex flex-wrap justify-start items-center gap-2">
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
          <CardHeader className="pb-0 pt-3 sm:pt-4 md:pt-5 px-4 sm:px-6 bg-white dark:bg-card">
            <div className="flex flex-col gap-1 sm:gap-1.5">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight font-mono">
                {loading ? (
                  <span className="inline-block h-7 sm:h-8 md:h-12 w-32 sm:w-40 md:w-52 animate-pulse rounded bg-muted" />
                ) : (
                  formatCurrency(displayValue)
                )}
              </h2>
              {!loading && hoveredChangeAbs !== null && (
                <>
                  <div className="flex items-baseline gap-2 sm:gap-3 flex-wrap">
                    <span
                      className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-mono ${
                        isHoveredPositive
                          ? "text-emerald-600 dark:text-emerald-500"
                          : "text-red-600 dark:text-red-500"
                      }`}
                    >
                      {isHoveredPositive ? "+" : ""}
                      {formatCurrency(hoveredChangeAbs)}
                    </span>
                    <span
                      className={`text-base sm:text-lg md:text-xl lg:text-2xl font-bold font-mono ${
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
          <CardContent className="pt-4 sm:pt-5 pb-3 sm:pb-4 px-2 sm:px-3 md:px-6 bg-white dark:bg-card">
            {loading ? (
              <div className="h-48 sm:h-56 md:h-64 w-full animate-pulse bg-muted" />
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
                  className="w-full h-48 sm:h-56 md:h-64"
                >
                  <AreaChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                      left: 0,
                      right: 0,
                      top: 10,
                      bottom: 10,
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
                      horizontal={true}
                      strokeOpacity={0.08}
                      stroke="hsl(var(--foreground))"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mt-4 sm:mt-5">
          <Card className="border-4 border-foreground shadow-none bg-white dark:bg-card">
            <CardHeader className="py-1.5 sm:py-2 px-4 sm:px-5 bg-white dark:bg-card flex flex-col items-start justify-between h-full">
              <CardDescription className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                Total Return
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-mono mb-1.5">
                {loading ? (
                  <span className="inline-block h-7 sm:h-8 md:h-10 w-20 sm:w-24 md:w-28 animate-pulse bg-muted" />
                ) : (
                  <span
                    className={
                      summary && summary.total_return >= 0
                        ? "text-emerald-600 dark:text-emerald-500"
                        : "text-red-600 dark:text-red-500"
                    }
                  >
                    {formatPercent(summary ? summary.total_return * 100 : null)}
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-[9px] sm:text-[10px] md:text-xs font-medium text-muted-foreground">
                {selectedPeriod === "1Y"
                  ? "For 1 year"
                  : selectedPeriod === "ALL"
                    ? "All time"
                    : `For ${selectedPeriod.toLowerCase()}`}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-4 border-foreground shadow-none bg-white dark:bg-card">
            <CardHeader className="py-1.5 sm:py-2 px-4 sm:px-5 bg-white dark:bg-card flex flex-col items-start justify-between h-full">
              <CardDescription className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                Annualized Mean Return
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-mono mb-1.5">
                {loading ? (
                  <span className="inline-block h-7 sm:h-8 md:h-10 w-20 sm:w-24 md:w-28 animate-pulse bg-muted" />
                ) : (
                  <span
                    className={
                      summary && summary.mean_return_ann >= 0
                        ? "text-emerald-600 dark:text-emerald-500"
                        : "text-red-600 dark:text-red-500"
                    }
                  >
                    {formatPercent(
                      summary ? summary.mean_return_ann * 100 : null,
                    )}
                  </span>
                )}
              </CardTitle>
              <CardDescription className="text-[9px] sm:text-[10px] md:text-xs font-medium text-muted-foreground">
                Expected annual return
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-4 border-foreground shadow-none bg-white dark:bg-card">
            <CardHeader className="py-1.5 sm:py-2 px-4 sm:px-5 bg-white dark:bg-card flex flex-col items-start justify-between h-full">
              <CardDescription className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                Annualized Volatility
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-mono mb-1.5">
                {loading ? (
                  <span className="inline-block h-7 sm:h-8 md:h-10 w-20 sm:w-24 md:w-28 animate-pulse bg-muted" />
                ) : (
                  formatPercent(summary ? summary.volatility_ann * 100 : null)
                )}
              </CardTitle>
              <CardDescription className="text-[9px] sm:text-[10px] md:text-xs font-medium text-muted-foreground">
                Risk measure (std dev)
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-4 border-foreground shadow-none bg-white dark:bg-card">
            <CardHeader className="py-1.5 sm:py-2 px-4 sm:px-5 bg-white dark:bg-card flex flex-col items-start justify-between h-full">
              <CardDescription className="text-[9px] sm:text-[10px] md:text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">
                Annualized Sharpe
              </CardDescription>
              <CardTitle className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-mono mb-1.5">
                {loading ? (
                  <span className="inline-block h-7 sm:h-8 md:h-10 w-16 sm:w-20 md:w-24 animate-pulse bg-muted" />
                ) : (
                  (summary?.sharpe?.toFixed(2) ?? "—")
                )}
              </CardTitle>
              <CardDescription className="text-[9px] sm:text-[10px] md:text-xs font-medium text-muted-foreground">
                Risk-adjusted return
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}
