"use client";

import Link from "next/link";
import { ArrowLeft, Coins, Bitcoin } from "lucide-react";

export default function WithdrawPage() {
  return (
    <main className="min-h-screen bg-[#050B18] text-white">

      <div className="max-w-md mx-auto px-5 py-6">

        {/* ================= HEADER ================= */}

        <div className="flex items-center gap-4 mb-8">

          <Link
            href="/dashboard"
            className="w-12 h-12 rounded-full bg-[#101A2C] border border-slate-800 flex items-center justify-center"
          >
            <ArrowLeft size={22} />
          </Link>

          <div>
            <h1 className="text-3xl font-bold">
              Withdraw
            </h1>

            <p className="text-slate-400">
              Choose the cryptocurrency to withdraw
            </p>
          </div>

        </div>

        {/* ================= TITLE ================= */}

        <section className="bg-[#101A2C] border border-slate-800 rounded-[30px] p-6">

          <h2 className="text-2xl font-bold">
            Select Asset
          </h2>

          <p className="text-slate-400 mt-2">
            Select the cryptocurrency you want to withdraw.
          </p>

          {/* TON */}

          <Link
            href="/withdraw/ton"
            className="mt-8 flex items-center justify-between bg-[#17233B] rounded-3xl p-6 border border-slate-700 hover:border-cyan-400 transition"
          >
            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center">
                <Coins
                  size={30}
                  className="text-cyan-400"
                />
              </div>

              <div>

                <h3 className="text-xl font-bold">
                  Withdraw TON
                </h3>

                <p className="text-slate-400">
                  Send TON securely
                </p>

              </div>

            </div>

            <span className="text-cyan-400 text-2xl">
              →
            </span>

          </Link>

          {/* BTC */}

          <Link
            href="/withdraw/btc"
            className="mt-6 flex items-center justify-between bg-[#17233B] rounded-3xl p-6 border border-slate-700 hover:border-yellow-400 transition"
          >
            <div className="flex items-center gap-4">

              <div className="w-14 h-14 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Bitcoin
                  size={30}
                  className="text-yellow-400"
                />
              </div>

              <div>

                <h3 className="text-xl font-bold">
                  Withdraw BTC
                </h3>

                <p className="text-slate-400">
                  Send Bitcoin securely
                </p>

              </div>

            </div>

            <span className="text-yellow-400 text-2xl">
              →
            </span>

          </Link>

        </section>

      </div>

    </main>
  );
}