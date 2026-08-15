"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Award,
  Trophy,
  Search,
  Bot,
  Flame,
  Gift,
  Star,
} from "lucide-react";

export default function AchievementsPage() {
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
              Achievements
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Track your rewards and milestones
            </p>

          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-800 bg-[#101A2C]">

            <Award
              size={22}
              className="text-yellow-400"
            />

          </div>

        </div>

        {/* Hero Card */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between gap-4">

            <div className="min-w-0 flex-1">

              <h2 className="text-2xl font-bold">
                Your Achievements
              </h2>

              <p className="mt-2 text-sm text-cyan-100">
                Unlock badges, earn XP and claim exclusive rewards.
              </p>

            </div>

            <Trophy
              size={46}
              className="shrink-0 text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-5">

            <p className="text-sm text-cyan-100">
              Unlocked Badges
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
              placeholder="Search achievements..."
              className="w-full bg-transparent text-white outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* Achievement List */}
        <div className="mt-8 space-y-4">

          {/* First Trade */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between gap-4">

              <div className="flex min-w-0 flex-1 items-center gap-4">

                <Trophy
                  size={30}
                  className="shrink-0 text-yellow-400"
                />

                <div className="min-w-0 flex-1">

                  <h3 className="truncate text-lg font-bold">
                    First Trade
                  </h3>

                  <p className="text-sm text-slate-400">
                    Complete your first successful trade.
                  </p>

                </div>

              </div>

              <span className="shrink-0 whitespace-nowrap text-sm font-bold text-green-400">
                Completed
              </span>

            </div>

          </div>

          {/* AI Trader */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between gap-4">

              <div className="flex min-w-0 flex-1 items-center gap-4">

                <Bot
                  size={30}
                  className="shrink-0 text-cyan-400"
                />

                <div className="min-w-0 flex-1">

                  <h3 className="truncate text-lg font-bold">
                    AI Trader
                  </h3>

                  <p className="text-sm text-slate-400">
                    Activate AI Trading for the first time.
                  </p>

                </div>

              </div>

              <span className="shrink-0 whitespace-nowrap text-sm font-bold text-yellow-400">
                In Progress
              </span>

            </div>

          </div>

          {/* Login Streak */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-center justify-between gap-4">

              <div className="flex min-w-0 flex-1 items-center gap-4">

                <Flame
                  size={30}
                  className="shrink-0 text-orange-400"
                />

                <div className="min-w-0 flex-1">

                  <h3 className="truncate text-lg font-bold">
                    Login Streak
                  </h3>

                  <p className="text-sm text-slate-400">
                    Log in for 7 consecutive days.
                  </p>

                </div>

              </div>

              <span className="shrink-0 whitespace-nowrap text-lg font-bold text-slate-300">
                0 / 7
              </span>

            </div>

          </div>

        </div>

        {/* Rewards */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Rewards
          </h2>

          <div className="mt-6">

            <div className="flex items-center justify-between gap-4">

              <div className="flex min-w-0 flex-1 items-center gap-4">

                <Gift
                  size={30}
                  className="shrink-0 text-cyan-400"
                />

                <div className="min-w-0 flex-1">

                  <h3 className="truncate text-lg font-bold">
                    Claim Reward
                  </h3>

                  <p className="text-sm text-slate-400">
                    Available rewards
                  </p>

                </div>

              </div>

              <button className="shrink-0 rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-black transition hover:bg-cyan-400">

                Claim

              </button>

            </div>

          </div>

        </div>

        {/* XP Progress */}

        <div className="mt-8 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-start gap-4">

            <Star
              size={38}
              className="shrink-0 text-white"
            />

            <div className="min-w-0 flex-1">

              <h2 className="text-xl font-bold">
                Experience Points
              </h2>

              <p className="mt-2 text-sm text-cyan-100">
                Gain XP by completing missions, trading and using AI features.
              </p>

            </div>

          </div>

          <div className="mt-6">

            <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">

              <div className="h-full w-0 rounded-full bg-white"></div>

            </div>

            <div className="mt-3 flex items-center justify-between text-sm">

              <span className="font-medium">
                Level 1
              </span>

              <span>
                0 / 100 XP
              </span>

            </div>

          </div>

        </div>

        {/* Achievement Statistics */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Achievement Statistics
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Achievements
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Completed Missions
              </span>

              <span className="font-bold text-green-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Referral Rewards
              </span>

              <span className="font-bold text-cyan-400">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Current Level
              </span>

              <span className="font-bold text-yellow-400">
                Level 1
              </span>

            </div>

          </div>

        </div>

        {/* Footer */}

        <footer className="mt-10 border-t border-slate-800 pt-6 text-center">

          <p className="text-sm text-slate-500">
            AI TONKEEPER Achievements
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