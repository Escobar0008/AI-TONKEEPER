"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Wallet,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

import TransactionPinModal from "@/app/components/TransactionPinModal";

export default function WithdrawTonPage() {
  const availableBalance = 0;

  const [walletAddress, setWalletAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  async function handleWithdraw() {
    if (!walletAddress.trim()) {
      alert("Please enter a TON wallet address.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (Number(amount) > availableBalance) {
      alert("Insufficient balance.");
      return;
    }

    setShowPinModal(true);
  }

  async function completeWithdraw() {
    setShowPinModal(false);

    setLoading(true);

    try {
      // Ici sera connecté TonConnect plus tard

      setTimeout(() => {
        setLoading(false);

        alert("Withdrawal request submitted successfully.");
      }, 1500);

    } catch (error) {
      console.error(error);
      setLoading(false);
      alert("Withdrawal failed.");
    }
  }

  return (
    <main className="min-h-screen bg-[#050B18] text-white">

      <div className="max-w-md mx-auto px-5 py-6 pb-24">

        {/* Header */}

        <div className="flex items-center gap-4 mb-8">

          <Link
            href="/withdraw"
            className="w-12 h-12 rounded-full bg-[#101A2C] border border-slate-800 flex items-center justify-center"
          >
            <ArrowLeft size={22} />
          </Link>

          <div>

            <h1 className="text-3xl font-bold">
              Withdraw TON
            </h1>

            <p className="text-slate-400">
              Send Toncoin securely
            </p>

          </div>

        </div>

        {/* Balance */}

        <section className="bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <div className="flex items-center gap-3">

            <Wallet className="text-cyan-400" />

            <h2 className="text-2xl font-bold">
              Available Balance
            </h2>

          </div>

          <div className="mt-6 bg-[#17233B] rounded-2xl p-5">

            <h2 className="text-4xl font-bold text-cyan-400">
              {availableBalance.toFixed(4)} TON
            </h2>

            <p className="text-slate-400 mt-2">
              Ready to withdraw
            </p>

          </div>

        </section>

        {/* Form */}

        <section className="mt-8 bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <h2 className="text-2xl font-bold">
            Withdrawal Details
          </h2>

          <div className="mt-6">

            <label className="text-slate-400">
              TON Wallet Address
            </label>

            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="UQ..."
              className="mt-2 w-full rounded-2xl bg-[#17233B] border border-slate-700 p-4 outline-none focus:border-cyan-400"
            />

          </div>

          <div className="mt-6">

            <label className="text-slate-400">
              Amount (TON)
            </label>

            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="mt-2 w-full rounded-2xl bg-[#17233B] border border-slate-700 p-4 outline-none focus:border-cyan-400"
            />

          </div>

          <button
            onClick={handleWithdraw}
            disabled={loading}
            className="mt-8 w-full bg-cyan-500 hover:bg-cyan-400 transition rounded-2xl py-4 text-black font-bold flex items-center justify-center gap-3 disabled:opacity-50"
          >
            <Send size={22} />

            {loading ? "Processing..." : "Send TON"}

          </button>

        </section>
        {/* Summary */}

        <section className="mt-8 bg-[#101A2C] rounded-[30px] border border-slate-800 p-6">

          <h2 className="text-2xl font-bold">
            Withdrawal Summary
          </h2>

          <div className="space-y-4 mt-6">

            <div className="flex justify-between">
              <span className="text-slate-400">
                Network
              </span>

              <span>
                TON Blockchain
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">
                Amount
              </span>

              <span>
                {amount || "0"} TON
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">
                Network Fee
              </span>

              <span>
                0 TON
              </span>
            </div>

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

            <div className="bg-[#17233B] rounded-2xl p-4 flex gap-3">

              <CheckCircle2 className="text-green-400 mt-1" />

              <p>
                Verify the destination address carefully.
              </p>

            </div>

            <div className="bg-[#17233B] rounded-2xl p-4 flex gap-3">

              <CheckCircle2 className="text-green-400 mt-1" />

              <p>
                TON transactions cannot be reversed.
              </p>

            </div>

            <div className="bg-[#17233B] rounded-2xl p-4 flex gap-3">

              <AlertTriangle className="text-yellow-400 mt-1" />

              <p>
                Send only to a valid TON wallet.
              </p>

            </div>

          </div>

        </section>

      </div>

      <TransactionPinModal
        open={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={completeWithdraw}
      />

    </main>
  );
}