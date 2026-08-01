"use client";

import { useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  ShieldCheck,
  Wallet,
} from "lucide-react";

export default function DepositTonPage() {
  const walletAddress =
    "UQBaMyUwFFPshx5cVOlYbnLzvXt6GgadnYAPjUeBwG67wxo_";

  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(walletAddress);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-[#050B18] text-white">

      <div className="max-w-md mx-auto px-5 py-6 pb-20">

        {/* Header */}

        <div className="flex items-center gap-4 mb-8">

          <Link
            href="/deposit"
            className="w-12 h-12 rounded-full bg-[#101A2C] border border-slate-800 flex items-center justify-center"
          >
            <ArrowLeft size={22} />
          </Link>

          <div>

            <h1 className="text-3xl font-bold">
              Deposit TON
            </h1>

            <p className="text-slate-400">
              Receive Toncoin securely
            </p>

          </div>

        </div>

        {/* Card */}

        <section className="bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <div className="flex items-center gap-3">

            <Wallet className="text-cyan-400" />

            <h2 className="text-2xl font-bold">
              TON Wallet
            </h2>

          </div>

          <div className="flex justify-center mt-8">

            <div className="bg-white p-4 rounded-2xl">

              <QRCode
                value={walletAddress}
                size={220}
              />

            </div>

          </div>

          <div className="mt-8">

            <p className="text-slate-400 mb-3">

              Deposit Address

            </p>

            <div className="bg-[#17233B] rounded-2xl p-4 break-all text-cyan-400">

              {walletAddress}

            </div>

          </div>

          <button
            onClick={copyAddress}
            className="mt-6 w-full rounded-2xl bg-cyan-500 py-4 text-black font-bold flex items-center justify-center gap-3 hover:bg-cyan-400 transition"
          >

            <Copy size={20} />

            {copied ? "Address Copied" : "Copy Address"}

          </button>

        </section>

        {/* Status */}

        <section className="mt-8 bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <div className="flex items-center gap-3 mb-6">

            <CheckCircle2 className="text-green-400" />

            <h2 className="text-2xl font-bold">

              Deposit Status

            </h2>

          </div>

          <div className="bg-[#17233B] rounded-2xl p-5">

            <p className="text-green-400 font-semibold">

              Waiting for Deposit

            </p>

            <p className="text-slate-400 mt-2">

              Your balance will update automatically after blockchain confirmation.

            </p>

          </div>

        </section>

        {/* Security */}

        <section className="mt-8 bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <div className="flex items-center gap-3 mb-5">

            <ShieldCheck className="text-cyan-400" />

            <h2 className="text-2xl font-bold">

              Security

            </h2>

          </div>

          <div className="space-y-4">

            <div className="bg-[#17233B] rounded-2xl p-4">
              ✔ Send only TON to this address.
            </div>

            <div className="bg-[#17233B] rounded-2xl p-4">
              ✔ Deposits are monitored automatically.
            </div>

            <div className="bg-[#17233B] rounded-2xl p-4">
              ✔ Wait for blockchain confirmation.
            </div>

            <div className="bg-[#17233B] rounded-2xl p-4">
              ✔ Never send BTC, ETH or USDT here.
            </div>

          </div>

        </section>

      </div>

    </main>
  );
}