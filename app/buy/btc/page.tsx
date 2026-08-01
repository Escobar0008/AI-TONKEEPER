"use client";

import { useState } from "react";
import Link from "next/link";
import QRCode from "react-qr-code";
import {
  ArrowLeft,
  Copy,
  ExternalLink,
  Bitcoin,
  CheckCircle2,
  CreditCard,
} from "lucide-react";

export default function BuyBTCPage() {
  const walletAddress =
    "bc1q2d8q6nn6lna8qj2k69n7xtmvm2fudr0fmlvt98";

  const buyUrl = "https://buy.onramper.com";

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
      <div className="max-w-md mx-auto px-5 py-6 pb-24">

        {/* HEADER */}

        <div className="flex items-center gap-4 mb-8">

          <Link
            href="/buy"
            className="w-12 h-12 rounded-full bg-[#101A2C] border border-slate-800 flex items-center justify-center"
          >
            <ArrowLeft size={22} />
          </Link>

          <div>
            <h1 className="text-3xl font-bold">
              Buy BTC
            </h1>

            <p className="text-slate-400">
              Buy Bitcoin with your bank card
            </p>
          </div>

        </div>

        {/* WALLET */}

        <section className="bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <div className="flex items-center gap-3">

            <Bitcoin
              className="text-orange-400"
              size={28}
            />

            <h2 className="text-2xl font-bold">
              BTC Receiving Wallet
            </h2>

          </div>

          <div className="flex justify-center mt-8">

            <div className="bg-white rounded-3xl p-5">

              <QRCode
                value={walletAddress}
                size={220}
              />

            </div>

          </div>

          <div className="mt-8">

            <p className="text-slate-400 mb-3">
              Wallet Address
            </p>

            <div className="bg-[#17233B] rounded-2xl p-4 break-all text-orange-400 font-semibold">

              {walletAddress}

            </div>

          </div>

          <button
            onClick={copyAddress}
            className="mt-6 w-full bg-orange-500 hover:bg-orange-400 transition rounded-2xl py-4 text-black font-bold flex items-center justify-center gap-3"
          >

            <Copy size={20} />

            {copied ? "Address Copied" : "Copy Wallet Address"}

          </button>

        </section>

        {/* BUY */}

        <section className="mt-8 bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <div className="flex items-center gap-3 mb-6">

            <CreditCard
              className="text-orange-400"
              size={28}
            />

            <h2 className="text-2xl font-bold">
              Buy Bitcoin
            </h2>

          </div>

          <p className="text-slate-400 leading-7">

            Purchase Bitcoin securely using Visa,
            Mastercard, Apple Pay, Google Pay or
            supported payment methods through
            Onramper.

          </p>

          <a
            href={buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 w-full bg-orange-500 hover:bg-orange-400 transition rounded-2xl py-4 text-black font-bold flex items-center justify-center gap-3"
          >

            <ExternalLink size={20} />

            Buy BTC Now

          </a>

        </section>

        {/* INFORMATION */}

        <section className="mt-8 bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <div className="flex items-center gap-3 mb-6">

            <CheckCircle2
              className="text-green-400"
              size={28}
            />

            <h2 className="text-2xl font-bold">
              Information
            </h2>

          </div>

          <div className="space-y-4">

            <div className="bg-[#17233B] rounded-2xl p-4">
              ✔ Secure payment powered by Onramper.
            </div>

            <div className="bg-[#17233B] rounded-2xl p-4">
              ✔ Buy Bitcoin using your preferred payment method.
            </div>

            <div className="bg-[#17233B] rounded-2xl p-4">
              ✔ Always verify the destination wallet before confirming your purchase.
            </div>

            <div className="bg-[#17233B] rounded-2xl p-4">
              ✔ Purchased BTC will be sent to the wallet address shown above.
            </div>

          </div>

        </section>

      </div>
    </main>
  );
}