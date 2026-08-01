"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import TransactionPinModal from "@/app/components/TransactionPinModal";

export default function SendPage() {
  const [address, setAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");

  const [message, setMessage] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);

  function handleSend() {
    if (!address.trim()) {
      setMessage("Please enter a recipient address.");
      return;
    }

    if (!amount || Number(amount) <= 0) {
      setMessage("Please enter a valid amount.");
      return;
    }

    setShowPinModal(true);
  }

  async function completeSend() {
    setShowPinModal(false);

    setLoading(true);

    try {
      const userId = localStorage.getItem("userId");

      const response = await fetch("/api/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          address,
          amount,
          comment,
        }),
      });

      const data = await response.json();

      setLoading(false);

      setMessage(data.message);

      if (data.transactionId) {
        setTransactionId(data.transactionId);
      }

      if (data.status) {
        setStatus(data.status);
      }

      if (data.success) {
        setAddress("");
        setAmount("");
        setComment("");
      }

    } catch {
      setLoading(false);
      setMessage("Server error.");
    }
  }

  return (
    <div className="min-h-screen bg-[#050B18] text-white">

      <main className="max-w-md mx-auto p-5">

        <div className="flex items-center gap-4 mb-8">

          <Link
            href="/dashboard"
            className="w-11 h-11 rounded-full bg-[#101A2C] flex items-center justify-center"
          >
            <ArrowLeft size={22} />
          </Link>

          <h1 className="text-3xl font-bold">
            Send TON
          </h1>

        </div>

        <div className="bg-[#101A2C] border border-slate-800 rounded-[30px] p-6">

          <label className="text-slate-400">
            Recipient Address
          </label>

          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="UQ..."
            className="mt-2 w-full rounded-xl bg-[#17233B] p-4 outline-none"
          />

          <label className="text-slate-400 mt-6 block">
            Amount (TON)
          </label>

          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="mt-2 w-full rounded-xl bg-[#17233B] p-4 outline-none"
          />

          <label className="text-slate-400 mt-6 block">
            Comment (optional)
          </label>

          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Message..."
            className="mt-2 w-full rounded-xl bg-[#17233B] p-4 outline-none h-28"
          />

          <button
            onClick={handleSend}
            disabled={loading}
            className="mt-8 w-full rounded-2xl bg-cyan-500 py-4 text-black font-bold flex items-center justify-center gap-3 hover:bg-cyan-600 transition disabled:opacity-50"
          >
            <Send size={20} />

            {loading ? "Sending..." : "Send TON"}

          </button>
          {message && (
            <div className="mt-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">

              <p className="text-cyan-300 font-semibold">
                {message}
              </p>

              {transactionId && (
                <div className="mt-4">

                  <p className="text-slate-400 text-sm">
                    Transaction ID
                  </p>

                  <p className="text-white break-all font-mono">
                    {transactionId}
                  </p>

                </div>
              )}

              {status && (
                <div className="mt-4">

                  <p className="text-slate-400 text-sm">
                    Status
                  </p>

                  <span className="inline-block mt-2 rounded-full bg-yellow-500/20 px-3 py-1 text-yellow-400 font-semibold">
                    {status}
                  </span>

                </div>
              )}

            </div>
          )}

        </div>

      </main>

      <TransactionPinModal
        open={showPinModal}
        onClose={() => setShowPinModal(false)}
        onSuccess={completeSend}
      />

    </div>
  );
}