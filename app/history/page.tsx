"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  History,
  Search,
  Filter,
} from "lucide-react";

export default function HistoryPage() {

  const [search, setSearch] = useState("");

  return (

    <main className="min-h-screen bg-[#050B18] text-white">

      <div className="max-w-md mx-auto px-5 py-6 pb-32">

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

              History

            </h1>

            <p className="text-slate-400">

              All your crypto activities

            </p>

          </div>

        </div>

        {/* ================= SEARCH ================= */}

        <section className="bg-[#101A2C] border border-slate-800 rounded-[30px] p-6">

          <div className="flex items-center gap-3">

            <Search className="text-slate-400" size={22} />

            <input
              type="text"
              placeholder="Search transaction..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-white"
            />

            <button className="w-10 h-10 rounded-full bg-[#17233B] flex items-center justify-center">

              <Filter size={18} />

            </button>

          </div>

        </section>

        {/* ================= SUMMARY ================= */}

        <section className="mt-8 bg-[#101A2C] border border-slate-800 rounded-[30px] p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">

                Activity Summary

              </h2>

              <p className="text-slate-400 mt-2">

                All operations

              </p>

            </div>

            <History
              size={46}
              className="text-cyan-400"
            />

          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">

            <div className="bg-[#17233B] rounded-2xl p-5">

              <p className="text-slate-400">

                Total Transactions

              </p>

              <h2 className="text-3xl font-bold mt-2">

                0

              </h2>

            </div>

            <div className="bg-[#17233B] rounded-2xl p-5">

              <p className="text-slate-400">

                Successful

              </p>

              <h2 className="text-3xl font-bold mt-2 text-green-400">

                0

              </h2>

            </div>

          </div>

        </section>
        {/* ================= TRANSACTIONS ================= */}

        <section className="mt-8">

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-2xl font-bold">

              Recent Activity

            </h2>

            <span className="text-cyan-400">

              Live

            </span>

          </div>

          <div className="space-y-4">

            {/* Deposit */}

            <div className="bg-[#101A2C] border border-slate-800 rounded-2xl p-5">

              <div className="flex justify-between items-center">

                <div>

                  <h3 className="font-bold">

                    📥 Deposit

                  </h3>

                  <p className="text-slate-400 mt-1">

                    TON Deposit

                  </p>

                </div>

                <div className="text-right">

                  <p className="font-bold">

                    +0 TON

                  </p>

                  <span className="text-yellow-400 text-sm">

                    Pending

                  </span>

                </div>

              </div>

            </div>

            {/* Withdraw */}

            <div className="bg-[#101A2C] border border-slate-800 rounded-2xl p-5">

              <div className="flex justify-between items-center">

                <div>

                  <h3 className="font-bold">

                    📤 Withdrawal

                  </h3>

                  <p className="text-slate-400 mt-1">

                    TON Withdrawal

                  </p>

                </div>

                <div className="text-right">

                  <p className="font-bold">

                    -0 TON

                  </p>

                  <span className="text-slate-400 text-sm">

                    No Transaction

                  </span>

                </div>

              </div>

            </div>

            {/* Buy */}

            <div className="bg-[#101A2C] border border-slate-800 rounded-2xl p-5">

              <div className="flex justify-between items-center">

                <div>

                  <h3 className="font-bold">

                    💳 Buy Crypto

                  </h3>

                  <p className="text-slate-400 mt-1">

                    Onramper Purchase

                  </p>

                </div>

                <div className="text-right">

                  <p className="font-bold">

                    0 USD

                  </p>

                  <span className="text-slate-400 text-sm">

                    Waiting

                  </span>

                </div>

              </div>

            </div>

            {/* AI Trading */}

            <div className="bg-[#101A2C] border border-slate-800 rounded-2xl p-5">

              <div className="flex justify-between items-center">

                <div>

                  <h3 className="font-bold">

                    🤖 AI Trading

                  </h3>

                  <p className="text-slate-400 mt-1">

                    Automated Trading

                  </p>

                </div>

                <div className="text-right">

                  <p className="font-bold text-green-400">

                    Ready

                  </p>

                  <span className="text-slate-400 text-sm">

                    No Trades Yet

                  </span>

                </div>

              </div>

            </div>

          </div>

        </section>
        {/* ================= STATISTICS ================= */}

        <section className="mt-8 bg-[#101A2C] border border-slate-800 rounded-[30px] p-6">

          <h2 className="text-2xl font-bold">

            Statistics

          </h2>

          <div className="grid grid-cols-2 gap-4 mt-6">

            <div className="bg-[#17233B] rounded-2xl p-5">

              <p className="text-slate-400">

                Deposits

              </p>

              <h2 className="text-3xl font-bold mt-2">

                0 TON

              </h2>

            </div>

            <div className="bg-[#17233B] rounded-2xl p-5">

              <p className="text-slate-400">

                Withdrawals

              </p>

              <h2 className="text-3xl font-bold mt-2">

                0 TON

              </h2>

            </div>

            <div className="bg-[#17233B] rounded-2xl p-5">

              <p className="text-slate-400">

                Purchases

              </p>

              <h2 className="text-3xl font-bold mt-2">

                0

              </h2>

            </div>

            <div className="bg-[#17233B] rounded-2xl p-5">

              <p className="text-slate-400">

                AI Trades

              </p>

              <h2 className="text-3xl font-bold mt-2">

                0

              </h2>

            </div>

          </div>

        </section>

        {/* ================= HISTORY STATUS ================= */}

        <section className="mt-8 bg-[#101A2C] border border-slate-800 rounded-[30px] p-6">

          <h2 className="text-2xl font-bold">

            History Status

          </h2>

          <div className="mt-6 space-y-4">

            <div className="bg-[#17233B] rounded-2xl p-4 flex justify-between">

              <span className="text-slate-400">

                Confirmed

              </span>

              <span className="text-green-400 font-bold">

                0

              </span>

            </div>

            <div className="bg-[#17233B] rounded-2xl p-4 flex justify-between">

              <span className="text-slate-400">

                Pending

              </span>

              <span className="text-yellow-400 font-bold">

                0

              </span>

            </div>

            <div className="bg-[#17233B] rounded-2xl p-4 flex justify-between">

              <span className="text-slate-400">

                Failed

              </span>

              <span className="text-red-400 font-bold">

                0

              </span>

            </div>

          </div>

        </section>

      </div>

    </main>

  );

}