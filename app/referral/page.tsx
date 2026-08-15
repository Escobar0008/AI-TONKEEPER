"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Gift,
  Copy,
  Share2,
  Users,
  Coins,
  Trophy,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

export default function ReferralPage() {
  return (
    <main className="min-h-screen bg-[#050B18] text-white">

      <div className="max-w-md mx-auto px-5 py-6 pb-28">

        {/* Header */}

        <div className="flex items-center justify-between mb-8">

          <Link href="/dashboard">

            <button className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center">

              <ArrowLeft size={22} />

            </button>

          </Link>

          <div className="text-center">

            <h1 className="text-2xl font-bold">
              Referral Program
            </h1>

            <p className="text-sm text-slate-400 mt-1">
              Invite friends and earn rewards
            </p>

          </div>

          <div className="w-12 h-12 rounded-2xl bg-[#101A2C] border border-slate-800 flex items-center justify-center">

            <Gift
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* Referral Card */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                Invite & Earn
              </h2>

              <p className="mt-2 text-cyan-100">
                Share AI TONKEEPER and receive referral rewards.
              </p>

            </div>

            <Gift
              size={44}
              className="text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4">

            <p className="text-sm text-cyan-100">
              Your Referral Code
            </p>

            <p className="mt-2 text-2xl font-bold tracking-widest">
              AITON-2026
            </p>

          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">

            <button className="flex items-center justify-center gap-2 rounded-2xl bg-white text-black py-3 font-bold">

              <Copy size={20} />

              Copy Code

            </button>

            <button className="flex items-center justify-center gap-2 rounded-2xl border border-white py-3 font-bold">

              <Share2 size={20} />

              Share

            </button>

          </div>

          <div className="mt-5 rounded-2xl bg-white/10 p-4">

            <p className="text-sm text-cyan-100">
              Your Referral Link
            </p>

            <p className="mt-2 break-all text-sm">
              https://ai-tonkeeper.xyz/register?ref=AITON-2026
            </p>

          </div>

        </div>

        {/* Statistics */}

        <div className="mt-8 grid grid-cols-2 gap-4">

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <Users
              size={28}
              className="text-cyan-400"
            />

            <p className="mt-4 text-slate-400 text-sm">
              Referrals
            </p>

            <h3 className="mt-1 text-2xl font-bold">
              0
            </h3>

          </div>

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <Coins
              size={28}
              className="text-yellow-400"
            />

            <p className="mt-4 text-slate-400 text-sm">
              Rewards
            </p>

            <h3 className="mt-1 text-2xl font-bold">
              0 TON
            </h3>

          </div>

        </div>

        {/* Performance */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Referral Performance
          </h2>

          <div className="mt-6 space-y-5">

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">

                  <TrendingUp
                    size={24}
                    className="text-green-400"
                  />

                </div>

                <div>

                  <p className="font-semibold">
                    Total Earnings
                  </p>

                  <p className="text-sm text-slate-400">
                    Earned from referrals
                  </p>

                </div>

              </div>

              <span className="font-bold text-green-400">
                0 TON
              </span>

            </div>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center">

                  <Trophy
                    size={24}
                    className="text-purple-400"
                  />

                </div>

                <div>

                  <p className="font-semibold">
                    Referral Rank
                  </p>

                  <p className="text-sm text-slate-400">
                    Current level
                  </p>

                </div>

              </div>

              <span className="font-bold text-purple-400">
                Beginner
              </span>

            </div>

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-4">

                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 flex items-center justify-center">

                  <Users
                    size={24}
                    className="text-cyan-400"
                  />

                </div>

                <div>

                  <p className="font-semibold">
                    Active Referrals
                  </p>

                  <p className="text-sm text-slate-400">
                    Currently active users
                  </p>

                </div>

              </div>

              <span className="font-bold">
                0
              </span>

            </div>

          </div>

        </div>

        {/* Referral History */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Referral History
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-[#050B18] p-4">

              <div>

                <p className="font-semibold">
                  No referrals yet
                </p>

                <p className="text-sm text-slate-400">
                  Invite your first friend to start earning rewards.
                </p>

              </div>

              <ChevronRight
                size={20}
                className="text-slate-500"
              />

            </div>

          </div>

        </div>

        {/* Reward Rules */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            Reward Rules
          </h2>

          <div className="mt-5 space-y-3 text-sm text-slate-300">

            <p>• Earn referral rewards when invited users become active.</p>

            <p>• Rewards are credited automatically.</p>

            <p>• There is no limit to the number of referrals.</p>

            <p>• Fraudulent referrals may be removed.</p>

          </div>

        </div>

      </div>

    </main>

  );
}