"use client";

import Link from "next/link";

import {
  ArrowLeft,
  BookOpen,
  Brain,
  BarChart3,
  Clock,
  Search,
} from "lucide-react";

export default function AITradingJournalPage() {
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
              AI Trading Journal
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Track every AI trading decision
            </p>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">

            <BookOpen
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* Hero */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between gap-4">

            <div className="min-w-0 flex-1">

              <h2 className="text-2xl font-bold">
                AI Trading Journal
              </h2>

              <p className="mt-2 text-sm text-cyan-100">
                Review every AI trade, performance and decision in one place.
              </p>

            </div>

            <Brain
              size={46}
              className="shrink-0 text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-5">

            <p className="text-sm text-cyan-100">
              Total Trades
            </p>

            <p className="mt-2 text-4xl font-bold">
              0
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
              placeholder="Search trading journal..."
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* Trading Entries */}
        <div className="mt-8 space-y-4">

          {/* Latest Trade */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start gap-4">

              <BarChart3
                size={30}
                className="shrink-0 text-green-400"
              />

              <div className="min-w-0 flex-1">

                <h3 className="text-lg font-bold">
                  Latest Trade
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Review the most recent AI trade executed in your portfolio.
                </p>

              </div>

            </div>

          </div>

          {/* AI Decision */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start gap-4">

              <Brain
                size={30}
                className="shrink-0 text-cyan-400"
              />

              <div className="min-w-0 flex-1">

                <h3 className="text-lg font-bold">
                  AI Decision
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Understand why AI entered or exited a position based on market analysis.
                </p>

              </div>

            </div>

          </div>

          {/* Trade Timeline */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start gap-4">

              <Clock
                size={30}
                className="shrink-0 text-yellow-400"
              />

              <div className="min-w-0 flex-1">

                <h3 className="text-lg font-bold">
                  Trade Timeline
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  View the exact date and time of every AI trading action.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Trading Performance */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Trading Performance
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Profit & Loss
              </span>

              <span className="font-bold text-green-400">
                $0.00
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Win Rate
              </span>

              <span className="font-bold text-cyan-400">
                0%
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Average Return
              </span>

              <span className="font-bold text-green-400">
                +0.00%
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

          </div>

        </div>

        {/* Journal Summary */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between gap-4">

            <div className="min-w-0 flex-1">

              <h2 className="text-xl font-bold">
                Journal Summary
              </h2>

              <p className="mt-2 text-sm text-cyan-100">
                AI summarizes your trading activity and overall performance over time.
              </p>

            </div>

            <BookOpen
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
                Progress
              </span>

              <span className="font-bold">
                0%
              </span>

            </div>

          </div>

        </div>

        {/* Trading Statistics */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Trading Statistics
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Trades
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Winning Trades
              </span>

              <span className="font-bold text-green-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Losing Trades
              </span>

              <span className="font-bold text-red-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Best Trade
              </span>

              <span className="font-bold text-cyan-400">
                $0.00
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Worst Trade
              </span>

              <span className="font-bold text-orange-400">
                $0.00
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Trading Journal
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