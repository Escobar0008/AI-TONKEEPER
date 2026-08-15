"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Trophy,
  Medal,
  Crown,
  Search,
  Globe,
  Bot,
  TrendingUp,
} from "lucide-react";

export default function LeaderboardPage() {
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
              Leaderboard
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Top traders & AI performance
            </p>

          </div>

          <div className="w-12 h-12 rounded-2xl border border-slate-800 bg-[#101A2C] flex items-center justify-center">

            <Trophy
              size={22}
              className="text-yellow-400"
            />

          </div>

        </div>

        {/* Leaderboard Card */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                Global Rankings
              </h2>

              <p className="mt-2 text-cyan-100">
                Discover the highest-performing traders and AI bots.
              </p>

            </div>

            <Crown
              size={46}
              className="text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4">

            <p className="text-sm text-cyan-100">
              Ranked Traders
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
              placeholder="Search a trader..."
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* Rankings */}
        <div className="mt-8 space-y-4">

          {/* Rank 1 */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <Crown
                  size={30}
                  className="text-yellow-400"
                />

                <div>

                  <h3 className="text-lg font-bold">
                    Trader Alpha
                  </h3>

                  <p className="text-sm text-slate-400">
                    Global Rank #1
                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="font-bold text-green-400">
                  +245%
                </p>

                <p className="text-xs text-slate-500">
                  Success 96%
                </p>

              </div>

            </div>

          </div>

          {/* Rank 2 */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <Medal
                  size={30}
                  className="text-slate-300"
                />

                <div>

                  <h3 className="text-lg font-bold">
                    AI Quantum Bot
                  </h3>

                  <p className="text-sm text-slate-400">
                    Global Rank #2
                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="font-bold text-green-400">
                  +219%
                </p>

                <p className="text-xs text-slate-500">
                  Success 94%
                </p>

              </div>

            </div>

          </div>

          {/* Rank 3 */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <Trophy
                  size={30}
                  className="text-orange-400"
                />

                <div>

                  <h3 className="text-lg font-bold">
                    Trader Pro
                  </h3>

                  <p className="text-sm text-slate-400">
                    Global Rank #3
                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="font-bold text-green-400">
                  +198%
                </p>

                <p className="text-xs text-slate-500">
                  Success 91%
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Statistics */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Leaderboard Statistics
          </h2>

          <div className="mt-6 space-y-5">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Ranked Users
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Active AI Bots
              </span>

              <span className="font-bold text-cyan-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Best Performance
              </span>

              <span className="font-bold text-green-400">
                +0.00%
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Average Success Rate
              </span>

              <span className="font-bold">
                0%
              </span>

            </div>

          </div>

        </div>

        {/* Filters */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center gap-4">

            <Globe
              size={36}
              className="text-white"
            />

            <div>

              <h2 className="text-xl font-bold">
                Ranking Filters
              </h2>

              <p className="mt-2 text-cyan-100">
                Switch between Global, Friends and AI Bot rankings to compare different performance categories.
              </p>

            </div>

          </div>

        </div>

        {/* Personal Ranking */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Personal Ranking
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Your Position
              </span>

              <span className="font-bold text-cyan-400">
                #--
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

              <span className="font-bold">
                0%
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Earned Badges
              </span>

              <span className="font-bold text-yellow-400">
                0
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <div className="mt-10 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Leaderboard
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