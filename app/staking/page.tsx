"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Landmark,
  Coins,
  TrendingUp,
  Search,
  Bot,
  Gift,
  Clock,
  Percent,
} from "lucide-react";

export default function StakingPage() {
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
              Staking
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Earn passive rewards with staking
            </p>

          </div>

          <div className="w-12 h-12 rounded-2xl border border-slate-800 bg-[#101A2C] flex items-center justify-center">

            <Landmark
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* Staking Card */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                Total Staked
              </h2>

              <p className="mt-2 text-cyan-100">
                Total value currently staked.
              </p>

            </div>

            <Coins
              size={46}
              className="text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4">

            <p className="text-sm text-cyan-100">
              Total Staked
            </p>

            <p className="mt-2 text-3xl font-bold">
              0 TON
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
              placeholder="Search staking assets..."
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* Staking Overview */}
        <div className="mt-8 space-y-4">

          {/* TON Staking */}

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
                    Toncoin Staking
                  </h3>

                  <p className="text-sm text-slate-400">
                    APY: 8.50%
                  </p>

                </div>

              </div>

              <p className="font-bold">
                0 TON
              </p>

            </div>

          </div>

          {/* Ethereum Staking */}

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
                    Ethereum Staking
                  </h3>

                  <p className="text-sm text-slate-400">
                    APY: 4.80%
                  </p>

                </div>

              </div>

              <p className="font-bold">
                0 ETH
              </p>

            </div>

          </div>

          {/* Solana Staking */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <img
                  src="/coins/sol.png"
                  alt="SOL"
                  className="w-12 h-12 rounded-full"
                />

                <div>

                  <h3 className="font-bold text-lg">
                    Solana Staking
                  </h3>

                  <p className="text-sm text-slate-400">
                    APY: 6.20%
                  </p>

                </div>

              </div>

              <p className="font-bold">
                0 SOL
              </p>

            </div>

          </div>

        </div>

        {/* Staking Statistics */}
      <div className="mt-8">

          <h2 className="text-xl font-bold mb-4">
            Staking Statistics
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

              <Percent
                size={28}
                className="text-green-400"
              />

              <p className="mt-4 text-sm text-slate-400">
                Average APY
              </p>

              <p className="mt-2 text-2xl font-bold">
                6.50%
              </p>

            </div>

            <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

              <Clock
                size={28}
                className="text-cyan-400"
              />

              <p className="mt-4 text-sm text-slate-400">
                Lock Period
              </p>

              <p className="mt-2 text-2xl font-bold">
                Flexible
              </p>

            </div>

          </div>

        </div>

        {/* AI Insights */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center gap-4">

            <Bot
              size={34}
              className="text-white"
            />

            <div>

              <h2 className="text-xl font-bold">
                AI Staking Insights
              </h2>

              <p className="mt-2 text-cyan-100">
                AI analyzes staking opportunities and helps optimize your rewards.
              </p>

            </div>

          </div>

        </div>

        {/* Quick Actions */}

        <div className="mt-8 grid grid-cols-2 gap-4">

          <button className="rounded-3xl bg-cyan-500 py-5 font-bold text-black">
            Stake
          </button>

          <button className="rounded-3xl border border-slate-800 bg-[#101A2C] py-5 font-bold">
            Unstake
          </button>

          <button className="rounded-3xl border border-slate-800 bg-[#101A2C] py-5 font-bold flex items-center justify-center gap-2">

            <Gift size={20} />

            Claim Rewards

          </button>

          <button className="rounded-3xl border border-slate-800 bg-[#101A2C] py-5 font-bold">

            View History

          </button>

        </div>

        {/* Footer */}
          <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Staking Summary
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Active Stakes
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Rewards
              </span>

              <span className="font-bold">
                0 TON
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Estimated APY
              </span>

              <span className="font-bold text-green-400">
                6.50%
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Next Reward
              </span>

              <span className="font-bold text-cyan-400">
                Pending
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="mt-10 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Staking Center
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