"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Trophy,
  Medal,
  Users,
  Timer,
  Search,
} from "lucide-react";

export default function TradingCompetitionsPage() {
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
              Trading Competitions
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Compete and win exclusive rewards
            </p>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">

            <Trophy
              size={22}
              className="text-yellow-400"
            />

          </div>

        </div>

        {/* Hero */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between gap-4">

            <div className="min-w-0 flex-1">

              <h2 className="text-2xl font-bold">
                Trading Competitions
              </h2>

              <p className="mt-2 text-sm text-cyan-100">
                Join AI trading competitions and climb the leaderboard.
              </p>

            </div>

            <Medal
              size={46}
              className="shrink-0 text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-5">

            <p className="text-sm text-cyan-100">
              Active Competitions
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
              placeholder="Search competitions..."
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* Competition List */}
        <div className="mt-8 space-y-4">

          {/* Active Competition */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start gap-4">

              <Trophy
                size={30}
                className="shrink-0 text-yellow-400"
              />

              <div className="min-w-0 flex-1">

                <h3 className="text-lg font-bold">
                  Active Competition
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  Join the current AI trading competition and compete with traders worldwide.
                </p>

              </div>

            </div>

          </div>

          {/* Participants */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start gap-4">

              <Users
                size={30}
                className="shrink-0 text-cyan-400"
              />

              <div className="min-w-0 flex-1">

                <h3 className="text-lg font-bold">
                  Participants
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  View the number of registered traders and follow the live leaderboard.
                </p>

              </div>

            </div>

          </div>

          {/* Time Remaining */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start justify-between gap-4">

              <div className="flex min-w-0 flex-1 items-start gap-4">

                <Timer
                  size={30}
                  className="shrink-0 text-orange-400"
                />

                <div className="min-w-0 flex-1">

                  <h3 className="text-lg font-bold">
                    Time Remaining
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Remaining time before the competition ends.
                  </p>

                </div>

              </div>

              <button className="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-600">

                Join

              </button>

            </div>

          </div>

        </div>

        {/* Competition Statistics */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Competition Statistics
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Participants
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Prize Pool
              </span>

              <span className="font-bold text-green-400">
                $0.00
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Your Rank
              </span>

              <span className="font-bold text-cyan-400">
                —
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Your Return
              </span>

              <span className="font-bold text-green-400">
                +0.00%
              </span>

            </div>

          </div>

        </div>

        {/* Competition Progress */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between gap-4">

            <div className="min-w-0 flex-1">

              <h2 className="text-xl font-bold">
                Competition Progress
              </h2>

              <p className="mt-2 text-sm text-cyan-100">
                Track your position and performance throughout the competition.
              </p>

            </div>

            <Medal
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

        {/* Competition History */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Competition History
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Competitions Joined
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Competitions Won
              </span>

              <span className="font-bold text-yellow-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Best Rank
              </span>

              <span className="font-bold text-cyan-400">
                —
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Rewards
              </span>

              <span className="font-bold text-green-400">
                $0.00
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Last Competition
              </span>

              <span className="font-bold">
                Never
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Trading Competitions
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