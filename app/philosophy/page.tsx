import { TrendingUp, Target, BarChart3, Zap } from "lucide-react";

export default function Philosophy() {
  return (
    <div className="flex items-start justify-center min-h-screen overflow-x-hidden bg-background">
      <div className="w-full max-w-6xl px-3 sm:px-6 py-6 sm:py-12">
        <div className="flex flex-col gap-8 sm:gap-12">
          <div className="flex flex-col gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
              Trading Philosophy
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              Our quantitative approach to systematic trading
            </p>
          </div>

          <div className="border-4 border-foreground p-6 sm:p-8 md:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Core Principles
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              Our trading strategy is built on the foundation of systematic,
              data-driven decision making. We believe that markets exhibit
              patterns and inefficiencies that can be captured through rigorous
              quantitative analysis and disciplined execution. By removing
              emotional bias and maintaining strict risk controls, we aim to
              generate consistent returns across various market conditions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="border-4 border-foreground p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="border-4 border-foreground p-3 shrink-0">
                  <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold pt-2">
                  Quantitative Approach
                </h3>
              </div>
              <p className="text-sm sm:text-base leading-relaxed">
                Every trading decision is driven by mathematical models and
                statistical analysis. We continuously test and refine our
                algorithms using historical data and real-time market signals.
              </p>
            </div>

            <div className="border-4 border-foreground p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="border-4 border-foreground p-3 shrink-0">
                  <Target className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold pt-2">
                  Risk Management
                </h3>
              </div>
              <p className="text-sm sm:text-base leading-relaxed">
                Protecting capital is paramount. We employ sophisticated
                position sizing, stop-loss mechanisms, and portfolio
                diversification to manage downside risk while capturing upside
                potential.
              </p>
            </div>

            <div className="border-4 border-foreground p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="border-4 border-foreground p-3 shrink-0">
                  <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold pt-2">
                  Performance Attribution
                </h3>
              </div>
              <p className="text-sm sm:text-base leading-relaxed">
                We decompose returns to understand the sources of alpha. By
                analyzing factor exposures and strategy contributions, we
                identify what works and optimize accordingly.
              </p>
            </div>

            <div className="border-4 border-foreground p-6 sm:p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="border-4 border-foreground p-3 shrink-0">
                  <Zap className="w-6 h-6 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold pt-2">
                  Execution Excellence
                </h3>
              </div>
              <p className="text-sm sm:text-base leading-relaxed">
                Minimizing transaction costs and market impact is critical. Our
                execution algorithms optimize trade timing and sizing to
                maximize net returns after costs.
              </p>
            </div>
          </div>

          <div className="border-4 border-foreground p-6 sm:p-8 md:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-8">
              Strategy Framework
            </h2>

            <div className="space-y-6 sm:space-y-8">
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  Signal Generation
                </h3>
                <p className="text-sm sm:text-base leading-relaxed">
                  Our models analyze multiple data sources including price
                  action, volume patterns, fundamental metrics, and market
                  microstructure. Machine learning techniques help identify
                  complex patterns that traditional analysis might miss.
                </p>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  Portfolio Construction
                </h3>
                <p className="text-sm sm:text-base leading-relaxed">
                  We employ mean-variance optimization with constraints to build
                  diversified portfolios that balance risk and return. Factor
                  exposures are monitored to avoid unintended concentration
                  risk.
                </p>
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3">
                  Continuous Improvement
                </h3>
                <p className="text-sm sm:text-base leading-relaxed">
                  Markets evolve, and so do our strategies. We maintain a
                  research pipeline to test new ideas, refine existing models,
                  and adapt to changing market dynamics through systematic
                  backtesting and walk-forward analysis.
                </p>
              </div>
            </div>
          </div>

          <div className="border-4 border-foreground p-6 sm:p-8 md:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6">
              Transparency & Accountability
            </h2>
            <p className="text-sm sm:text-base leading-relaxed">
              This dashboard represents our commitment to transparency. Every
              metric shown reflects the actual performance of our strategy, with
              no cherry-picking or selective reporting. We track not just
              returns, but also execution quality, turnover costs, and risk
              metrics to provide a complete picture of strategy performance. By
              monitoring and analyzing these factors continuously, we ensure
              accountability and maintain the discipline required for long-term
              success in quantitative trading.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
