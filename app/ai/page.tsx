"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  Wallet,
  DollarSign,
  Trophy,
  TrendingUp,
  TrendingDown,
  Activity,
  Play,
  Square,
  RefreshCw,
} from "lucide-react";

export default function AIPage() {
  const [status, setStatus] = useState("Idle");
  const [coin, setCoin] = useState("TON");
  const [capital, setCapital] = useState(1000);
  const [profit, setProfit] = useState(0);
  const [winRate, setWinRate] = useState(0);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);

  return (
    <main className="min-h-screen bg-[#050B18] text-white">

      <div className="max-w-md mx-auto p-5">

        {/* HEADER */}

        <div className="flex items-center gap-4 mb-8">

          <Link
            href="/dashboard"
            className="w-11 h-11 rounded-full bg-[#101A2C] flex items-center justify-center"
          >
            <ArrowLeft size={22} />
          </Link>

          <div>

            <h1 className="text-3xl font-bold">
              AI Trading
            </h1>

            <p className="text-slate-400">
              Smart Crypto Assistant
            </p>

          </div>

        </div>

        {/* AI STATUS */}

        <div className="bg-[#101A2C] rounded-3xl border border-slate-800 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">
                AI Status
              </h2>

              <p className="text-green-400 mt-2">
                ● Online
              </p>

            </div>

            <Bot
              size={50}
              className="text-cyan-400"
            />

          </div>

        </div>

        {/* STATISTICS */}

        <div className="grid grid-cols-2 gap-4 mt-6">

          <div className="bg-[#101A2C] rounded-2xl p-5">

            <div className="flex items-center gap-2">

              <Wallet
                className="text-cyan-400"
                size={20}
              />

              <span className="text-slate-400">
                Capital
              </span>

            </div>

            <h2 className="text-3xl font-bold mt-3">
              ${capital}
            </h2>

          </div>

          <div className="bg-[#101A2C] rounded-2xl p-5">

            <div className="flex items-center gap-2">

              <DollarSign
                className="text-green-400"
                size={20}
              />

              <span className="text-slate-400">
                Profit
              </span>

            </div>

            <h2 className="text-3xl font-bold mt-3 text-green-400">
              +${profit}
            </h2>

          </div>

          <div className="bg-[#101A2C] rounded-2xl p-5">

            <div className="flex items-center gap-2">

              <Trophy
                className="text-yellow-400"
                size={20}
              />

              <span className="text-slate-400">
                Win Rate
              </span>

            </div>

            <h2 className="text-3xl font-bold mt-3">
              {winRate}%
            </h2>

          </div>

          <div className="bg-[#101A2C] rounded-2xl p-5">

            <div className="flex items-center gap-2">

              <Activity
                className="text-cyan-400"
                size={20}
              />

              <span className="text-slate-400">
                Status
              </span>

            </div>

            <h2 className="text-2xl font-bold mt-3 text-cyan-400">
              {status}
            </h2>

          </div>

        </div>
        {/* ================= AI SETTINGS ================= */}

        <div className="mt-6 bg-[#101A2C] rounded-3xl border border-slate-800 p-6">

          <h2 className="text-2xl font-bold mb-5">
            AI Configuration
          </h2>

          {/* Coin */}

          <label className="text-slate-400">
            Cryptocurrency
          </label>

          <select
            value={coin}
            onChange={(e) => setCoin(e.target.value)}
            className="mt-2 w-full rounded-2xl bg-[#17233B] p-4 border border-slate-700 outline-none"
          >
            <option value="TON">TON</option>
            <option value="BTC">Bitcoin (BTC)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="USDT">USDT</option>
          </select>

          {/* Investment */}

          <label className="text-slate-400 mt-6 block">
            Investment Amount
          </label>

          <input
            type="number"
            defaultValue={capital}
            className="mt-2 w-full rounded-2xl bg-[#17233B] p-4 border border-slate-700 outline-none"
          />

          {/* Risk */}

          <label className="text-slate-400 mt-6 block">
            Risk Level
          </label>

          <select
            className="mt-2 w-full rounded-2xl bg-[#17233B] p-4 border border-slate-700 outline-none"
          >
            <option>Low</option>
            <option selected>Medium</option>
            <option>High</option>
          </select>

          {/* Strategy */}

          <label className="text-slate-400 mt-6 block">
            AI Strategy
          </label>

          <select
            className="mt-2 w-full rounded-2xl bg-[#17233B] p-4 border border-slate-700 outline-none"
          >
            <option>Scalping</option>
            <option>Swing Trading</option>
            <option>Trend Following</option>
            <option>DCA</option>
          </select>

          {/* Stop Loss */}

          <label className="text-slate-400 mt-6 block">
            Stop Loss (%)
          </label>

          <input
            type="number"
            defaultValue={5}
            className="mt-2 w-full rounded-2xl bg-[#17233B] p-4 border border-slate-700 outline-none"
          />

          {/* Take Profit */}

          <label className="text-slate-400 mt-6 block">
            Take Profit (%)
          </label>

          <input
            type="number"
            defaultValue={15}
            className="mt-2 w-full rounded-2xl bg-[#17233B] p-4 border border-slate-700 outline-none"
          />

        </div>

        {/* ================= AI ANALYSIS ================= */}

        <div className="mt-6 bg-[#101A2C] rounded-3xl border border-slate-800 p-6">

          <div className="flex items-center gap-3 mb-4">

            <Bot
              className="text-cyan-400"
              size={24}
            />

            <h2 className="text-2xl font-bold">
              AI Analysis
            </h2>

          </div>

          <div className="space-y-4">

            <div className="flex justify-between">

              <span className="text-slate-400">
                Market Trend
              </span>

              <span className="text-green-400 font-bold">
                Bullish
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-400">
                AI Signal
              </span>

              <span className="text-cyan-400 font-bold">
                HOLD
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-400">
                Confidence
              </span>

              <span className="text-yellow-400 font-bold">
                91%
              </span>

            </div>

            <div className="flex justify-between">

              <span className="text-slate-400">
                Selected Coin
              </span>

              <span className="text-white font-bold">
                {coin}
              </span>

            </div>

          </div>

        </div>
        {/* ================= ACTIONS ================= */}

        <div className="mt-6 grid grid-cols-2 gap-4">

          <button
            onClick={() => setStatus("Running")}
            className="bg-cyan-500 text-black font-bold rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-cyan-400 transition"
          >
            <Play size={20} />
            Start
          </button>

          <button
            onClick={() => setStatus("Stopped")}
            className="bg-red-500 font-bold rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-red-400 transition"
          >
            <Square size={20} />
            Stop
          </button>

        </div>

        <button
          className="mt-4 w-full bg-[#17233B] rounded-2xl py-4 border border-slate-700 flex items-center justify-center gap-2 hover:bg-[#1E2D4A] transition"
        >
          <RefreshCw size={20} />
          Refresh Analysis
        </button>

        {/* ================= PERFORMANCE ================= */}

        <div className="mt-6 bg-[#101A2C] rounded-3xl border border-slate-800 p-6">

          <div className="flex items-center gap-3 mb-5">

            <TrendingUp
              className="text-green-400"
              size={24}
            />

            <h2 className="text-2xl font-bold">
              Performance
            </h2>

          </div>

          <div className="h-44 rounded-2xl bg-[#17233B] border border-slate-700 flex items-center justify-center">

            <div className="text-center">

              <TrendingUp
                size={40}
                className="mx-auto text-cyan-400"
              />

              <p className="mt-3 text-slate-400">
                Performance chart
              </p>

              <p className="text-sm text-slate-500">
                (Live chart coming soon)
              </p>

            </div>

          </div>

        </div>

        {/* ================= HISTORY ================= */}

        <div className="mt-6 bg-[#101A2C] rounded-3xl border border-slate-800 p-6">

          <div className="flex items-center gap-3 mb-5">

            <Activity
              className="text-cyan-400"
              size={24}
            />

            <h2 className="text-2xl font-bold">
              Trading History
            </h2>

          </div>

          <div className="space-y-4">

            <div className="bg-[#17233B] rounded-2xl p-4 flex justify-between items-center">

              <div>

                <p className="font-bold">
                  BUY {coin}
                </p>

                <p className="text-sm text-slate-400">
                  Waiting for first trade...
                </p>

              </div>

              <span className="text-yellow-400 font-bold">
                Pending
              </span>

            </div>

          </div>

        </div>

      </div>

    </main>

  );
}