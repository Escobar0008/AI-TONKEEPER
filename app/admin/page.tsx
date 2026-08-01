"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Wallet,
  ArrowDownCircle,
  ArrowUpCircle,
  Send,
  Bot,
} from "lucide-react";

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#050B18] text-white p-6">

      <div className="max-w-6xl mx-auto">

        <div className="flex items-center gap-4 mb-8">

          <Link
            href="/dashboard"
            className="w-11 h-11 rounded-full bg-[#101A2C] flex items-center justify-center"
          >
            <ArrowLeft size={22} />
          </Link>

          <h1 className="text-4xl font-bold">
            AI TONKEEPER Admin
          </h1>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-[#101A2C] rounded-3xl p-6">
            <Users size={40} className="text-cyan-400 mb-4" />
            <h2 className="text-xl font-bold">Users</h2>
            <p className="text-3xl font-bold mt-2">0</p>
          </div>

          <div className="bg-[#101A2C] rounded-3xl p-6">
            <Wallet size={40} className="text-green-400 mb-4" />
            <h2 className="text-xl font-bold">Total Balance</h2>
            <p className="text-3xl font-bold mt-2">0 TON</p>
          </div>

          <div className="bg-[#101A2C] rounded-3xl p-6">
            <Bot size={40} className="text-blue-400 mb-4" />
            <h2 className="text-xl font-bold">AI Status</h2>
            <p className="text-3xl font-bold mt-2 text-green-400">
              Online
            </p>
          </div>

        </div>

        {/* ================= ADMIN REQUESTS ================= */}

        <section className="mt-10">

          <h2 className="text-3xl font-bold mb-6">
            Pending Requests
          </h2>

          <div className="space-y-5">

            {/* Deposit */}

            <div className="bg-[#101A2C] rounded-3xl p-6 border border-slate-800">

              <div className="flex justify-between items-center">

                <div className="flex items-center gap-4">

                  <ArrowDownCircle size={36} className="text-green-400" />

                  <div>

                    <h3 className="font-bold text-xl">
                      Deposit Request
                    </h3>

                    <p className="text-slate-400">
                      No pending deposits
                    </p>

                    <div className="flex gap-3 mt-5">

                      <button className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-xl font-bold">
                        Approve
                      </button>

                      <button className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl font-bold">
                        Reject
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* Withdraw */}

            <div className="bg-[#101A2C] rounded-3xl p-6 border border-slate-800">

              <div className="flex justify-between items-center">

                <div className="flex items-center gap-4">

                  <ArrowUpCircle size={36} className="text-red-400" />

                  <div>

                    <h3 className="font-bold text-xl">
                      Withdrawal Request
                    </h3>

                    <p className="text-slate-400">
                      No pending withdrawals
                    </p>

                    <div className="flex gap-3 mt-5">

                      <button className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-xl font-bold">
                        Approve
                      </button>

                      <button className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl font-bold">
                        Reject
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            </div>

            {/* Send */}

            <div className="bg-[#101A2C] rounded-3xl p-6 border border-slate-800">

              <div className="flex justify-between items-center">

                <div className="flex items-center gap-4">

                  <Send size={36} className="text-cyan-400" />

                  <div>

                    <h3 className="font-bold text-xl">
                      Send Request
                    </h3>

                    <p className="text-slate-400">
                      No pending transfers
                    </p>

                    <div className="flex gap-3 mt-5">

                      <button className="bg-green-500 hover:bg-green-600 px-5 py-2 rounded-xl font-bold">
                        Approve
                      </button>

                      <button className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-xl font-bold">
                        Reject
                      </button>

                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}