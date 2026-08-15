"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Bot,
  Play,
  Pause,
  Activity,
  Shield,
  TrendingUp,
  Search,
} from "lucide-react";

export default function AIBotsPage() {
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
              AI Trade Bots
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Intelligent automated trading
            </p>

          </div>

          <div className="w-12 h-12 rounded-2xl border border-slate-800 bg-[#101A2C] flex items-center justify-center">

            <Bot
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* Overview Card */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                AI Trading Bots
              </h2>

              <p className="mt-2 text-cyan-100">
                Manage your automated trading strategies.
              </p>

            </div>

            <Activity
              size={46}
              className="text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4">

            <p className="text-sm text-cyan-100">
              Active Bots
            </p>

            <p className="mt-2 text-3xl font-bold">
              0
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
              placeholder="Search AI bots..."
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* AI Bots List */}
        <div className="mt-8 space-y-4">

          {/* Conservative Bot */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">

                  <Bot
                    size={24}
                    className="text-cyan-400"
                  />

                </div>

                <div>

                  <h3 className="text-lg font-bold">
                    Conservative Bot
                  </h3>

                  <p className="text-sm text-slate-400">
                    Low Risk
                  </p>

                </div>

              </div>

              <button className="rounded-2xl bg-green-500 px-4 py-2 font-bold text-black flex items-center gap-2">

                <Play size={18} />

                Start

              </button>

            </div>

          </div>

          {/* Balanced Bot */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">

                  <Bot
                    size={24}
                    className="text-yellow-400"
                  />

                </div>

                <div>

                  <h3 className="text-lg font-bold">
                    Balanced Bot
                  </h3>

                  <p className="text-sm text-slate-400">
                    Medium Risk
                  </p>

                </div>

              </div>

              <button className="rounded-2xl border border-slate-700 px-4 py-2 font-bold flex items-center gap-2">

                <Pause size={18} />

                Pause

              </button>

            </div>

          </div>

          {/* Aggressive Bot */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">

                  <Bot
                    size={24}
                    className="text-red-400"
                  />

                </div>

                <div>

                  <h3 className="text-lg font-bold">
                    Aggressive Bot
                  </h3>

                  <p className="text-sm text-slate-400">
                    High Risk
                  </p>

                </div>

              </div>

              <button className="rounded-2xl bg-green-500 px-4 py-2 font-bold text-black flex items-center gap-2">

                <Play size={18} />

                Start

              </button>

            </div>

          </div>

        </div>

        {/* Bot Performance */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Bot Performance
          </h2>

          <div className="mt-6 space-y-5">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Profit
              </span>

              <span className="font-bold text-green-400">
                +0.00%
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Active Trades
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Winning Rate
              </span>

              <span className="font-bold text-cyan-400">
                0%
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Trades
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

          </div>

        </div>

        {/* Risk Management */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center gap-4">

            <Shield
              size={36}
              className="text-white"
            />

            <div>

              <h2 className="text-xl font-bold">
                Risk Management
              </h2>

              <p className="mt-2 text-cyan-100">
                Configure capital protection, stop-loss limits and AI safety controls.
              </p>

            </div>

          </div>

        </div>

        {/* Bot Statistics */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Bot Statistics
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Active Bots
              </span>

              <span className="font-bold text-green-400">
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
                Protected Capital
              </span>

              <span className="font-bold text-cyan-400">
                Enabled
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                AI Status
              </span>

              <span className="font-bold text-green-400">
                Online
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="mt-10 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER AI Trade Bots
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