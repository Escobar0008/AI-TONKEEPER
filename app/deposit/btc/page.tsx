"use client";

import { useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Bitcoin,
} from "lucide-react";

export default function DepositBTCPage() {
  const [copied, setCopied] = useState(false);

  const wallet =
    "bc1q2d8q6nn6lna8qj2k69n7xtmvm2fudr0fmlvt98";

  const copyAddress = async () => {
    await navigator.clipboard.writeText(wallet);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-[#050B18] text-white">
      <div className="max-w-md mx-auto px-5 py-6 pb-24">

        {/* HEADER */}

        <div className="flex items-center gap-4 mb-8">

          <Link
            href="/deposit"
            className="w-12 h-12 rounded-full bg-[#101A2C] border border-slate-800 flex items-center justify-center"
          >
            <ArrowLeft size={22} />
          </Link>

          <div>
            <h1 className="text-3xl font-bold">
              Deposit BTC
            </h1>

            <p className="text-slate-400">
              Receive Bitcoin securely
            </p>
          </div>

        </div>

        {/* CARD */}

        <section className="bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <div className="flex items-center justify-center">

            <div className="bg-orange-500 rounded-full p-5">

              <Bitcoin
                size={42}
                className="text-white"
              />

            </div>

          </div>

          <h2 className="text-center text-3xl font-bold mt-6">
            Bitcoin Wallet
          </h2>

          <p className="text-center text-slate-400 mt-2">
            Send BTC only to this address
          </p>

          {/* QR */}

          <div className="bg-white rounded-3xl p-6 mt-8 flex justify-center">

            <QRCode
              value={wallet}
              size={210}
            />

          </div>

          {/* ADDRESS */}

          <div className="bg-[#17233B] rounded-2xl p-5 mt-8">

            <p className="text-slate-400 text-center">
              Deposit Address
            </p>

            <p className="break-all text-center text-orange-400 font-semibold mt-4">
              {wallet}
            </p>

          </div>

          {/* BUTTON */}

          <button
            onClick={copyAddress}
            className="mt-6 w-full bg-orange-500 hover:bg-orange-400 transition rounded-2xl py-4 font-bold text-black flex items-center justify-center gap-3"
          >
            <Copy size={20} />

            {copied ? "Copied!" : "Copy BTC Address"}

          </button>

        </section>

        {/* STATUS */}

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
                  No BTC transaction detected.
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

          <button className="mt-6 w-full bg-orange-500 hover:bg-orange-400 transition rounded-2xl py-4 font-bold text-black flex items-center justify-center gap-3">

            <RefreshCw size={20} />

            Refresh Deposit Status

          </button>

        </section>

        {/* SECURITY */}

        <section className="mt-8 bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <h2 className="text-2xl font-bold">
            Security Notice
          </h2>

          <div className="space-y-4 mt-6">

            <div className="bg-[#17233B] rounded-2xl p-4">
              ✔ Send only Bitcoin (BTC) to this address.
            </div>

            <div className="bg-[#17233B] rounded-2xl p-4">
              ✔ Deposits are automatically monitored.
            </div>

            <div className="bg-[#17233B] rounded-2xl p-4">
              ✔ Your balance updates after blockchain confirmations.
            </div>

            <div className="bg-[#17233B] rounded-2xl p-4">
              ✔ Sending another cryptocurrency may result in permanent loss.
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}