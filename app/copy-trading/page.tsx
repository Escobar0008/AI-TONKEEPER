"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Users,
  Trophy,
  TrendingUp,
  Play,
  Search,
} from "lucide-react";

export default function CopyTradingPage() {
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
              Copy Trading
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Follow top AI traders automatically
            </p>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">

            <Users
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
                Copy Trading
              </h2>

              <p className="mt-2 text-sm text-cyan-100">
                Copy successful trading strategies with one tap.
              </p>

            </div>

            <Trophy
              size={46}
              className="shrink-0 text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-5">

            <p className="text-sm text-cyan-100">
              Active Copies
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
              placeholder="Search traders..."
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* Traders List */}
        <div className="mt-8 space-y-4">

          {/* Top Trader */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start gap-4">

              <Trophy
                size={30}
                className="shrink-0 text-yellow-400"
              />

              <div className="min-w-0 flex-1">

                <h3 className="text-lg font-bold">
                  Top Trader
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Follow the highest-performing trader selected by AI.
                </p>

              </div>

            </div>

          </div>

          {/* Performance */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start gap-4">

              <TrendingUp
                size={30}
                className="shrink-0 text-green-400"
              />

              <div className="min-w-0 flex-1">

                <h3 className="text-lg font-bold">
                  Performance
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Monitor 7-day, 30-day and overall trading performance before copying.
                </p>

              </div>

            </div>

          </div>

          {/* Start Copy */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start justify-between gap-4">

              <div className="flex min-w-0 flex-1 items-start gap-4">

                <Play
                  size={30}
                  className="shrink-0 text-cyan-400"
                />

                <div className="min-w-0 flex-1">

                  <h3 className="text-lg font-bold">
                    Start Copy
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Start copying a trader instantly using your selected investment amount.
                  </p>

                </div>

              </div>

              <button className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600">

                Start

              </button>

            </div>

          </div>

        </div>

        {/* Copy Statistics */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Copy Statistics
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Active Traders
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Profit
              </span>

              <span className="font-bold text-green-400">
                $0.00
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Success Rate
              </span>

              <span className="font-bold text-cyan-400">
                0%
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

        {/* Copy Progress */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between gap-4">

            <div className="min-w-0 flex-1">

              <h2 className="text-xl font-bold">
                Copy Progress
              </h2>

              <p className="mt-2 text-sm text-cyan-100">
                AI tracks the performance of your copied traders in real time.
              </p>

            </div>

            <Users
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

        {/* Copy History */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Copy History
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Copies
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Running Copies
              </span>

              <span className="font-bold text-green-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Stopped Copies
              </span>

              <span className="font-bold text-red-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Best Trader
              </span>

              <span className="font-bold text-cyan-400">
                —
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Last Update
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
            AI TONKEEPER Copy Trading
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