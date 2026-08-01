"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  CreditCard,
  ShieldCheck,
  Bitcoin,
} from "lucide-react";

export default function BuyPage() {

  const [selectedCoin, setSelectedCoin] = useState("TON");

  const [amount, setAmount] = useState("");

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

              Buy Crypto

            </h1>

            <p className="text-slate-400">

              Powered by Onramper

            </p>

          </div>

        </div>

        {/* ================= BUY CARD ================= */}

        <section className="bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-2xl font-bold">

                Secure Purchase

              </h2>

              <p className="text-green-400 mt-2 flex items-center gap-2">

                <ShieldCheck size={18} />

                Official Onramper Partner

              </p>

            </div>

            <CreditCard
              size={46}
              className="text-cyan-400"
            />

          </div>

          <div className="mt-8 bg-[#17233B] rounded-3xl p-6">

            <p className="text-slate-400">

              Buy cryptocurrency securely using your bank card.

            </p>

            <p className="text-slate-500 mt-3 leading-7">

              Choose the cryptocurrency you want to buy.
              You will then be redirected to the official
              Onramper secure payment page.

            </p>

          </div>

        </section>
        {/* ================= SELECT CRYPTO ================= */}

        <section className="mt-8">

          <h2 className="text-2xl font-bold mb-5">

            Select Cryptocurrency

          </h2>

          <div className="grid grid-cols-2 gap-4">

            <button
              onClick={() => setSelectedCoin("TON")}
              className={`rounded-2xl p-5 font-bold transition ${
                selectedCoin === "TON"
                  ? "bg-cyan-500 text-black"
                  : "bg-[#101A2C] border border-slate-800"
              }`}
            >
              🟢 TON
            </button>

            <button
              onClick={() => setSelectedCoin("BTC")}
              className={`rounded-2xl p-5 font-bold transition ${
                selectedCoin === "BTC"
                  ? "bg-yellow-500 text-black"
                  : "bg-[#101A2C] border border-slate-800"
              }`}
            >
              🟠 Bitcoin
            </button>

            <button
              onClick={() => setSelectedCoin("ETH")}
              className={`rounded-2xl p-5 font-bold transition ${
                selectedCoin === "ETH"
                  ? "bg-blue-500 text-white"
                  : "bg-[#101A2C] border border-slate-800"
              }`}
            >
              🔵 Ethereum
            </button>

            <button
              onClick={() => setSelectedCoin("USDT")}
              className={`rounded-2xl p-5 font-bold transition ${
                selectedCoin === "USDT"
                  ? "bg-green-500 text-black"
                  : "bg-[#101A2C] border border-slate-800"
              }`}
            >
              🟢 USDT
            </button>

          </div>

        </section>

        {/* ================= BUY FORM ================= */}

        <section className="mt-8 bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <h2 className="text-2xl font-bold">

            Buy {selectedCoin}

          </h2>

          <div className="mt-6">

            <label className="text-slate-400">

              Amount (USD)

            </label>

            <input
              type="number"
              placeholder="100"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 w-full rounded-2xl bg-[#17233B] border border-slate-700 p-4 outline-none"
            />

          </div>

          <div className="mt-6">

            <label className="text-slate-400">

              Receiving Wallet

            </label>

            <div className="mt-2 rounded-2xl bg-[#17233B] p-4 break-all text-cyan-400">

              {selectedCoin === "TON"
                ? "UQBaMyUwFFPshx5cVOlYbnLzvXt6GgadnYAPjUeBwG67wxo_"
                : selectedCoin === "BTC"
                ? "bc1q2d8q6nn6lna8qj2k69n7xtmvm2fudr0fmlvt98"
                : "Wallet will be configured during blockchain integration"}

            </div>

          </div>

          <div className="mt-6 bg-[#17233B] rounded-2xl p-5">

            <div className="flex items-center gap-3">

              <Bitcoin className="text-yellow-400" />

              <p className="text-slate-300">

                Official Onramper Secure Checkout

              </p>

            </div>

            <p className="text-slate-400 mt-4 leading-7">

              Click the button below to continue your purchase
              on the official Onramper secure payment page.

            </p>

          </div>

          <a
            href="https://buy.onramper.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block mt-8 w-full rounded-2xl bg-cyan-500 py-4 text-center font-bold text-black hover:bg-cyan-400 transition"
          >

            Continue to Secure Payment

          </a>

        </section>
        {/* ================= PURCHASE VERIFICATION ================= */}

        <section className="mt-8 bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <h2 className="text-2xl font-bold">

            Purchase Verification

          </h2>

          <p className="text-slate-400 mt-2">

            After completing your payment on Onramper,
            return here and verify your purchase.

          </p>

          <div className="mt-6">

            <label className="text-slate-400">

              Order ID

            </label>

            <input
              type="text"
              placeholder="Example: ONR-XXXXXXXX"
              className="mt-2 w-full rounded-2xl bg-[#17233B] border border-slate-700 p-4 outline-none focus:border-cyan-400"
            />

          </div>

          <div className="mt-5">

            <label className="text-slate-400">

              Transaction Hash (Optional)

            </label>

            <input
              type="text"
              placeholder="Blockchain Transaction Hash"
              className="mt-2 w-full rounded-2xl bg-[#17233B] border border-slate-700 p-4 outline-none focus:border-cyan-400"
            />

          </div>

          <button
            className="mt-8 w-full rounded-2xl bg-cyan-500 py-4 text-black font-bold hover:bg-cyan-400 transition"
          >

            I've Completed My Purchase

          </button>

        </section>

        {/* ================= PURCHASE STATUS ================= */}

        <section className="mt-8 bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <h2 className="text-2xl font-bold">

            Purchase Status

          </h2>

          <div className="space-y-4 mt-6">

            <div className="bg-[#17233B] rounded-2xl p-5 flex justify-between">

              <span className="text-slate-400">

                Verification

              </span>

              <span className="text-yellow-400 font-bold">

                Waiting

              </span>

            </div>

            <div className="bg-[#17233B] rounded-2xl p-5 flex justify-between">

              <span className="text-slate-400">

                Payment

              </span>

              <span className="text-slate-300">

                Not verified

              </span>

            </div>

            <div className="bg-[#17233B] rounded-2xl p-5 flex justify-between">

              <span className="text-slate-400">

                Crypto Delivery

              </span>

              <span className="text-slate-300">

                Pending

              </span>

            </div>

          </div>

        </section>

        {/* ================= BUY HISTORY ================= */}

        <section className="mt-8 bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <div className="flex items-center justify-between">

            <h2 className="text-2xl font-bold">

              Purchase History

            </h2>

            <span className="text-cyan-400">

              0 Orders

            </span>

          </div>

          <div className="mt-6 bg-[#17233B] rounded-2xl p-5">

            <p className="font-semibold">

              No purchases yet.

            </p>

            <p className="text-slate-400 mt-2">

              Your completed purchases will appear here.

            </p>

          </div>

        </section>

      </div>

    </main>

  );

}