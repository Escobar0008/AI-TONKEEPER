"use client";

import Link from "next/link";

import {
  ArrowLeft,
  History,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  CreditCard,
  Bot,
} from "lucide-react";

export default function TransactionsPage() {
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
              Transactions
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Complete history of your wallet activity
            </p>

          </div>

          <div className="w-12 h-12 rounded-2xl border border-slate-800 bg-[#101A2C] flex items-center justify-center">

            <History
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
                Transaction History
              </h2>

              <p className="mt-2 text-cyan-100">
                View deposits, withdrawals, swaps, purchases and AI Trading activity.
              </p>

            </div>

            <History
              size={46}
              className="text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4">

            <p className="text-sm text-cyan-100">
              Total Transactions
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
              placeholder="Search transactions..."
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* Transaction List */}
        <div className="mt-8 space-y-4">

          {/* Deposit */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">

                  <ArrowDownLeft
                    size={24}
                    className="text-green-400"
                  />

                </div>

                <div>

                  <h3 className="text-lg font-bold">
                    Deposit
                  </h3>

                  <p className="text-sm text-slate-400">
                    Completed
                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="font-bold text-green-400">
                  +0.00 TON
                </p>

                <p className="text-xs text-slate-500">
                  Just now
                </p>

              </div>

            </div>

          </div>

          {/* Send */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">

                  <ArrowUpRight
                    size={24}
                    className="text-red-400"
                  />

                </div>

                <div>

                  <h3 className="text-lg font-bold">
                    Send
                  </h3>

                  <p className="text-sm text-slate-400">
                    Pending
                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="font-bold text-red-400">
                  -0.00 TON
                </p>

                <p className="text-xs text-slate-500">
                  Today
                </p>

              </div>

            </div>

          </div>

          {/* Swap */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500/10">

                  <RefreshCw
                    size={24}
                    className="text-cyan-400"
                  />

                </div>

                <div>

                  <h3 className="text-lg font-bold">
                    Swap
                  </h3>

                  <p className="text-sm text-slate-400">
                    Completed
                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="font-bold">
                  TON → USDT
                </p>

                <p className="text-xs text-slate-500">
                  Yesterday
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Other Transactions */}
        <div className="mt-8">

          <h2 className="text-xl font-bold mb-4">
            Other Transactions
          </h2>

          <div className="space-y-4">

            {/* Buy */}

            <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-4">

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10">

                    <CreditCard
                      size={24}
                      className="text-yellow-400"
                    />

                  </div>

                  <div>

                    <h3 className="text-lg font-bold">
                      Buy Crypto
                    </h3>

                    <p className="text-sm text-slate-400">
                      Completed
                    </p>

                  </div>

                </div>

                <div className="text-right">

                  <p className="font-bold text-green-400">
                    +0.00 TON
                  </p>

                  <p className="text-xs text-slate-500">
                    Today
                  </p>

                </div>

              </div>

            </div>

            {/* AI Trading */}

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
                      AI Trading
                    </h3>

                    <p className="text-sm text-slate-400">
                      Running
                    </p>

                  </div>

                </div>

                <div className="text-right">

                  <p className="font-bold text-cyan-400">
                    Active
                  </p>

                  <p className="text-xs text-slate-500">
                    Live
                  </p>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* Transaction Summary */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Transaction Summary
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Completed
              </span>

              <span className="font-bold text-green-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Pending
              </span>

              <span className="font-bold text-yellow-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Failed
              </span>

              <span className="font-bold text-red-400">
                0
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Blockchain Status
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                TON Network
              </span>

              <span className="font-bold text-green-400">
                Connected
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Wallet Status
              </span>

              <span className="font-bold text-cyan-400">
                Connected
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Last Synchronization
              </span>

              <span className="font-bold">
                Just Now
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Transaction Hash
              </span>

              <span className="font-bold text-cyan-400">
                Available
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="mt-10 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Transactions
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