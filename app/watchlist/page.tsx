"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Star,
  Search,
  TrendingUp,
  TrendingDown,
  Bell,
  Bot,
  CreditCard,
  RefreshCw,
  Eye,
} from "lucide-react";

export default function WatchlistPage() {
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
              Watchlist
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Track your favorite cryptocurrencies
            </p>

          </div>

          <div className="w-12 h-12 rounded-2xl border border-slate-800 bg-[#101A2C] flex items-center justify-center">

            <Eye
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* Watchlist Card */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                My Watchlist
              </h2>

              <p className="mt-2 text-cyan-100">
                Follow your favorite crypto assets in real time.
              </p>

            </div>

            <Star
              size={46}
              className="text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4">

            <p className="text-sm text-cyan-100">
              Favorite Coins
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

        {/* Watchlist Coins */}
        <div className="mt-8 space-y-4">

          {/* TON */}

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
                    TON
                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="font-bold">
                  $0.00
                </p>

                <div className="flex items-center justify-end gap-1 text-green-400">

                  <TrendingUp size={16} />

                  <span className="text-sm">
                    +0.00%
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* Bitcoin */}

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
                    BTC
                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="font-bold">
                  $0.00
                </p>

                <div className="flex items-center justify-end gap-1 text-red-400">

                  <TrendingDown size={16} />

                  <span className="text-sm">
                    -0.00%
                  </span>

                </div>

              </div>

            </div>

          </div>

          {/* Ethereum */}

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
                    ETH
                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="font-bold">
                  $0.00
                </p>

                <div className="flex items-center justify-end gap-1 text-green-400">

                  <TrendingUp size={16} />

                  <span className="text-sm">
                    +0.00%
                  </span>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* More Favorites */}
        <div className="mt-8">

          <h2 className="text-xl font-bold mb-4">
            AI Suggestions
          </h2>

          <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

            <div className="flex items-center gap-4">

              <Bot
                size={34}
                className="text-white"
              />

              <div>

                <h3 className="text-xl font-bold">
                  AI Market Insights
                </h3>

                <p className="mt-2 text-cyan-100">
                  AI monitors the market and recommends cryptocurrencies worth watching.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Quick Actions */}

        <div className="mt-8">

          <h2 className="text-xl font-bold mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <button className="rounded-3xl bg-cyan-500 py-5 font-bold text-black flex items-center justify-center gap-2">

              <CreditCard size={22} />

              Buy Crypto

            </button>

            <button className="rounded-3xl border border-slate-800 bg-[#101A2C] py-5 font-bold flex items-center justify-center gap-2">

              <RefreshCw size={22} />

              Swap

            </button>

            <button className="rounded-3xl border border-slate-800 bg-[#101A2C] py-5 font-bold flex items-center justify-center gap-2">

              <Bot size={22} />

              Trade with AI

            </button>

            <button className="rounded-3xl border border-slate-800 bg-[#101A2C] py-5 font-bold flex items-center justify-center gap-2">

              <Bell size={22} />

              Price Alerts

            </button>

          </div>

        </div>

        {/* Watchlist Summary */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Watchlist Summary
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Favorite Coins
              </span>

              <span className="font-bold">
                3
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Price Alerts
              </span>

              <span className="font-bold">
                0 Active
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                AI Recommendations
              </span>

              <span className="font-bold text-cyan-400">
                Available
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Last Update
              </span>

              <span className="font-bold text-green-400">
                Just Now
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="mt-10 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Watchlist
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