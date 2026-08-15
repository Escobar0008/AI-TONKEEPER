"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Briefcase,
  Wallet,
  TrendingUp,
  PieChart,
  Search,
  Bot,
  CreditCard,
  RefreshCw,
  Send,
  ArrowDownToLine,
} from "lucide-react";

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-[#050B18] text-white">

      <div className="mx-auto max-w-md px-5 py-6 pb-28">

        {/* Header */}
        <div className="mb-8 flex items-center justify-between">

          <Link
            href="/dashboard"
            className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]"
          >
            <ArrowLeft size={22} />
          </Link>

          <div className="text-center">

            <h1 className="text-2xl font-bold">
              Portfolio
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Manage all your crypto assets
            </p>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">

            <Briefcase
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* Portfolio Card */}
        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                Total Portfolio
              </h2>

              <p className="mt-2 text-cyan-100">
                Total value of your crypto assets.
              </p>

            </div>

            <Wallet
              size={46}
              className="text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4">

            <p className="text-sm text-cyan-100">
              Portfolio Value
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
              placeholder="Search asset..."
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* Portfolio Assets */}
        <div className="mt-8 space-y-4">

          {/* TON */}
          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <img
                  src="/coins/ton.png"
                  alt="TON"
                  className="h-12 w-12 rounded-full"
                />

                <div>

                  <h3 className="text-lg font-bold">
                    Toncoin
                  </h3>

                  <p className="text-sm text-slate-400">
                    Balance: 0.0000 TON
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
                    0.00%
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
                  className="h-12 w-12 rounded-full"
                />

                <div>

                  <h3 className="text-lg font-bold">
                    Bitcoin
                  </h3>

                  <p className="text-sm text-slate-400">
                    Balance: 0.0000 BTC
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
                    0.00%
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
                  className="h-12 w-12 rounded-full"
                />

                <div>

                  <h3 className="text-lg font-bold">
                    Ethereum
                  </h3>

                  <p className="text-sm text-slate-400">
                    Balance: 0.0000 ETH
                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="font-bold">
                  $0.00
                </p>

                <div className="flex items-center justify-end gap-1 text-red-400">

                  <TrendingUp size={16} />

                  <span className="text-sm">
                    0.00%
                  </span>

                </div>

              </div>

            </div>
          </div>

        </div>

        {/* Portfolio Distribution */}
        <div className="mt-8">

          <h2 className="mb-4 text-xl font-bold">
            Portfolio Distribution
          </h2>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

            <div className="flex items-center justify-center">

              <PieChart
                size={90}
                className="text-cyan-400"
              />

            </div>

            <p className="mt-5 text-center text-sm text-slate-400">
              Your portfolio allocation will appear here.
            </p>

          </div>

        </div>

        {/* Quick Actions */}
        <div className="mt-8">

          <h2 className="mb-4 text-xl font-bold">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-3xl bg-cyan-500 py-5 font-bold text-black"
            >
              <Bot size={22} />
              Trade with AI
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-3xl border border-slate-800 bg-[#101A2C] py-5 font-bold"
            >
              <CreditCard size={22} />
              Buy Crypto
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-3xl border border-slate-800 bg-[#101A2C] py-5 font-bold"
            >
              <RefreshCw size={22} />
              Swap
            </button>

            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-3xl border border-slate-800 bg-[#101A2C] py-5 font-bold"
            >
              <Send size={22} />
              Send
            </button>

            <button
              type="button"
              className="col-span-2 flex items-center justify-center gap-2 rounded-3xl border border-slate-800 bg-[#101A2C] py-5 font-bold"
            >
              <ArrowDownToLine size={22} />
              Deposit
            </button>

          </div>

        </div>

        {/* Portfolio Summary */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Portfolio Summary
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Assets
              </span>

              <span className="font-bold">
                7 Coins
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Balance
              </span>

              <span className="font-bold">
                $0.00
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Today&apos;s Change
              </span>

              <span className="font-bold text-green-400">
                +0.00%
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
            AI TONKEEPER Portfolio
          </p>

          <p className="mt-2 font-semibold text-cyan-400">
            ai-tonkeeper.xyz
          </p>

          <p className="mt-6 text-xs text-slate-600">
            ©️ 2026 AI TONKEEPER. All rights reserved.
          </p>

        </div>

      </div>
    </main>
  );
}