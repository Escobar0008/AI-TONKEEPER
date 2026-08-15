"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Bell,
  Plus,
  Search,
  Bot,
  Coins,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

export default function PriceAlertsPage() {
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
              Price Alerts
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Create and manage crypto price alerts
            </p>

          </div>

          <div className="w-12 h-12 rounded-2xl border border-slate-800 bg-[#101A2C] flex items-center justify-center">

            <Bell
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* Alert Card */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                Active Alerts
              </h2>

              <p className="mt-2 text-cyan-100">
                Stay informed when the market reaches your target prices.
              </p>

            </div>

            <Bell
              size={46}
              className="text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4">

            <p className="text-sm text-cyan-100">
              Active Alerts
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
              placeholder="Search cryptocurrency..."
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* Active Alerts */}
        <div className="mt-8 space-y-4">

          {/* TON Alert */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <img
                  src="/coins/ton.png"
                  alt="TON"
                  className="w-12 h-12 rounded-full"
                />

                <div>

                  <h3 className="font-bold text-lg">
                    Toncoin
                  </h3>

                  <p className="text-sm text-slate-400">
                    Alert above $5.00
                  </p>

                </div>

              </div>

              <TrendingUp
                size={24}
                className="text-green-400"
              />

            </div>

          </div>

          {/* Bitcoin Alert */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <img
                  src="/coins/btc.png"
                  alt="BTC"
                  className="w-12 h-12 rounded-full"
                />

                <div>

                  <h3 className="font-bold text-lg">
                    Bitcoin
                  </h3>

                  <p className="text-sm text-slate-400">
                    Alert below $100,000
                  </p>

                </div>

              </div>

              <TrendingDown
                size={24}
                className="text-red-400"
              />

            </div>

          </div>

          {/* Ethereum Alert */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <img
                  src="/coins/eth.png"
                  alt="ETH"
                  className="w-12 h-12 rounded-full"
                />

                <div>

                  <h3 className="font-bold text-lg">
                    Ethereum
                  </h3>

                  <p className="text-sm text-slate-400">
                    Alert above $5,000
                  </p>

                </div>

              </div>

              <TrendingUp
                size={24}
                className="text-green-400"
              />

            </div>

          </div>

        </div>

        {/* Create New Alert */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <div className="flex items-center gap-3 mb-4">

            <Plus
              size={24}
              className="text-cyan-400"
            />

            <h2 className="text-xl font-bold">
              Create New Alert
            </h2>

          </div>
          <div className="space-y-4">

            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Cryptocurrency
              </label>

              <select className="w-full rounded-2xl border border-slate-800 bg-[#050B18] p-4 outline-none">

                <option>Toncoin (TON)</option>
                <option>Bitcoin (BTC)</option>
                <option>Ethereum (ETH)</option>
                <option>BNB</option>
                <option>Solana (SOL)</option>

              </select>

            </div>

            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Target Price
              </label>

              <input
                type="number"
                placeholder="Enter target price"
                className="w-full rounded-2xl border border-slate-800 bg-[#050B18] p-4 outline-none placeholder:text-slate-500"
              />

            </div>

            <div>

              <label className="mb-2 block text-sm text-slate-400">
                Alert Condition
              </label>

              <select className="w-full rounded-2xl border border-slate-800 bg-[#050B18] p-4 outline-none">

                <option>Price Above</option>
                <option>Price Below</option>

              </select>

            </div>

            <button className="mt-2 w-full rounded-2xl bg-cyan-500 py-4 font-bold text-black">

              Create Alert

            </button>

          </div>

        </div>

        {/* AI Suggestions */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center gap-4">

            <Bot
              size={34}
              className="text-white"
            />

            <div>

              <h2 className="text-xl font-bold">
                AI Alert Suggestions
              </h2>

              <p className="mt-2 text-cyan-100">
                AI analyzes the market and recommends smart price alerts based on trends and volatility.
              </p>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Alerts Summary
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Active Alerts
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Triggered Today
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Email Notifications
              </span>

              <span className="font-bold text-cyan-400">
                Enabled
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Push Notifications
              </span>

              <span className="font-bold text-green-400">
                Enabled
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="mt-10 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Price Alerts
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