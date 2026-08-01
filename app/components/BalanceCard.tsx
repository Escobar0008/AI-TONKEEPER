"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bot,
  CreditCard,
} from "lucide-react";

export default function BalanceCard() {
  const [balance, setBalance] = useState(0);
  const [usd, setUsd] = useState(0);

  useEffect(() => {
    async function loadBalance() {
      try {
        const res = await fetch("/api/dashboard/balance");

        if (!res.ok) return;

        const data = await res.json();

        setBalance(Number(data.balance));
        setUsd(Number(data.usd));
      } catch (error) {
        console.error(error);
      }
    }

    loadBalance();
  }, []);

  return (
    <div className="rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-700 p-6 md:p-8 shadow-2xl">

      <p className="text-cyan-100 text-sm">
        Total Portfolio Balance
      </p>

      <h2 className="mt-2 text-5xl font-bold text-white">
        {balance} TON
      </h2>

      <p className="mt-2 text-cyan-100">
        ≈ ${usd.toFixed(2)} USD
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">

        <Link
          href="/buy-ton"
          className="bg-white/20 hover:bg-white/30 transition rounded-2xl p-4 flex flex-col items-center"
        >
          <CreditCard className="mb-2" />
          <span className="font-semibold">Buy TON</span>
        </Link>

        <Link
          href="/deposit"
          className="bg-white/20 hover:bg-white/30 transition rounded-2xl p-4 flex flex-col items-center"
        >
          <ArrowDownLeft className="mb-2" />
          <span className="font-semibold">Deposit</span>
        </Link>

        <Link
          href="/withdraw"
          className="bg-white/20 hover:bg-white/30 transition rounded-2xl p-4 flex flex-col items-center"
        >
          <ArrowUpRight className="mb-2" />
          <span className="font-semibold">Withdraw</span>
        </Link>

        <Link
          href="/ai-trading"
          className="bg-white/20 hover:bg-white/30 transition rounded-2xl p-4 flex flex-col items-center"
        >
          <Bot className="mb-2" />
          <span className="font-semibold">AI Trading</span>
        </Link>

      </div>

    </div>
  );
}