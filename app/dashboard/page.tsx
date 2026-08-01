"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ScanLine,
  Wallet,
  History,
  Settings,
  ChevronDown,
  Send,
  ArrowDown,
  RefreshCw,
  CreditCard,
  Bot,
  Bitcoin,
} from "lucide-react";

export default function Dashboard() {
 const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [usdValue, setUsdValue] = useState(0);
  const [loading, setLoading] = useState(true);
const [walletAddress, setWalletAddress] = useState("");
const [userName, setUserName] = useState("");
  useEffect(() => {
  async function loadDashboard() {
    try {
      // Vérifie la session
      const sessionRes = await fetch("/api/session", {
        credentials: "include",
      });

      if (!sessionRes.ok) {
        router.replace("/signin");
        return;
      }

      const session = await sessionRes.json();

      setUserName(session.user?.name ?? "");
      setWalletAddress(session.user?.wallet ?? "");

      // Charge le solde
      const balanceRes = await fetch("/api/dashboard/balance", {
        credentials: "include",
      });

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();

        setBalance(balanceData.balance ?? 0);
        setUsdValue(balanceData.usd ?? 0);
      }
    } catch (error) {
      console.error("Dashboard error:", error);
      router.replace("/signin");
    } finally {
      setLoading(false);
    }
  }

  loadDashboard();
}, [router]);
if (loading) {
  return (
    <div className="min-h-screen bg-[#050B18] flex items-center justify-center text-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

        <p className="mt-6 text-cyan-400 font-semibold">
          Loading AI TONKEEPER...
        </p>
      </div>
    </div>
  );
}
  return (
    <div className="min-h-screen bg-[#050B18] text-white">

      <main className="max-w-md mx-auto min-h-screen px-5 py-6 pb-32">

        {/* ================= HEADER ================= */}

        <header className="flex items-center justify-between mb-8">

          <button className="w-12 h-12 rounded-full bg-[#101A2C] border border-slate-800 flex items-center justify-center">

            <ScanLine size={20} />

          </button>

          <div className="flex items-center gap-3 px-6 h-12 rounded-full bg-[#101A2C] border border-slate-800">

            <Wallet size={20} />

            <span className="font-semibold">

              Platform Wallet

            </span>

            <ChevronDown size={18} />

          </div>

          <div className="flex gap-3">

            <button className="w-12 h-12 rounded-full bg-[#101A2C] border border-slate-800">

              <History className="mx-auto" size={20} />

            </button>

            <button className="w-12 h-12 rounded-full bg-[#101A2C] border border-slate-800">

              <Settings className="mx-auto" size={20} />

            </button>

          </div>

        </header>

        {/* ================= LOGO ================= */}

        <div className="flex flex-col items-center mb-10">

          <img
            src="/logo.png"
            alt="AI TONKEEPER"
            className="w-28 h-28 object-contain"
          />

          <h1 className="text-3xl font-bold mt-5">

            AI TONKEEPER

          </h1>

          <p className="text-cyan-400 mt-2 tracking-wider">

            Secure Crypto Platform

          </p>

        </div>

        {/* ================= BALANCE ================= */}

        <section className="bg-[#101A2C] rounded-[30px] border border-slate-800 p-8">

          <p className="text-center text-slate-400">

            Total Balance

          </p>

          <h2 className="text-center text-5xl font-bold mt-3">

            {balance.toFixed(4)} TON

          </h2>

          <p className="text-center text-slate-400 mt-2">

            ≈ ${usdValue.toFixed(2)} USD

          </p>

          <div className="mt-8 bg-[#17233B] rounded-3xl p-5">

            <p className="text-center text-slate-400">

              Platform Wallet Address

            </p>

            <p className="text-center text-cyan-400 font-semibold text-sm break-all mt-4">

              UQBaMyUwFFPshx5cVOlYbnLzvXt6GgadnYAPjUeBwG67wxo_

            </p>

            <div className="flex justify-center mt-5">

              <span className="bg-green-500 text-black px-5 py-2 rounded-full font-bold">

                ACTIVE

              </span>

            </div>

            <p className="text-center text-slate-500 text-sm mt-5">

              All deposits and withdrawals are processed securely through the AI TONKEEPER platform wallet.

            </p>

          </div>

        </section>
        {/* ================= QUICK ACTIONS ================= */}

<section className="mt-8">

  <div className="grid grid-cols-3 gap-5">

    {/* Deposit */}

    <Link
      href="/deposit"
      className="flex flex-col items-center"
    >
      <div className="w-20 h-20 rounded-full bg-[#101A2C] border border-slate-800 flex items-center justify-center hover:bg-[#17233B] transition">
        <ArrowDown size={28} />
      </div>

      <span className="text-sm mt-3 text-slate-300 font-semibold">
        Deposit
      </span>
    </Link>

    {/* Withdraw */}

    <Link
      href="/withdraw"
      className="flex flex-col items-center"
    >
      <div className="w-20 h-20 rounded-full bg-[#101A2C] border border-slate-800 flex items-center justify-center hover:bg-[#17233B] transition">
        <Send size={28} />
      </div>

      <span className="text-sm mt-3 text-slate-300 font-semibold">
        Withdraw
      </span>
    </Link>

    {/* Buy */}

    <Link
      href="/buy"
      className="flex flex-col items-center"
    >
      <div className="w-20 h-20 rounded-full bg-[#101A2C] border border-slate-800 flex items-center justify-center hover:bg-[#17233B] transition">
        <CreditCard size={28} />
      </div>

      <span className="text-sm mt-3 text-slate-300 font-semibold">
        Buy
      </span>
    </Link>

    {/* Swap */}

    <Link
      href="/swap"
      className="flex flex-col items-center"
    >
      <div className="w-20 h-20 rounded-full bg-[#101A2C] border border-slate-800 flex items-center justify-center hover:bg-[#17233B] transition">
        <RefreshCw size={28} />
      </div>

      <span className="text-sm mt-3 text-slate-300 font-semibold">
        Swap
      </span>
    </Link>

    {/* AI */}

    <Link
      href="/ai"
      className="flex flex-col items-center"
    >
      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
        <Bot size={28} />
      </div>

      <span className="text-sm mt-3 text-cyan-400 font-semibold">
        AI
      </span>
    </Link>

    {/* BTC */}

    <Link
      href="/buy/btc"
      className="flex flex-col items-center"
    >
      <div className="w-20 h-20 rounded-full bg-[#101A2C] border border-yellow-500 flex items-center justify-center hover:bg-[#17233B] transition">
        <Bitcoin size={28} className="text-yellow-400" />
      </div>

      <span className="text-sm mt-3 text-yellow-400 font-semibold">
        BTC
      </span>
    </Link>

  </div>

</section>

        {/* ================= MARKET ================= */}

        <section className="mt-10">

          <h2 className="text-2xl font-bold mb-5">

            Crypto Market

          </h2>

          <div className="space-y-4">

            {/* TON */}

            <div className="bg-[#101A2C] border border-slate-800 rounded-2xl p-5 flex justify-between items-center">

              <div>

                <h3 className="font-bold text-lg">

                  TON

                </h3>

                <p className="text-slate-400">

                  Toncoin

                </p>

              </div>

              <div className="text-right">

                <p className="font-bold text-xl">

                  ${usdValue.toFixed(2)}

                </p>

                <p className="text-green-400">

                  +0.00%

                </p>

              </div>

            </div>

            {/* BTC */}

            <div className="bg-[#101A2C] border border-slate-800 rounded-2xl p-5 flex justify-between items-center">

              <div className="flex items-center gap-3">

                <Bitcoin className="text-yellow-400" />

                <div>

                  <h3 className="font-bold">

                    BTC

                  </h3>

                  <p className="text-slate-400">

                    Bitcoin

                  </p>

                </div>

              </div>

              <div className="text-right">

                <p className="font-bold">

                  Coming Soon

                </p>

              </div>

            </div>

            {/* ETH */}

            <div className="bg-[#101A2C] border border-slate-800 rounded-2xl p-5 flex justify-between items-center">

              <div>

                <h3 className="font-bold">

                  ETH

                </h3>

                <p className="text-slate-400">

                  Ethereum

                </p>

              </div>

              <div className="text-right">

                <p className="font-bold">

                  Coming Soon

                </p>

              </div>

            </div>

            {/* USDT */}

            <div className="bg-[#101A2C] border border-slate-800 rounded-2xl p-5 flex justify-between items-center">

              <div>

                <h3 className="font-bold">

                  USDT

                </h3>

                <p className="text-slate-400">

                  Tether

                </p>

              </div>

              <div className="text-right">

                <p className="font-bold">

                  Coming Soon

                </p>

              </div>

            </div>

          </div>

        </section>
        {/* ================= AI ASSISTANT ================= */}

        <section className="mt-10">

          <div className="rounded-[30px] bg-gradient-to-br from-cyan-500 to-blue-700 p-6 shadow-2xl">

            <div className="flex items-center gap-4">

              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">

                <Bot size={30} />

              </div>

              <div>

                <h2 className="text-2xl font-bold">

                  AI Trading

                </h2>

                <p className="text-cyan-100">

                  Intelligent Crypto Assistant

                </p>

              </div>

            </div>

            <p className="mt-6 leading-7 text-white/90">

              AI analyzes the crypto market in real time,
              detects opportunities, manages risk and will
              execute trading strategies automatically once enabled.

            </p>

            <div className="grid grid-cols-2 gap-4 mt-8">

              <div className="bg-white/10 rounded-2xl p-4">

                <p className="text-cyan-100">

                  Status

                </p>

                <h3 className="text-2xl font-bold mt-2">

                  READY

                </h3>

              </div>

              <div className="bg-white/10 rounded-2xl p-4">

                <p className="text-cyan-100">

                  Accuracy

                </p>

                <h3 className="text-2xl font-bold mt-2">

                  91%

                </h3>

              </div>

            </div>

            <Link
              href="/ai"
              className="block mt-8 w-full rounded-2xl bg-white text-blue-700 text-center font-bold py-4 hover:scale-[1.02] transition"
            >

              Open AI Trading

            </Link>

          </div>

        </section>

        {/* ================= PORTFOLIO ================= */}

        <section className="mt-10">

          <h2 className="text-2xl font-bold mb-5">

            Portfolio

          </h2>

          <div className="bg-[#101A2C] border border-slate-800 rounded-[30px] p-6">

            <div className="flex justify-center">

              <div className="w-44 h-44 rounded-full border-[12px] border-cyan-500 flex items-center justify-center">

                <div className="text-center">

                  <p className="text-slate-400">

                    Balance

                  </p>

                  <h2 className="text-3xl font-bold mt-3">

                    {balance.toFixed(4)} TON

                  </h2>

                </div>

              </div>

            </div>

            <div className="grid grid-cols-2 gap-4 mt-8">

              <div className="bg-[#17233B] rounded-2xl p-5">

                <p className="text-slate-400">

                  Assets

                </p>

                <h3 className="text-3xl font-bold mt-2">

                  4

                </h3>

                <p className="text-cyan-400 mt-2">

                  TON • BTC • ETH • USDT

                </p>

              </div>

              <div className="bg-[#17233B] rounded-2xl p-5">

                <p className="text-slate-400">

                  Performance

                </p>

                <h3 className="text-3xl font-bold mt-2 text-green-400">

                  +0%

                </h3>

                <p className="text-slate-400 mt-2">

                  Since creation

                </p>

              </div>

            </div>

            <div className="mt-6">

              <div className="flex justify-between mb-3">

                <span className="text-slate-400">

                  Portfolio Allocation

                </span>

                <span>

                  100%

                </span>

              </div>

              <div className="h-3 rounded-full bg-slate-700 overflow-hidden">

                <div className="h-full w-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-600"></div>

              </div>

            </div>

          </div>

        </section>
        {/* ================= RECENT TRANSACTIONS ================= */}

        <section className="mt-10">

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-2xl font-bold">
              Recent Transactions
            </h2>

            <Link
              href="/transactions"
              className="text-cyan-400 font-semibold"
            >
              View All
            </Link>

          </div>

          <div className="space-y-4">

            <div className="bg-[#101A2C] border border-slate-800 rounded-2xl p-5 flex items-center justify-between">

              <div>

                <h3 className="font-bold">
                  Deposit
                </h3>

                <p className="text-slate-400">
                  No deposit yet
                </p>

              </div>

              <span className="text-slate-500">
                --
              </span>

            </div>

            <div className="bg-[#101A2C] border border-slate-800 rounded-2xl p-5 flex items-center justify-between">

              <div>

                <h3 className="font-bold">
                  Withdraw
                </h3>

                <p className="text-slate-400">
                  No withdrawal yet
                </p>

              </div>

              <span className="text-slate-500">
                --
              </span>

            </div>

            <div className="bg-[#101A2C] border border-slate-800 rounded-2xl p-5 flex items-center justify-between">

              <div>

                <h3 className="font-bold">
                  AI Trading
                </h3>

                <p className="text-slate-400">
                  Waiting for first operation
                </p>

              </div>

              <span className="text-green-400">
                Ready
              </span>

            </div>

          </div>

        </section>

        {/* ================= PLATFORM STATUS ================= */}

        <section className="mt-10">

          <div className="bg-[#101A2C] border border-slate-800 rounded-[30px] p-6">

            <h2 className="text-2xl font-bold mb-6">

              Platform Status

            </h2>

            <div className="space-y-5">

              <div className="flex justify-between">

                <span className="text-slate-400">

                  Wallet

                </span>

                <span className="text-green-400 font-semibold">

                  Online

                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-400">

                  AI Trading

                </span>

                <span className="text-green-400 font-semibold">

                  Ready

                </span>

              </div>

              <div className="flex justify-between">

                <span className="text-slate-400">

                  Database

                </span>

                <span className="text-yellow-400 font-semibold">

                  Setup in progress

                </span>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* ================= BOTTOM NAVIGATION ================= */}

      <nav className="fixed bottom-0 left-0 right-0 bg-[#101A2C] border-t border-slate-800">

        <div className="max-w-md mx-auto flex justify-around py-4">

          <Link
            href="/dashboard"
            className="flex flex-col items-center text-cyan-400"
          >
            <Wallet size={22} />
            <span className="text-xs mt-1">
              Wallet
            </span>
          </Link>

          <Link
            href="/transactions"
            className="flex flex-col items-center text-slate-400"
          >
            <History size={22} />
            <span className="text-xs mt-1">
              History
            </span>
          </Link>

          <Link
            href="/ai"
            className="flex flex-col items-center text-slate-400"
          >
            <Bot size={22} />
            <span className="text-xs mt-1">
              AI
            </span>
          </Link>

          <Link
            href="/buy"
            className="flex flex-col items-center text-slate-400"
          >
            <CreditCard size={22} />
            <span className="text-xs mt-1">
              Buy
            </span>
          </Link>

          <Link
            href="/settings"
            className="flex flex-col items-center text-slate-400"
          >
            <Settings size={22} />
            <span className="text-xs mt-1">
              Settings
            </span>
          </Link>

        </div>

      </nav>

    </div>

  );
}