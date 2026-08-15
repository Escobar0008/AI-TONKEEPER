"use client";

import Link from "next/link";

import {
  ArrowLeft,
  Newspaper,
  Search,
  Flame,
  Bot,
  Globe,
  Star,
  RefreshCw,
} from "lucide-react";

export default function NewsPage() {
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
              Crypto News
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Latest cryptocurrency market news
            </p>

          </div>

          <div className="w-12 h-12 rounded-2xl border border-slate-800 bg-[#101A2C] flex items-center justify-center">

            <Newspaper
              size={22}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* News Card */}

        <div className="rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-700 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                Crypto Headlines
              </h2>

              <p className="mt-2 text-cyan-100">
                Stay informed with the latest crypto news and AI summaries.
              </p>

            </div>

            <Globe
              size={46}
              className="text-white"
            />

          </div>

          <div className="mt-6 rounded-2xl bg-white/10 p-4">

            <p className="text-sm text-cyan-100">
              Latest Articles
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
              placeholder="Search crypto news..."
              className="w-full bg-transparent outline-none placeholder:text-slate-500"
            />

          </div>

        </div>

        {/* Top Stories */}
        <div className="mt-8 space-y-4">

          {/* Breaking News */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start justify-between">

              <div className="flex gap-4">

                <Flame
                  size={26}
                  className="mt-1 text-orange-400"
                />

                <div>

                  <h3 className="text-lg font-bold">
                    Breaking News
                  </h3>

                  <p className="mt-2 text-sm text-slate-400">
                    Important cryptocurrency market updates will appear here.
                  </p>

                </div>

              </div>

              <Star
                size={22}
                className="text-yellow-400"
              />

            </div>

          </div>

          {/* AI Summary */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start gap-4">

              <Bot
                size={28}
                className="text-cyan-400"
              />

              <div>

                <h3 className="text-lg font-bold">
                  AI Summary
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  AI generates concise summaries of the most important crypto news.
                </p>

              </div>

            </div>

          </div>

          {/* Market Impact */}

          <div className="rounded-3xl border border-slate-800 bg-[#101A2C] p-5">

            <div className="flex items-start gap-4">

              <RefreshCw
                size={28}
                className="text-green-400"
              />

              <div>

                <h3 className="text-lg font-bold">
                  Market Impact
                </h3>

                <p className="mt-2 text-sm text-slate-400">
                  AI evaluates how current news may affect the crypto market.
                </p>

              </div>

            </div>

          </div>

        </div>

        {/* Categories */}
        <div className="mt-8">

          <h2 className="text-xl font-bold mb-4">
            News Categories
          </h2>

          <div className="grid grid-cols-2 gap-4">

            <button className="rounded-2xl bg-cyan-500 py-4 font-bold text-black">

              Toncoin

            </button>

            <button className="rounded-2xl border border-slate-800 bg-[#101A2C] py-4 font-bold">

              Bitcoin

            </button>

            <button className="rounded-2xl border border-slate-800 bg-[#101A2C] py-4 font-bold">

              Ethereum

            </button>

            <button className="rounded-2xl border border-slate-800 bg-[#101A2C] py-4 font-bold">

              Solana

            </button>

            <button className="rounded-2xl border border-slate-800 bg-[#101A2C] py-4 font-bold">

              BNB

            </button>

            <button className="rounded-2xl border border-slate-800 bg-[#101A2C] py-4 font-bold">

              DeFi

            </button>

          </div>

        </div>

        {/* Refresh */}

        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold">
                Refresh News
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Load the latest cryptocurrency news.
              </p>

            </div>

            <button className="rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-black flex items-center gap-2">

              <RefreshCw size={20} />

              Refresh

            </button>

          </div>

        </div>

        {/* News Summary */}
        <div className="mt-8 rounded-3xl border border-slate-800 bg-[#101A2C] p-6">

          <h2 className="text-xl font-bold">
            News Summary
          </h2>

          <div className="mt-6 space-y-4">

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Total Articles
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                Breaking News
              </span>

              <span className="font-bold">
                0
              </span>

            </div>

            <div className="flex items-center justify-between">

              <span className="text-slate-400">
                AI Summaries
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
            AI TONKEEPER Crypto News
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