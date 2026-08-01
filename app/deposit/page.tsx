"use client";

import {useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Wallet,
  ShieldCheck,
  Copy,
  QrCode,
  RefreshCw,
  CheckCircle2,
  Clock3,
} from "lucide-react";

export default function DepositPage() {
const router = useRouter();

const [loading, setLoading] = useState(true);
  const [walletAddress] = useState(
    "UQBaMyUwFFPshx5cVOlYbnLzvXt6GgadnYAPjUeBwG67wxo_"
  );

  const [balance,setBalance] = useState(0);
useEffect(() => {
  async function checkSession() {
    try {
      const res = await fetch("/api/session", {
        credentials: "include",
      });

      if (!res.ok) {
        router.replace("/signin");
        return;
      }
const balanceRes = await fetch("/api/dashboard/balance", {
  credentials: "include",
});

if (balanceRes.ok) {
  const data = await balanceRes.json();
  setBalance(data.balance ?? 0);
}
      setLoading(false);
    } catch (error) {
      console.error(error);
      router.replace("/signin");
    }
  }

  checkSession();
}, [router]);
 if (loading) {
  return (
    <main className="min-h-screen bg-[#050B18] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

        <p className="mt-6 text-cyan-400 font-semibold">
          Loading AI TONKEEPER...
        </p>
      </div>
    </main>
  );
}
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
              Deposit
            </h1>

            <p className="text-slate-400">
              Receive TON securely
            </p>

          </div>

        </div>

        {/* ================= PLATFORM WALLET ================= */}

        <section className="bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">

                Platform Wallet

              </h2>

              <p className="text-green-400 mt-2 flex items-center gap-2">

                <ShieldCheck size={18} />

                Secure Wallet

              </p>

            </div>

            <Wallet
              size={46}
              className="text-cyan-400"
            />

          </div>

          <div className="mt-8 bg-[#17233B] rounded-3xl p-6">

            <p className="text-slate-400">

              Current Balance

            </p>

            <h2 className="text-4xl font-bold mt-3">

              {balance.toFixed(4)} TON

            </h2>

            <p className="text-slate-500 mt-2">

              Deposits received by AI TONKEEPER

            </p>

          </div>

        </section>
        {/* ================= DEPOSIT ADDRESS ================= */}

        <section className="mt-8 bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <h2 className="text-2xl font-bold">

            Deposit Address

          </h2>

          <p className="text-slate-400 mt-2">

            Send TON only to this platform wallet.

          </p>

          <div className="mt-6 bg-[#17233B] rounded-2xl p-5">

            <p className="text-cyan-400 break-all font-semibold">

              UQBaMyUwFFPshx5cVOlYbnLzvXt6GgadnYAPjUeBwG67wxo_

            </p>

          </div>

          <div className="grid grid-cols-2 gap-4 mt-6">

            <button
              onClick={() =>
                navigator.clipboard.writeText(
                  "UQBaMyUwFFPshx5cVOlYbnLzvXt6GgadnYAPjUeBwG67wxo_"
                )
              }
              className="bg-cyan-500 text-black font-bold rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-cyan-400 transition"
            >

              <Copy size={20} />

              Copy Address

            </button>

            <button
              className="bg-[#17233B] border border-slate-700 rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-[#20304C] transition"
            >

              <QrCode size={20} />

              QR Code

            </button>

          </div>

        </section>

        {/* ================= DEPOSIT STATUS ================= */}

        <section className="mt-8 bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <h2 className="text-2xl font-bold">

            Deposit Status

          </h2>

          <div className="space-y-4 mt-6">

            <div className="bg-[#17233B] rounded-2xl p-5 flex justify-between items-center">

              <div>

                <p className="font-bold">

                  Waiting for Deposit

                </p>

                <p className="text-slate-400 text-sm">

                  No incoming transaction detected.

                </p>

              </div>

              <Clock3
                className="text-yellow-400"
                size={28}
              />

            </div>

            <div className="bg-[#17233B] rounded-2xl p-5 flex justify-between items-center">

              <div>

                <p className="font-bold">

                  Confirmed Deposits

                </p>

                <p className="text-slate-400 text-sm">

                  0 confirmed transactions

                </p>

              </div>

              <CheckCircle2
                className="text-green-400"
                size={28}
              />

            </div>

          </div>

          <button
            className="mt-6 w-full bg-cyan-500 text-black font-bold rounded-2xl py-4 flex items-center justify-center gap-2 hover:bg-cyan-400 transition"
          >

            <RefreshCw size={20} />

            Refresh Deposit Status

          </button>

        </section>
        {/* ================= DEPOSIT HISTORY ================= */}

        <section className="mt-8 bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              Deposit History
            </h2>

            <span className="text-cyan-400 font-semibold">
              0 Deposits
            </span>

          </div>

          <div className="mt-6 space-y-4">

            <div className="bg-[#17233B] rounded-2xl p-5">

              <div className="flex justify-between">

                <span className="font-semibold">
                  TON Deposit
                </span>

                <span className="text-slate-500">
                  --
                </span>

              </div>

              <p className="text-slate-400 mt-2">

                No deposit has been received yet.

              </p>

            </div>

          </div>

        </section>

        {/* ================= SECURITY ================= */}

        <section className="mt-8 bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <h2 className="text-2xl font-bold">

            Security Notice

          </h2>

          <div className="space-y-4 mt-6">

            <div className="bg-[#17233B] rounded-2xl p-4">

              <p className="font-semibold text-cyan-400">

                ✔ Send only TON to this address.

              </p>

            </div>

            <div className="bg-[#17233B] rounded-2xl p-4">

              <p className="font-semibold text-cyan-400">

                ✔ Deposits are automatically checked by AI TONKEEPER.

              </p>

            </div>

            <div className="bg-[#17233B] rounded-2xl p-4">

              <p className="font-semibold text-cyan-400">

                ✔ Your account balance will be updated after blockchain confirmation.

              </p>

            </div>

            <div className="bg-[#17233B] rounded-2xl p-4">

              <p className="font-semibold text-cyan-400">

                ✔ Never send unsupported cryptocurrencies to this address.

              </p>

            </div>

          </div>

        </section>

      </div>

    </main>

  );

}