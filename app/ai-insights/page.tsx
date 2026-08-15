"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Brain,
  TrendingUp,
  ShieldAlert,
  Sparkles,
  Search,
} from "lucide-react";

export default function AIInsightsPage() {
  return (
    <main className="min-h-screen bg-[#050B18] text-white">

      <div className="mx-auto w-full max-w-md px-5 py-6 pb-28">

        {/* Header */}

        <div className="mb-8 flex items-center justify-between">

          <Link href="/dashboard">

            <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">

              <ArrowLeft size={22} />

            </button>

          </Link>

          <div className="flex-1 px-3 text-center">

            <h1 className="text-2xl font-bold">
              AI Insights
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Smart market & portfolio analysis
            </p>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">

            <Brain
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* Hero Card */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between gap-4">

            <div className="min-w-0 flex-1">

              <h2 className="text-2xl font-bold">
                AI Market Insights
              </h2>

              <p className="mt-2 text-sm text-cyan-100">
                Receive intelligent portfolio analysis and market predictions powered by AI.
              </p>

            </div>

            <Sparkles
              size={46}
              className="shrink-0 text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-5">

            <p className="text-sm text-cyan-100">
              AI Confidence Score
            </p>

            <p className="mt-2 text-4xl font-bold">
              0%
            </p>

          </div>

        </div>

        {/* Search */}

        <div className="mt-8">

          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#101A2C] px-4 py-4">

            <Search
              size={22}
              className="shrink-0 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search AI insights..."
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* AI Analysis */}
        <div className="mt-8 space-y-4">

          {/* Portfolio Analysis */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start gap-4">

              <Brain
                size={30}
                className="shrink-0 text-cyan-400"
              />

              <div className="min-w-0 flex-1">

                <h3 className="text-lg font-bold">
                  Portfolio Analysis
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  AI continuously analyzes your portfolio allocation and overall diversification.
                </p>

              </div>

            </div>

          </div>

          {/* Market Trend */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start gap-4">

              <TrendingUp
                size={30}
                className="shrink-0 text-green-400"
              />

              <div className="min-w-0 flex-1">

                <h3 className="text-lg font-bold">
                  Market Trend
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  AI detects the current market direction and identifies possible opportunities.
                </p>

              </div>

            </div>

          </div>

          {/* Risk Detection */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start gap-4">

              <ShieldAlert
                size={30}
                className="shrink-0 text-yellow-400"
              />

              <div className="min-w-0 flex-1">

                <h3 className="text-lg font-bold">
                  Risk Detection
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Monitor exposure, volatility and potential investment risks in real time.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* AI Recommendation */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            AI Recommendation
          </h2>

          <div className="mt-6 space-y-5">

            <div className="rounded-2xl bg-[#0B1425] p-4">

              <div className="flex items-start gap-4">

                <Sparkles
                  size={28}
                  className="shrink-0 text-cyan-400"
                />

                <div className="min-w-0 flex-1">

                  <h3 className="font-bold">
                    Smart Recommendation
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    AI recommendations will appear here once market data and your portfolio are connected.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Portfolio Score */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-start justify-between gap-4">

            <div className="min-w-0 flex-1">

              <h2 className="text-xl font-bold">
                Portfolio Score
              </h2>

              <p className="mt-2 text-sm text-cyan-100">
                Overall AI evaluation of your portfolio health.
              </p>

            </div>

            <Brain
              size={40}
              className="shrink-0 text-white"
            />

          </div>

          <div className="mt-6">

            <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">

              <div className="h-full w-0 rounded-full bg-white"></div>

            </div>

            <div className="mt-3 flex items-center justify-between text-sm">

              <span>
                Score
              </span>

              <span className="font-bold">
                0 / 100
              </span>

            </div>

          </div>

        </div>

        {/* AI Statistics */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            AI Statistics
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Portfolio Health
              </span>

              <span className="font-bold text-green-400">
                Good
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Market Trend
              </span>

              <span className="font-bold text-cyan-400">
                Neutral
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Risk Level
              </span>

              <span className="font-bold text-yellow-400">
                Medium
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Last Analysis
              </span>

              <span className="font-bold">
                Just now
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER AI Insights
          </p>

          <p className="mt-2 font-semibold text-cyan-400">
            ai-tonkeeper.xyz
          </p>

          <p className="mt-4 text-xs text-slate-600">
            © 2026 AI TONKEEPER. All rights reserved.
          </p>

        </footer>

      </div>

    </main>

  );
}