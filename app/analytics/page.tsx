"use client";

import Link from "next/link";

import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  Wallet,
  DollarSign,
  Search,
  Calendar,
  Activity,
} from "lucide-react";

export default function AnalyticsPage() {
  return (
    <main className="min-h-screen bg-[#050B18] text-white">

      <div className="max-w-md mx-auto px-5 py-6 pb-28">

        {/* Header */}

        <div className="flex items-center justify-between mb-8">

          <Link href="/dashboard">

            <button className="w-12 h-12 rounded-2xl border border-slate-800 bg-[#101A2C] flex items-center justify-center">

              <ArrowLeft size={22} />

            </button>

          </Link>

          <div className="text-center">

            <h1 className="text-2xl font-bold">
              Analytics
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Portfolio performance & statistics
            </p>

          </div>

          <div className="w-12 h-12 rounded-2xl border border-slate-800 bg-[#101A2C] flex items-center justify-center">

            <BarChart3
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* Analytics Card */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                Portfolio Performance
              </h2>

              <p className="mt-2 text-cyan-100">
                Monitor your portfolio growth over time.
              </p>

            </div>

            <TrendingUp
              size={46}
              className="text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4">

            <p className="text-sm text-cyan-100">
              Total Portfolio Value
            </p>

            <p className="mt-2 text-3xl font-bold">
              $0.00
            </p>

          </div>

        </div>

        {/* Search */}

        <div className="mt-8">

          <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-[#101A2C] px-4 py-4">

            <Search
              size={22}
              className="text-slate-400"
            />

            <input
              type="text"
              placeholder="Search analytics..."
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* Analytics Overview */}
        <div className="mt-8 space-y-4">

          {/* Total Profit */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <DollarSign
                  size={28}
                  className="text-green-400"
                />

                <div>

                  <h3 className="font-bold text-lg">
                    Total Profit
                  </h3>

                  <p className="text-sm text-slate-400">
                    Profit & Loss
                  </p>

                </div>

              </div>

              <span className="font-bold text-green-400">
                +$0.00
              </span>

            </div>

          </div>

          {/* Portfolio */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <Wallet
                  size={28}
                  className="text-cyan-400"
                />

                <div>

                  <h3 className="font-bold text-lg">
                    Portfolio
                  </h3>

                  <p className="text-sm text-slate-400">
                    Total Assets
                  </p>

                </div>

              </div>

              <span className="font-bold">
                7 Coins
              </span>

            </div>

          </div>

          {/* AI Trading */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <Activity
                  size={28}
                  className="text-purple-400"
                />

                <div>

                  <h3 className="font-bold text-lg">
                    AI Trading
                  </h3>

                  <p className="text-sm text-slate-400">
                    Performance
                  </p>

                </div>

              </div>

              <span className="font-bold text-cyan-400">
                Ready
              </span>

            </div>

          </div>

        </div>

        {/* Statistics */}
        <div className="mt-8">

          <h2 className="text-xl font-bold mb-4">
            Performance Statistics
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

              <TrendingUp
                size={28}
                className="text-green-400"
              />

              <p className="mt-4 text-sm text-slate-400">
                Daily Change
              </p>

              <p className="mt-2 text-2xl font-bold text-green-400">
                +0.00%
              </p>

            </div>

            <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

              <Calendar
                size={28}
                className="text-cyan-400"
              />

              <p className="mt-4 text-sm text-slate-400">
                Monthly Return
              </p>

              <p className="mt-2 text-2xl font-bold">
                0.00%
              </p>

            </div>

          </div>

        </div>

        {/* Portfolio Chart */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <h2 className="text-xl font-bold">
            Portfolio Growth
          </h2>

          <p className="mt-2 text-cyan-100">
            Your portfolio performance chart will appear here when live data is connected.
          </p>

          <div className="mt-6 h-40 rounded-2xl bg-white/10 flex items-center justify-center">

            <BarChart3
              size={60}
              className="text-white"
            />

          </div>

        </div>

        {/* Time Filters */}

        <div className="mt-8 grid grid-cols-4 gap-3">

          <button className="rounded-2xl bg-cyan-500 py-3 font-bold text-black">
            1D
          </button>

          <button className="rounded-2xl border border-slate-800 bg-[#101A2C] py-3 font-bold">
            7D
          </button>

          <button className="rounded-2xl border border-slate-800 bg-[#101A2C] py-3 font-bold">
            1M
          </button>

          <button className="rounded-2xl border border-slate-800 bg-[#101A2C] py-3 font-bold">
            1Y
          </button>

        </div>

        {/* Footer */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Analytics Summary
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Transactions
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Deposits
              </span>

              <span className="font-bold">
                $0.00
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Withdrawals
              </span>

              <span className="font-bold">
                $0.00
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                AI Trading Status
              </span>

              <span className="font-bold text-cyan-400">
                Ready
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="mt-10 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Analytics
          </p>

          <p className="mt-2 font-semibold text-cyan-400">
            ai-tonkeeper.xyz
          </p>

          <p className="mt-6 text-xs text-slate-600">
            © 2026 AI TONKEEPER. All rights reserved.
          </p>

        </div>

      </div>

    </main>

  );
}